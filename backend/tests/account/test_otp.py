from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from account.models import OneTimePassword
from worker.tasks import delete_invalid_otps


class DeleteExpiredOtpsTaskTest(APITestCase):

    def test_delete_expired_otps(self):
        now = timezone.now()
        user = get_user_model().objects.create_user(
            username="testuser", password="testpass"
        )

        # Create OTPs
        otp1 = OneTimePassword.objects.create(
            expires=now - timezone.timedelta(days=1), is_active=True, user=user
        )
        otp2 = OneTimePassword.objects.create(
            expires=now - timezone.timedelta(days=2), is_active=False, user=user
        )
        otp3 = OneTimePassword.objects.create(
            expires=now + timezone.timedelta(days=1), is_active=False, user=user
        )
        otp4 = OneTimePassword.objects.create(
            expires=now + timezone.timedelta(days=1), is_active=True, user=user
        )

        # Invoke the task
        delete_invalid_otps()

        # Assert OTPs are deleted correctly
        self.assertFalse(OneTimePassword.objects.filter(id=otp1.id).exists())
        self.assertFalse(OneTimePassword.objects.filter(id=otp2.id).exists())
        self.assertFalse(OneTimePassword.objects.filter(id=otp3.id).exists())
        self.assertTrue(OneTimePassword.objects.filter(id=otp4.id).exists())
