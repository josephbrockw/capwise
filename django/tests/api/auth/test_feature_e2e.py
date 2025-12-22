import base64
import json
import os

from rest_framework import status
from rest_framework.test import APITestCase

from account.models import OneTimePassword
from django.conf import settings
from django.contrib.auth import get_user_model
from tests import read_api_response
from tests.utils import mock_stripe

PASSWORD = "testpass123"
NEW_PASSWORD = "newtestpass123"


class AuthenticationTest(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/auth.yaml"),
    ]

    @mock_stripe()
    def test_full_auth_flow(self):
        # Step 1: Register new user
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/sign-up",
                data={
                    "username": "granny",
                    "email": "esme@lancre.gov",
                    "first_name": "Esmerelda",
                    "last_name": "Weatherwax",
                    "password1": PASSWORD,
                    "password2": PASSWORD,
                    "payment_method_id": "pm_123",
                    "productId": 1,
                    "tierId": 2,
                    "priceId": 4,
                },
            ),
        )
        assert code == status.HTTP_201_CREATED

        # Step 2: Attempt login (should fail due to unverified OTP)
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/login",
                data={
                    "username": "granny",
                    "password": PASSWORD,
                },
            )
        )
        assert code == status.HTTP_401_UNAUTHORIZED

        # Step 3: Verify OTP
        user = get_user_model().objects.get(username="granny")
        otp = OneTimePassword.objects.filter(user=user).order_by("-created").first()
        data, msg, err, code = read_api_response(
            self.client.post("/api/auth/verify", data={"token": otp.token})
        )
        assert code == status.HTTP_200_OK

        # Step 4: Successful login with remember_me
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/login",
                data={
                    "username": "granny",
                    "password": PASSWORD,
                    "remember_me": True,
                },
            )
        )
        assert code == status.HTTP_200_OK
        refresh_token = data["refresh"]

        # Verify remember_me extends token lifetime
        refresh_payload = json.loads(
            base64.b64decode(refresh_token.split(".")[1] + "==").decode("utf-8")
        )
        expected_lifetime_seconds = (
            settings.REMEMBER_ME_TOKEN_LIFETIME_DAYS * 24 * 60 * 60
        )
        token_lifetime = refresh_payload["exp"] - refresh_payload["iat"]
        # Token lifetime should be approximately REMEMBER_ME_TOKEN_LIFETIME_DAYS
        assert (
            abs(token_lifetime - expected_lifetime_seconds) < 60
        ), f"Token lifetime {token_lifetime}s should be ~{expected_lifetime_seconds}s"

        # Step 5: Refresh access token
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/refresh",
                data={"refresh": refresh_token},
            )
        )
        assert code == status.HTTP_200_OK
        access_token = data["access"]

        # Step 6: Access protected route with access token
        data, msg, err, code = read_api_response(
            self.client.get(
                "/api/users/me",
                HTTP_AUTHORIZATION=f"Bearer {access_token}",
            )
        )
        assert code == status.HTTP_200_OK

        # Step 7: Initiate password reset
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/password/reset",
                data={"email": "esme@lancre.gov"},
            )
        )
        assert code == status.HTTP_200_OK

        # Fetch New OTP for Password Reset
        otp = OneTimePassword.objects.filter(user=user).order_by("-created").first()

        # Step 8: Confirm password reset
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/password/reset/confirm",
                data={
                    "token": otp.token,
                    "password": NEW_PASSWORD,
                    "password_confirm": NEW_PASSWORD,
                },
            )
        )
        assert code == status.HTTP_200_OK

        # Step 9: Logout
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/logout",
                data={"refresh": refresh_token},
                HTTP_AUTHORIZATION=f"Bearer {access_token}",
            )
        )
        assert code == status.HTTP_200_OK

        # Step 10: Verify that refresh token is invalid after logout
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/refresh",
                data={"refresh": refresh_token},
            )
        )
        assert code == status.HTTP_401_UNAUTHORIZED

        # Step 11: Re-login with new password
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/login",
                data={
                    "username": "granny",
                    "password": NEW_PASSWORD,
                },
            )
        )
        assert code == status.HTTP_200_OK
        new_refresh_token = data["refresh"]

        # Step 12: Refresh access token after re-login
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/refresh",
                data={"refresh": new_refresh_token},
            )
        )
        assert code == status.HTTP_200_OK
        new_access_token = data["access"]

        # Step 13: Access protected route with new access token
        data, msg, err, code = read_api_response(
            self.client.get(
                "/api/users/me",
                HTTP_AUTHORIZATION=f"Bearer {new_access_token}",
            )
        )
        assert code == status.HTTP_200_OK
