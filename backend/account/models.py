import uuid
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils.timezone import now


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)


class OneTimePassword(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    token = models.CharField(max_length=64, unique=True, db_index=True)
    expires = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "otp"
        verbose_name = "One-Time Password"
        verbose_name_plural = "One-Time Passwords"

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = get_random_string(length=6, allowed_chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

        if not self.expires:
            self.expires = now() + timedelta(minutes=settings.OTP_EXPIRATION_MINUTES)
        super().save(*args, **kwargs)

    def is_valid(self):
        """
        Check if the OTP is still valid. Deactivates the OTP no matter the result.

        Returns:
            bool: True if the OTP is still valid, False otherwise.
        """
        is_valid = now() <= self.expires
        self.is_active = False
        self.save()
        return is_valid

