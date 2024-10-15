from datetime import timedelta

from account.models import OneTimePassword
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils.timezone import now

User = get_user_model()


class OneTimePasswordModelTest(TestCase):
    def setUp(self):
        # Create a user for testing
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )

    def test_create_otp_with_default_token_length(self):
        """Test creating a OneTimePassword with default token length (6 characters)"""
        otp = OneTimePassword.objects.create(user=self.user)

        # Check that token length is 6 (default)
        self.assertEqual(len(otp.token), 6)
        self.assertTrue(otp.is_active)

    def test_create_otp_with_custom_token_length(self):
        """Test creating a OneTimePassword with custom token length"""
        otp = OneTimePassword(user=self.user, token_length=8)
        otp.save()

        # Check that token length is 8 (custom length)
        self.assertEqual(len(otp.token), 8)
        self.assertTrue(otp.is_active)

    def test_token_generation_if_not_provided(self):
        """Test that token is generated automatically if not provided"""
        otp = OneTimePassword(user=self.user)
        otp.save()

        # Ensure the token is automatically generated
        self.assertIsNotNone(otp.token)
        self.assertEqual(len(otp.token), 6)  # Default length of 6

    def test_prevent_multiple_active_tokens(self):
        """Test that only one active OneTimePassword per user is allowed"""
        # Create first OTP
        otp1 = OneTimePassword.objects.create(user=self.user)

        # Create second OTP which should deactivate the first one
        otp2 = OneTimePassword.objects.create(user=self.user)

        # Check that the first OTP is deactivated
        otp1.refresh_from_db()
        self.assertFalse(otp1.is_active)
        self.assertTrue(otp2.is_active)

    def test_auto_expiration_setting(self):
        """
        Test that expiration date is set correctly based on the
        default expiration time
        """
        otp = OneTimePassword.objects.create(user=self.user)

        # Ensure the expiration is set based on the setting (e.g., 10 minutes)
        expected_expiration = now() + timedelta(
            minutes=15
        )  # Assuming settings.OTP_EXPIRATION_MINUTES = 10
        self.assertAlmostEqual(
            otp.expires, expected_expiration, delta=timedelta(seconds=15)
        )

    def test_is_valid_method_with_valid_token(self):
        """Test the is_valid method with a valid (not expired) token"""
        otp = OneTimePassword.objects.create(user=self.user)

        # Ensure the OTP is valid
        self.assertTrue(otp.is_valid())

        # Ensure the OTP is now marked as inactive after calling is_valid
        self.assertFalse(otp.is_active)

    def test_is_valid_method_with_expired_token(self):
        """Test the is_valid method with an expired token"""
        # Create an expired OTP
        expired_time = now() - timedelta(minutes=5)
        otp = OneTimePassword.objects.create(user=self.user, expires=expired_time)

        # Check that OTP is invalid since it's expired
        self.assertFalse(otp.is_valid())

    def test_custom_init_token_length(self):
        """Test custom token length passed in through __init__"""
        otp = OneTimePassword.objects.create(user=self.user, token_length=10)

        # Check that the token has a length of 10
        self.assertEqual(len(otp.token), 10)

    def test_token_not_re_generated_on_save_if_exists(self):
        """Test that token is not re-generated on save if it already exists"""
        otp = OneTimePassword(user=self.user)
        otp.token = "CUSTOMTOKEN"
        otp.save()

        # Ensure the token remains the same after save
        self.assertEqual(otp.token, "CUSTOMTOKEN")

    def test_token_re_generation_if_none_on_save(self):
        """Test that token is generated on save if not provided"""
        otp = OneTimePassword(user=self.user)
        otp.token = None
        otp.save()

        # Check that a token is generated automatically
        self.assertIsNotNone(otp.token)
        self.assertEqual(len(otp.token), 6)  # Default token length
