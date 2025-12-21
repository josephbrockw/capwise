from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import get_user_model
from django.test import tag
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

    def test_change_password_success(self):
        password_data = {
            "current_password": "testpassword",
            "new_password": "newpassword123",
            "confirm_password": "newpassword123",
        }
        response = self.client.post("/api/users/change-password", data=password_data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "Password changed successfully.")

        # Verify the password was actually changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpassword123"))

    def test_change_password_incorrect_current(self):
        password_data = {
            "current_password": "wrongpassword",
            "new_password": "newpassword123",
            "confirm_password": "newpassword123",
        }
        response = self.client.post("/api/users/change-password", data=password_data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Current password is incorrect.")

        # Verify password was not changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("testpassword"))

    def test_change_password_mismatch(self):
        password_data = {
            "current_password": "testpassword",
            "new_password": "newpassword123",
            "confirm_password": "differentpassword",
        }
        response = self.client.post("/api/users/change-password", data=password_data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "New password and confirm password do not match.")

        # Verify password was not changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("testpassword"))

    def test_change_password_missing_current_password(self):
        password_data = {
            "new_password": "newpassword123",
            "confirm_password": "newpassword123",
        }
        response = self.client.post("/api/users/change-password", data=password_data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            err, "current_password, new_password, and confirm_password are required."
        )

    def test_change_password_missing_new_password(self):
        password_data = {
            "current_password": "testpassword",
            "confirm_password": "newpassword123",
        }
        response = self.client.post("/api/users/change-password", data=password_data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            err, "current_password, new_password, and confirm_password are required."
        )

    def test_change_password_missing_confirm_password(self):
        password_data = {
            "current_password": "testpassword",
            "new_password": "newpassword123",
        }
        response = self.client.post("/api/users/change-password", data=password_data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            err, "current_password, new_password, and confirm_password are required."
        )

    def test_change_password_empty_fields(self):
        password_data = {
            "current_password": "",
            "new_password": "",
            "confirm_password": "",
        }
        response = self.client.post("/api/users/change-password", data=password_data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            err, "current_password, new_password, and confirm_password are required."
        )

    def test_change_password_unauthenticated(self):
        # Remove credentials to simulate unauthenticated request
        self.client.credentials()
        password_data = {
            "current_password": "testpassword",
            "new_password": "newpassword123",
            "confirm_password": "newpassword123",
        }
        response = self.client.post("/api/users/change-password", data=password_data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(err, "Authentication required. Please sign in.")
