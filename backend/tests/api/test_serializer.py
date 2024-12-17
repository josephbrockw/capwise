from django.test import TestCase

from account.serializers import UserSerializer


class TestUserSerializer(TestCase):
    def test_valid_user_serializer(self):
        valid_serializer_data = {
            "username": "jsullivan",
            "email": "james@minc.com",
            "password": "password",
        }
        serializer = UserSerializer(data=valid_serializer_data)
        self.assertTrue(serializer.is_valid())
        for field, value in valid_serializer_data.items():
            self.assertEqual(serializer.validated_data[field], value)
        self.assertEqual(serializer.errors, {})

    def test_invalid_user_serializer(self):
        invalid_serializer_data = {
            "email": "james@minc.com",
            "password": "password",
        }
        serializer = UserSerializer(data=invalid_serializer_data)
        self.assertFalse(serializer.is_valid())
        self.assertEqual(serializer.validated_data, {})
        self.assertEqual(serializer.data, invalid_serializer_data)
        self.assertEqual(serializer.errors, {"username": ["This field is required."]})
