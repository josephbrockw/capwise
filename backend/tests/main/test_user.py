from django.test import TestCase

from account.models import User


class TestUser(TestCase):
    def test_user_model(self):
        user = User(
            username="jsullivan",
            email="james@minc.com",
            password="password",
            first_name="James",
            last_name="Sullivan",
        )
        user.save()

        self.assertEqual(user.username, "jsullivan")
        self.assertEqual(user.email, "james@minc.com")
        self.assertEqual(user.password, "password")
        self.assertEqual(user.first_name, "James")
        self.assertEqual(user.last_name, "Sullivan")
