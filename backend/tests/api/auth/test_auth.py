import base64
import json
import os

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from tests import read_api_response


class LogInViewTestCase(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/auth.yaml"),
    ]

    def test_login_success(self):
        # Users should not be able to login if they are not verified
        url = "/api/auth/login"
        payload = {"username": "magrat", "password": "password123"}
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(err, "Authentication required. Please sign in.")

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

    def test_login_with_email(self):
        url = "/api/auth/login"
        payload = {"username": "gytha@lancre.gov", "password": "password123"}
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_200_OK)
        self.assertIn("access", data)
        self.assertIn("refresh", data)

    def test_login_with_username_matching_email(self):
        user = get_user_model().objects.get(email="gytha@lancre.gov")
        user.username = "gytha@lancre.gov"
        user.save()

        url = "/api/auth/login"
        payload = {"username": "gytha@lancre.gov", "password": "password123"}
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_200_OK)
        self.assertIn("access", data)
        self.assertIn("refresh", data)

    def test_login_with_nonexistent_email(self):
        url = "/api/auth/login"
        payload = {"username": "nonexistent@lancre.gov", "password": "password123"}
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(err, "Authentication required. Please sign in.")
        self.assertNotIn("access", data)
        self.assertNotIn("refresh", data)

    def test_login_with_email_wrong_password(self):
        url = "/api/auth/login"
        payload = {"username": "gytha@lancre.gov", "password": "wrongpassword"}
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(err, "Authentication required. Please sign in.")
        self.assertNotIn("access", data)
        self.assertNotIn("refresh", data)


class TokenRefreshViewTests(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/auth.yaml"),
    ]

    def test_refresh_token_success(self):
        # Obtain an access token
        data, msg, err, code = read_api_response(
            self.client.post(
                "/api/auth/login",
                {"username": "nanny", "password": "password123"},
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
        self.assertEqual(err, "refresh: No refresh token provided.")


class UserViewSetTest(APITestCase):
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
        self.refresh_token = str(refresh)
        # Set authorization header for requests
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_logout_user(self):
        # Logout using the refresh token
        response = self.client.post(
            "/api/auth/logout", data={"refresh": self.refresh_token}
        )
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "Logout successful.")

    def test_logout_user_invalid_token(self):
        # Attempt to logout using an invalid refresh token
        response = self.client.post(
            "/api/auth/logout", data={"refresh": "invalidtoken123"}
        )
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Could not complete logout.")

    def test_logout_user_unauthenticated(self):
        # Remove credentials to simulate unauthenticated request
        self.client.credentials()
        response = self.client.post(
            "/api/auth/logout", data={"refresh": self.refresh_token}
        )
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(err, "Authentication required. Please sign in.")
