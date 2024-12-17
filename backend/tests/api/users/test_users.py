from django.contrib.auth import get_user_model
from django.test import tag
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from tests import read_api_response


@tag("users")
class UserViewSetTest(APITestCase):
    def setUp(self):
        # Create a user to authenticate
        self.user = get_user_model().objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword",
            first_name="Test",
            last_name="User",
        )
        # Get JWT tokens for the user
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        # Set authorization header for requests
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_retrieve_user(self):
        response = self.client.get("/api/users/me")
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "User details retrieved successfully.")
        self.assertEqual(data["username"], self.user.username)
        self.assertEqual(data["email"], self.user.email)
        self.assertEqual(data["preferred_name"], "")
        self.assertEqual(data["first_name"], self.user.first_name)
        self.assertEqual(data["last_name"], self.user.last_name)

    def test_update_user(self):
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "preferred_name": "Preferred",
        }
        response = self.client.patch("/api/users/me", data=update_data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "User information updated successfully.")
        self.assertEqual(data["first_name"], update_data["first_name"])
        self.assertEqual(data["last_name"], update_data["last_name"])
        self.assertEqual(data["preferred_name"], update_data["preferred_name"])

    def test_partial_update_user(self):
        update_data = {
            "first_name": "PartiallyUpdated",
        }
        response = self.client.patch("/api/users/me", data=update_data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "User information updated successfully.")
        self.assertEqual(data["first_name"], update_data["first_name"])
        self.assertEqual(data["last_name"], self.user.last_name)

    def test_retrieve_user_unauthenticated(self):
        # Remove credentials to simulate unauthenticated request
        self.client.credentials()
        response = self.client.get("/api/users/me")
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(err, "Authentication required. Please sign in.")

    def test_update_user_unauthenticated(self):
        # Remove credentials to simulate unauthenticated request
        self.client.credentials()
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
        }
        response = self.client.patch("/api/users/me", data=update_data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(err, "Authentication required. Please sign in.")
