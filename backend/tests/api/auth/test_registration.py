import base64
import json
import os
from datetime import timedelta


from django.contrib.auth import get_user_model
from django.core import mail
from django.conf import settings
from django.utils.timezone import now
from rest_framework import status
from rest_framework.test import APITestCase

from account.models import User, OneTimePassword
from tests import read_api_response

PASSWORD = "testpass123"


class AuthenticationTest(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/auth.json"),
    ]
    username = "nanny"
    otp_token = "123456"
    new_user = "magrat"

    def test_user_can_sign_up(self):
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/sign-up",
                data={
                    "username": "granny",
                    "email": "esme@lancre.gov",
                    "first_name": "Esmerelda",
                    "last_name": "Weatherwax",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                },
            )
        )

        # Check that the user was created
        user = get_user_model().objects.get(username="granny")
        self.assertEqual(status.HTTP_201_CREATED, code)
        self.assertEqual(data["id"], str(user.id))
        self.assertEqual(data["username"], user.username)
        self.assertEqual(data["email"], user.email)
        self.assertEqual(data["first_name"], user.first_name)
        self.assertEqual(data["last_name"], user.last_name)

        # User needs to verify email before becoming active
        self.assertFalse(user.is_active)

        # Check that an OTP was created
        otp = OneTimePassword.objects.get(user=user)
        self.assertTrue(otp.is_active)
        self.assertEqual(len(otp.token), 20)

        # Verify that one email was sent
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.subject, "Verify your email")
        self.assertEqual(email.to, [user.email])

        # Check the HTML version of the email (from email.alternatives)
        html_content = email.alternatives[0][0]  # The first item in 'alternatives' is the HTML content

        # Assert that the correct verification URL is present in the HTML content
        self.assertIn(f"{settings.FRONTEND_URL}/verify?token={otp.token}", html_content)

        # Optionally, you can check for other key pieces of content in the HTML
        self.assertIn("Hi, Esmerelda!", html_content)  # Salutation check
        self.assertIn("Please click the button below to verify your email address.", html_content)

    def test_user_cannot_sign_up_with_existing_username(self):
        data, message, error, code = read_api_response(
            self.client.post(
                "/api/sign-up",
                data={
                    "username": self.username,
                    "email": "jason@discworld.com",
                    "first_name": "Jason",
                    "last_name": "Ogg",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                },
            )
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, code)
        self.assertEqual(
            message, "An error occurred"
        )
        self.assertEqual(
            error["username"][0], "A user with that username already exists."
        )

    def test_user_cannot_sign_up_with_existing_email(self):
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/sign-up",
                data={
                    "username": "jasonogg",
                    "email": "gytha@lancre.gov",
                    "first_name": "Jason",
                    "last_name": "Ogg",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                },
            )
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, code)
        self.assertEqual(
            msg, "An error occurred"
        )
        self.assertEqual(
            err["non_field_errors"][0], "Email is already associated with an account."
        )

    def test_user_can_verify_email(self):
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/verify-email",
                data={"token": self.otp_token}
            )
        )
        otp = OneTimePassword.objects.get(token=self.otp_token)
        user = get_user_model().objects.get(username=self.new_user)
        self.assertEqual(code, status.HTTP_200_OK)
        self.assertTrue(user.is_active)
        self.assertFalse(otp.is_active)
        self.assertEqual(msg, "Email verified successfully.")

    def test_verify_email_with_invalid_token(self):
        otp = OneTimePassword.objects.get(token=self.otp_token)
        otp.is_valid()
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/verify-email",
                data={"token": self.otp_token}
            )
        )

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Invalid or expired token.")

    def test_verify_email_with_expired_token(self):
        otp = OneTimePassword.objects.get(token=self.otp_token)
        otp.expires = now() - timedelta(minutes=1)
        otp.save()
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/verify-email",
                data={"token": self.otp_token}
            )
        )

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Invalid or expired token.")

    def test_user_can_log_in(self):  # new
        user = User.objects.get(username="nanny")
        response = self.client.post(
            "/api/login",
            data={
                "username": "nanny",
                "password": PASSWORD,
            },
        )

        # Parse payload data from access token.
        access = response.data["access"]
        header, payload, signature = access.split(".")
        decoded_payload = base64.b64decode(f"{payload}==")
        payload_data = json.loads(decoded_payload)

        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertIsNotNone(response.data["refresh"])
        self.assertEqual(payload_data["id"], str(user.id))
        self.assertEqual(payload_data["username"], user.username)
        self.assertEqual(payload_data["first_name"], user.first_name)
        self.assertEqual(payload_data["last_name"], user.last_name)

    def test_user_login_fails_with_invalid_credentials(self):
        response = self.client.post(
            "/api/login",
            data={
                "username": self.username,
                "password": "wrongpassword",
            },
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)
        self.assertEqual(
            response.data["detail"],
            "No active account found with the given credentials",
        )
