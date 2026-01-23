import base64
import json
import os

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings
from django.contrib.auth import get_user_model
from django.urls import reverse
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

        # Check that user data is in the response body
        self.assertIn("user", data)
        self.assertEqual(data["user"]["id"], str(user.id))
        self.assertEqual(data["user"]["username"], user.username)
        self.assertEqual(data["user"]["email"], user.email)
        self.assertEqual(data["user"]["first_name"], user.first_name)
        self.assertEqual(data["user"]["last_name"], user.last_name)
        self.assertIn("is_superuser", data["user"])
        self.assertFalse(data["user"]["is_superuser"])

        # Check teams and default_team are in response (magrat has no teams)
        self.assertIn("teams", data)
        self.assertIn("default_team", data)
        self.assertEqual(data["teams"], [])
        self.assertIsNone(data["default_team"])

        # Check that user data is also embedded in JWT token payload
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

    def test_login_returns_is_superuser_true_for_superuser(self):
        """Login should return is_superuser=True for superusers."""
        user = get_user_model().objects.get(username="magrat")
        user.is_superuser = True
        user.save()

        url = "/api/auth/login"
        payload = {"username": "magrat", "password": "password123"}
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_200_OK)
        self.assertIn("user", data)
        self.assertIn("is_superuser", data["user"])
        self.assertTrue(data["user"]["is_superuser"])

    def test_login_returns_user_teams(self):
        """Login should return user's teams and default_team."""
        url = "/api/auth/login"
        payload = {"username": "nanny", "password": "password123"}
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_200_OK)

        # Check teams are returned
        self.assertIn("teams", data)
        self.assertEqual(len(data["teams"]), 1)
        team = data["teams"][0]
        self.assertEqual(team["id"], "bbbbbbbb-cccc-dddd-eeee-ffffffffffff")
        self.assertEqual(team["name"], "Nanny's Team")
        self.assertEqual(team["league_id"], "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
        self.assertEqual(team["league_name"], "Test League")

        # default_team should be None since not set
        self.assertIn("default_team", data)
        self.assertIsNone(data["default_team"])

    def test_login_returns_default_team(self):
        """Login should return default_team when set."""
        from league.models import Team

        user = get_user_model().objects.get(username="nanny")
        team = Team.objects.get(pk="bbbbbbbb-cccc-dddd-eeee-ffffffffffff")
        user.default_team = team
        user.save()

        url = "/api/auth/login"
        payload = {"username": "nanny", "password": "password123"}
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_200_OK)

        # Check default_team is returned
        self.assertIn("default_team", data)
        self.assertIsNotNone(data["default_team"])
        self.assertEqual(
            data["default_team"]["id"], "bbbbbbbb-cccc-dddd-eeee-ffffffffffff"
        )
        self.assertEqual(data["default_team"]["name"], "Nanny's Team")
        self.assertEqual(
            data["default_team"]["league_id"], "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
        )
        self.assertEqual(data["default_team"]["league_name"], "Test League")

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

    def test_login_with_remember_me_true(self):
        """Login with remember_me=True should return tokens with extended lifetime."""
        url = "/api/auth/login"
        payload = {
            "username": "gytha@lancre.gov",
            "password": "password123",
            "remember_me": True,
        }
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_200_OK)
        self.assertIn("access", data)
        self.assertIn("refresh", data)

        # Decode refresh token and verify extended expiration
        refresh_payload = json.loads(
            base64.b64decode(data["refresh"].split(".")[1] + "==").decode("utf-8")
        )
        # Token exp should be approximately REMEMBER_ME_TOKEN_LIFETIME_DAYS from now
        expected_lifetime_seconds = (
            settings.REMEMBER_ME_TOKEN_LIFETIME_DAYS * 24 * 60 * 60
        )
        token_lifetime = refresh_payload["exp"] - refresh_payload["iat"]
        # Allow 60 seconds tolerance for test execution time
        self.assertAlmostEqual(token_lifetime, expected_lifetime_seconds, delta=60)

    def test_login_with_remember_me_false(self):
        """Login with remember_me=False should return tokens with normal lifetime."""
        url = "/api/auth/login"
        payload = {
            "username": "gytha@lancre.gov",
            "password": "password123",
            "remember_me": False,
        }
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_200_OK)
        self.assertIn("access", data)
        self.assertIn("refresh", data)

        # Decode refresh token and verify normal expiration (1 day default)
        refresh_payload = json.loads(
            base64.b64decode(data["refresh"].split(".")[1] + "==").decode("utf-8")
        )
        expected_lifetime_seconds = int(
            settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()
        )
        token_lifetime = refresh_payload["exp"] - refresh_payload["iat"]
        # Allow 60 seconds tolerance for test execution time
        self.assertAlmostEqual(token_lifetime, expected_lifetime_seconds, delta=60)

    def test_login_without_remember_me_defaults_to_normal_lifetime(self):
        """Login without remember_me field should default to normal token lifetime."""
        url = "/api/auth/login"
        payload = {"username": "gytha@lancre.gov", "password": "password123"}
        data, msg, err, code = read_api_response(
            self.client.post(url, payload, format="json")
        )
        self.assertEqual(code, status.HTTP_200_OK)
        self.assertIn("access", data)
        self.assertIn("refresh", data)

        # Decode refresh token and verify normal expiration (1 day default)
        refresh_payload = json.loads(
            base64.b64decode(data["refresh"].split(".")[1] + "==").decode("utf-8")
        )
        expected_lifetime_seconds = int(
            settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()
        )
        token_lifetime = refresh_payload["exp"] - refresh_payload["iat"]
        # Allow 60 seconds tolerance for test execution time
        self.assertAlmostEqual(token_lifetime, expected_lifetime_seconds, delta=60)


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
