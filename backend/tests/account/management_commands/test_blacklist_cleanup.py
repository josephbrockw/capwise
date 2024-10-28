import os
from io import StringIO

from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)


class BlacklistCleanupCommandTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/blacklist_cleanup.yaml"),
    ]

    def test_blacklist_cleanup_command(self):
        # Capture the output of the command
        out = StringIO()
        call_command("blacklist_cleanup", stdout=out)

        # Check the output
        self.assertIn(
            "Successfully deleted 1 expired blacklisted tokens.", out.getvalue()
        )
        self.assertIn(
            "Successfully deleted 1 expired outstanding tokens.", out.getvalue()
        )

        # Ensure the expired tokens are deleted
        self.assertEqual(BlacklistedToken.objects.count(), 0)
        self.assertEqual(
            OutstandingToken.objects.filter(expires_at__lt=timezone.now()).count(), 0
        )

        # Ensure the valid token is still there
        self.assertEqual(
            OutstandingToken.objects.filter(expires_at__gt=timezone.now()).count(), 1
        )
