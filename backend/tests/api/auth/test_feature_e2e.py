import base64
import json
import os
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils.timezone import now
from rest_framework import status
from rest_framework.test import APITestCase

from account.models import OneTimePassword, User
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
            "/api/login",
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

        response = self.client.post(
            "/api/login",
            data={
                "username": "granny",
                "password": PASSWORD,
            },
        )
        assert response.status_code == status.HTTP_200_OK
