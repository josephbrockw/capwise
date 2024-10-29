import os
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core import mail
from django.utils.timezone import now
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from account.models import OneTimePassword
from tests import read_api_response


class PasswordResetTests(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/auth.yaml"),
    ]

    def setUp(self):
        # Create a user to authenticate
        self.user = get_user_model().objects.get(username="nanny")
        # Get JWT tokens for the user
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        # Set authorization header for requests
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_password_reset_initiate(self):
        response = self.client.post(
            "/api/auth/password/reset", data={"email": self.user.email}
        )
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(
            msg, "If an account with that email exists, an email will be sent."
        )
        self.assertTrue(
            OneTimePassword.objects.filter(user=self.user, is_active=True).exists()
        )

        # Assert email content
        self.assertEqual(len(mail.outbox), 1)
        email_instance = mail.outbox[0]
        self.assertEqual(email_instance.subject, "Reset your password")
        self.assertIn(self.user.email, email_instance.to)
        html_content = (
            email_instance.alternatives[0][0]
            if email_instance.alternatives
            else email_instance.body
        )
        self.assertIn("Hi, Gytha!", html_content)
        self.assertIn(
            "Please click the button below to reset your password.", html_content
        )
        self.assertIn("Reset Password", html_content)

    def test_password_reset_initiate_email_not_found(self):
        response = self.client.post(
            "/api/auth/password/reset", data={"email": "not-real@test.com"}
        )
        data, msg, err, code = read_api_response(response)
        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(
            msg, "If an account with that email exists, an email will be sent."
        )

    def test_password_reset_confirm(self):
        # Create an OTP for password reset
        otp = OneTimePassword.objects.create(user=self.user, token_length=20)

        response = self.client.post(
            "/api/auth/password/reset/confirm",
            data={
                "token": otp.token,
                "password": "newpassword",
                "password_confirm": "newpassword",
            },
        )
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "Password reset successfully.")
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpassword"))

        # Assert email content
        self.assertEqual(len(mail.outbox), 1)
        email_instance = mail.outbox[0]
        html_content = (
            email_instance.alternatives[0][0]
            if email_instance.alternatives
            else email_instance.body
        )
        self.assertEqual(email_instance.subject, "Password Changed")
        self.assertIn(self.user.email, email_instance.to)
        self.assertIn("Hi, Gytha!", html_content)
        self.assertIn(
            "This is a confirmation that the password for your account has "
            "just been changed.",
            html_content,
        )
        self.assertIn(
            "If you did not make this change, please contact us immediately.",
            html_content,
        )

    def test_password_reset_invalid_token(self):
        otp = OneTimePassword.objects.create(user=self.user, token_length=20)
        otp.is_active = False
        otp.save()
        response = self.client.post(
            "/api/auth/password/reset/confirm",
            data={
                "token": otp.token,
                "password": "newpassword",
                "password_confirm": "newpassword",
            },
        )
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Invalid or expired token.")

    def test_password_reset_token_expired(self):
        otp = OneTimePassword.objects.create(user=self.user, token_length=20)
        otp.expires = now() - timedelta(minutes=1)
        otp.save()
        response = self.client.post(
            "/api/auth/password/reset/confirm",
            data={
                "token": otp.token,
                "password": "newpassword",
                "password_confirm": "newpassword",
            },
        )
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Invalid or expired token.")

    def test_password_reset_passwords_do_not_match(self):
        otp = OneTimePassword.objects.create(user=self.user, token_length=20)

        response = self.client.post(
            "/api/auth/password/reset/confirm",
            data={
                "token": otp.token,
                "password": "newpassword",
                "password_confirm": "differentpassword",
            },
        )
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Passwords must match.")

    def test_password_reset_missing_token(self):
        response = self.client.post(
            "/api/auth/password/reset/confirm",
            data={"password": "newpassword", "password_confirm": "newpassword"},
        )
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "The 'token' field is required to reset the password.")

    def test_password_reset_missing_password(self):
        otp = OneTimePassword.objects.create(user=self.user, token_length=20)

        response = self.client.post(
            "/api/auth/password/reset/confirm",
            data={"token": otp.token, "password_confirm": "newpassword"},
        )
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "The 'password' field is required to reset the password.")
