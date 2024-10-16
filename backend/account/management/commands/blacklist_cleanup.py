from django.core.management.base import BaseCommand
from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)


class Command(BaseCommand):
    help = "Delete expired tokens from the blacklist and outstanding tokens"

    def handle(self, *args, **options):
        now = timezone.now()

        # Delete expired blacklisted tokens
        expired_blacklisted_tokens = BlacklistedToken.objects.filter(
            token__expires_at__lt=now
        )
        blacklisted_count = expired_blacklisted_tokens.count()
        expired_blacklisted_tokens.delete()

        # Delete expired outstanding tokens
        expired_outstanding_tokens = OutstandingToken.objects.filter(expires_at__lt=now)
        outstanding_count = expired_outstanding_tokens.count()
        expired_outstanding_tokens.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully deleted {blacklisted_count} expired blacklisted tokens."
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully deleted {outstanding_count} expired outstanding tokens."
            )
        )
