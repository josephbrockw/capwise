import os
from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase

User = get_user_model()


class UserActivationCommandTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [os.path.join(base_dir, "fixtures", "user_management.yaml")]

    def test_activate_user(self):
        out = StringIO()
        call_command("user_activation", "magrat@lancre.gov", "activate", stdout=out)
        user = User.objects.get(username="magrat")
        self.assertTrue(user.is_active)
        self.assertIn('User "magrat@lancre.gov" has been activated.', out.getvalue())

    def test_activate_already_active_user(self):
        out = StringIO()
        call_command("user_activation", "gytha@lancre.gov", "activate", stdout=out)
        self.assertIn('User "gytha@lancre.gov" is already active.', out.getvalue())

    def test_deactivate_user(self):
        out = StringIO()
        call_command("user_activation", "gytha@lancre.gov", "deactivate", stdout=out)
        user = User.objects.get(username="nanny")
        self.assertFalse(user.is_active)
        self.assertIn('User "gytha@lancre.gov" has been deactivated.', out.getvalue())

    def test_deactivate_already_deactivated_user(self):
        out = StringIO()
        call_command("user_activation", "magrat@lancre.gov", "deactivate", stdout=out)
        self.assertIn(
            'User "magrat@lancre.gov" is already deactivated.', out.getvalue()
        )

    def test_user_does_not_exist(self):
        out = StringIO()
        call_command("user_activation", "nonexistentuser", "activate", stdout=out)
        self.assertIn('User "nonexistentuser" does not exist.', out.getvalue())

    def test_user_activation_invalid_argument(self):
        out = StringIO()
        with self.assertRaises(CommandError):
            call_command(
                "user_activation", "magrat@lancre.gov", "invalid_action", stdout=out
            )
            self.assertIn(
                'Invalid action "invalid_action". Use "activate" or "deactivate".',
                out.getvalue(),
            )
