import os

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from account.models import OneTimePassword
from tests import read_api_response

PASSWORD = "testpass123"


class AuthenticationTest(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/auth.json"),
    ]

    def test_register_new_user(self):
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
                },
            )
        )
        assert code == status.HTTP_201_CREATED
        response = self.client.post(
            "/api/auth/login",
            data={
                "username": "granny",
                "password": PASSWORD,
            },
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        user = get_user_model().objects.get(username="granny")
        otp = OneTimePassword.objects.filter(user=user).order_by("-created").first()

        data, msg, err, code = read_api_response(
            self.client.post("/api/auth/verify", data={"token": otp.token})
        )
        assert code == status.HTTP_200_OK

        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/login",
                data={
                    "username": "granny",
                    "password": PASSWORD,
                },
            )
        )
        assert code == status.HTTP_200_OK

        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/refresh",
                data={"refresh": data["refresh"]},
            )
        )
        assert code == status.HTTP_200_OK

        # TODO: Add a test for getting response with a new access token
        data, msg, err, code = read_api_response(
            self.client.get(
                "/api/users/me",
                HTTP_AUTHORIZATION=f"Bearer {data['access']}",
            )
        )
        assert code == status.HTTP_200_OK
        # TODO: Add a test for the /api/auth/logout endpoint
