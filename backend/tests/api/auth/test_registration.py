import base64
import json
import os
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings, tag
from django.utils.timezone import now
from rest_framework import status
from rest_framework.test import APITestCase

from account.models import OneTimePassword, User
from tests import read_api_response
from tests.utils import mock_stripe

PASSWORD = "password123"


@tag("auth")
class AuthenticationTest(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/auth.yaml"),
    ]
    username = "nanny"
    otp_token = "123456"
    new_user = "magrat"

    @mock_stripe()
    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_user_can_sign_up(self):
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/sign-up",
                data={
                    "email": "esme@lancre.gov",
                    "first_name": "Esmerelda",
                    "last_name": "Weatherwax",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                    "priceId": 4,
                    "productId": 1,
                    "tierId": 2,
                    "payment_method_id": "pm_123",
                },
            ),
        )

        # Check that the user was created
        user = get_user_model().objects.get(username="esme@lancre.gov")
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
        self.assertEqual(len(otp.token), 6)

        # Verify that one email was sent
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.subject, "Verify your email")
        self.assertEqual(email.to, [user.email])

        # Check the HTML version of the email (from email.alternatives)
        html_content = email.alternatives[0][0] if email.alternatives else email.body

        # Assert that the correct verification URL is present in the HTML content
        self.assertIn(f"{settings.FRONTEND_URL}/verify?token={otp.token}", html_content)

        # Optionally, you can check for other key pieces of content in the HTML
        self.assertIn("Hi, Esmerelda!", html_content)  # Salutation check
        self.assertIn(
            "Please click the button below to verify your email address.", html_content
        )

    @mock_stripe()
    def test_user_can_signup_with_custom_username(self):
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/sign-up",
                data={
                    "username": "jasonogg",
                    "email": "jason@discworld.com",
                    "first_name": "Jason",
                    "last_name": "Ogg",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                    "payment_method_id": "pm_123",
                    "priceId": 4,
                    "productId": 1,
                    "tierId": 2,
                },
            )
        )
        self.assertEqual(status.HTTP_201_CREATED, code)
        self.assertEqual(data["username"], "jasonogg")
        self.assertTrue(User.objects.filter(username="jasonogg").exists())

    def test_user_cannot_sign_up_with_existing_username(self):
        data, message, error, code = read_api_response(
            self.client.post(
                "/api/auth/sign-up",
                data={
                    "username": self.username,
                    "email": "jason@discworld.com",
                    "first_name": "Jason",
                    "last_name": "Ogg",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                    "payment_method_id": "pm_123",
                },
            )
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, code)
        self.assertEqual(error, "Username is already taken.")

    def test_user_cannot_sign_up_with_existing_email(self):
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/sign-up",
                data={
                    "username": "jasonogg",
                    "email": "gytha@lancre.gov",
                    "first_name": "Jason",
                    "last_name": "Ogg",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                    "payment_method_id": "pm_123",
                },
            )
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, code)
        self.assertEqual(err, "Email is already associated with an account.")

    def test_user_cannot_sign_up_with_passwords_not_matching(self):
        """Test that sign up fails when the provided passwords do not match."""
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/sign-up",
                data={
                    "username": "granny2",
                    "email": "granny2@lancre.gov",
                    "first_name": "Granny",
                    "last_name": "Weatherwax",
                    "password1": PASSWORD,
                    "password2": PASSWORD + "123",
                    "payment_method_id": "pm_123",
                },
            )
        )
        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Passwords must match.")

    @override_settings(PAYMENT_REQUIRED=True)
    def test_user_cannot_sign_up_without_required_fields(self):
        # payment method id
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/sign-up",
                data={
                    "username": "jasonogg",
                    "email": "jason@discworld.com",
                    "first_name": "Jason",
                    "last_name": "Ogg",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                    "priceId": 4,
                    "productId": 1,
                    "tierId": 2,
                },
            )
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, code)

        # priceId
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/sign-up",
                data={
                    "username": "jasonogg",
                    "email": "jason@discworld.com",
                    "first_name": "Jason",
                    "last_name": "Ogg",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                    "payment_method_id": "pm_123",
                    "productId": 1,
                    "tierId": 2,
                },
            )
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, code)

        # productId
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/sign-up",
                data={
                    "username": "jasonogg",
                    "email": "jason@discworld.com",
                    "first_name": "Jason",
                    "last_name": "Ogg",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                    "payment_method_id": "pm_123",
                    "priceId": 4,
                    "tierId": 2,
                },
            )
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, code)

        # tierId
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/sign-up",
                data={
                    "username": "jasonogg",
                    "email": "jason@discworld.com",
                    "first_name": "Jason",
                    "last_name": "Ogg",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                    "payment_method_id": "pm_123",
                    "priceId": 4,
                    "productId": 1,
                },
            )
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, code)

    @override_settings(PAYMENT_REQUIRED=False)
    def test_user_can_sign_up_without_payment_if_payment_not_required(self):
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/sign-up",
                data={
                    "username": "jasonogg",
                    "email": "jason@discworld.com",
                    "first_name": "Jason",
                    "last_name": "Ogg",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                },
            )
        )

        self.assertEqual(status.HTTP_201_CREATED, code)

    def test_user_can_verify_email(self):
        data, msg, err, code = read_api_response(
            self.client.post("/api/auth/verify", data={"token": self.otp_token})
        )
        otp = OneTimePassword.objects.get(token=self.otp_token)
        user = get_user_model().objects.get(username=self.new_user)
        self.assertEqual(code, status.HTTP_200_OK)
        self.assertTrue(user.is_active)
        self.assertFalse(otp.is_active)
        self.assertEqual(msg, "Email verified successfully.")

    def test_verify_email_without_token(self):
        """Test verification without providing a token."""
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/verify",
                data={},
            )
        )
        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "The 'token' field is required to verify the email.")

    def test_verify_email_with_invalid_token(self):
        otp = OneTimePassword.objects.get(token=self.otp_token)
        otp.is_valid()
        data, msg, err, code = read_api_response(
            self.client.post("/api/auth/verify", data={"token": self.otp_token})
        )

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Invalid or expired token.")

    def test_verify_email_with_expired_token(self):
        otp = OneTimePassword.objects.get(token=self.otp_token)
        otp.expires = now() - timedelta(minutes=1)
        otp.save()
        data, msg, err, code = read_api_response(
            self.client.post("/api/auth/verify", data={"token": self.otp_token})
        )

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Invalid or expired token.")

    def test_user_initiate_verify_resend(self):
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/resend-verify",
                data={
                    "email": "magrat@lancre.gov",
                },
            )
        )
        self.assertEqual(code, status.HTTP_200_OK)

        user = get_user_model().objects.get(username=self.new_user)
        self.assertFalse(user.is_active)

        # Check that an OTP was created
        otp = OneTimePassword.objects.filter(user=user).order_by("-created").first()
        self.assertTrue(otp.is_active)
        self.assertEqual(len(otp.token), 6)

        # Verify that one email was sent
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.subject, "Verify your email")
        self.assertEqual(email.to, [user.email])

        # Check the HTML version of the email (from email.alternatives)
        html_content = email.alternatives[0][
            0
        ]  # The first item in 'alternatives' is the HTML content

        # Assert that the correct verification URL is present in the HTML content
        self.assertIn(f"{settings.FRONTEND_URL}/verify?token={otp.token}", html_content)

        # Optionally, you can check for other key pieces of content in the HTML
        self.assertIn("Hi, Magrat!", html_content)  # Salutation check
        self.assertIn(
            "Please click the button below to verify your email address.", html_content
        )

    def test_user_cannot_resend_verification_for_nonexistent_email(self):
        """
        Test that a user cannot request verification resend for a
        non-existent email.
        """
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/resend-verify",
                data={
                    "email": "notexist@lancre.gov",
                },
            )
        )
        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "User not found.")

    def test_user_cannot_resend_verification_for_verified_user(self):
        """
        Test that a user who is already verified cannot request email
        verification resend.
        """
        user = get_user_model().objects.get(username=self.new_user)
        user.is_active = True
        user.save()

        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/resend-verify",
                data={
                    "email": user.email,
                },
            )
        )
        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "User is already verified.")

    def test_user_can_log_in(self):
        user = User.objects.get(username="nanny")
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/login",
                data={
                    "username": "nanny",
                    "password": "password123",
                },
            ),
        )

        # Parse payload data from access token.
        access = data["access"]
        header, payload, signature = access.split(".")
        decoded_payload = base64.b64decode(f"{payload}==")
        payload_data = json.loads(decoded_payload)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertIsNotNone(data["refresh"])
        self.assertEqual(payload_data["id"], str(user.id))
        self.assertEqual(payload_data["username"], user.username)
        self.assertEqual(payload_data["first_name"], user.first_name)
        self.assertEqual(payload_data["last_name"], user.last_name)

    def test_user_login_fails_with_invalid_credentials(self):
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/login",
                data={
                    "username": self.username,
                    "password": "wrongpassword",
                },
            ),
        )
        self.assertEqual(code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(err, "Authentication required. Please sign in.")

    def test_user_can_not_log_in_if_unverified(self):
        """Test that login fails if the user's email is not verified."""
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/login",
                data={
                    "username": self.new_user,
                    "password": PASSWORD,
                },
            )
        )
        self.assertEqual(code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(err, "Authentication required. Please sign in.")
