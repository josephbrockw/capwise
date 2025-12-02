import uuid
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.crypto import get_random_string
from django.utils.timezone import now


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    preferred_name = models.CharField(max_length=30, blank=True)
    payment_method_id = models.CharField(max_length=255, blank=True, null=True)

    @property
    def name(self):
        if self.preferred_name:
            return self.preferred_name
        elif self.first_name:
            return self.first_name
        else:
            return self.username

    def salutation(self):
        return f"Hi, {self.name}!"


class OneTimePassword(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True
    )
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created = models.DateTimeField(auto_now_add=True)
    expires = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __init__(self, *args, token_length=6, **kwargs):
        self.token_length = token_length
        super().__init__(*args, **kwargs)

    class Meta:
        db_table = "otp"
        verbose_name = "One-Time Password"
        verbose_name_plural = "One-Time Passwords"

    def save(self, *args, **kwargs):
        # Users should only have one token at a time
        if OneTimePassword.objects.filter(user=self.user, is_active=True).exists():
            if self.pk:
                OneTimePassword.objects.filter(user=self.user).exclude(
                    id=self.id
                ).update(is_active=False)
            else:
                OneTimePassword.objects.filter(user=self.user).update(is_active=False)

        if not self.token:
            self.token = get_random_string(
                length=self.token_length,
                allowed_chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            )

        if not self.expires:
            self.expires = now() + timedelta(
                minutes=int(settings.OTP_EXPIRATION_MINUTES)
            )

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
