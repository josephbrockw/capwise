import base64
import json
import os

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from tests import read_api_response


class LogInViewTestCase(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/auth.json"),
    ]

    def test_login_success(self):
        # Users should not be able to login if they are not verified
        url = "/api/auth/login"
        payload = {"username": "magrat", "password": "testpass123"}
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(err, "No active account found with the given credentials")

        # Verify the user
        user = get_user_model().objects.get(username="magrat")
        user.is_active = True
        user.save()

        # Users should be able to login if they are verified
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_200_OK)
        self.assertIn("access", data)
        self.assertIn("refresh", data)
        header, payload, signature = data["access"].split(".")
        header = json.loads(base64.b64decode(header + "==").decode("utf-8"))
        self.assertEqual(header["alg"], "HS256")
        self.assertEqual(header["typ"], "JWT")
        payload = json.loads(base64.b64decode(payload + "==").decode("utf-8"))
        self.assertEqual(payload["id"], str(user.id))
        self.assertEqual(payload["username"], user.username)
        self.assertEqual(payload["email"], user.email)
        self.assertEqual(payload["first_name"], user.first_name)
        self.assertEqual(payload["last_name"], user.last_name)

    def test_login_failure(self):
        url = "/api/auth/login"
        data = {"username": "test_user", "password": "wrongpassword"}
        data, msg, err, code = read_api_response(
            self.client.post(url, data, format="json")
        )
        self.assertEqual(code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn("access", data)
        self.assertNotIn("refresh", data)


class TokenRefreshViewTests(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/auth.json"),
    ]

    def test_refresh_token_success(self):
        # Obtain an access token
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/login",
                {"username": "nanny", "password": "testpass123"},
                format="json",
            )
        )
        self.assertEqual(code, status.HTTP_200_OK)
        refresh_token = data["refresh"]

        # Refresh the access token
        data, msg, error, code = read_api_response(
            self.client.post(
                reverse("token_refresh"), {"refresh": refresh_token}, format="json"
            )
        )
        self.assertEqual(code, status.HTTP_200_OK)
        self.assertIn("access", data)

    def test_refresh_token_missing_refresh_token(self):
        # Try to refresh without providing the refresh token
        data, msg, err, code = read_api_response(
            self.client.post(reverse("token_refresh"), {})
        )
        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "No refresh token provided.")
