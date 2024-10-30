from datetime import timedelta
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils.timezone import now

from account.models import OneTimePassword

User = get_user_model()


class UserModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user_rincewind = User.objects.create_user(
            username="rincewind",
            email="rincewind@unseenuni.ankh",
            first_name="Rincewind",
            last_name="",
            preferred_name="",
            password="wizzard123",
        )
        cls.user_granny = User.objects.create_user(
            username="grannyw",
            email="granny@lancre.witches",
            first_name="Esmerelda",
            last_name="Weatherwax",
            preferred_name="Granny",
            password="headology456",
        )
        cls.user_death = User.objects.create_user(
            username="death",
            email="death@discworld.com",
            first_name="",
            last_name="",
            preferred_name="",
            password="inevitable789",
        )

    def test_name_property_and_salutation(self):
        """Test the name property and salutation method for users."""
        # User with a preferred name
        self.assertEqual(self.user_granny.name, "Granny")
        self.assertEqual(self.user_granny.salutation(), "Hi, Granny!")

        # User with only first name
        self.assertEqual(self.user_rincewind.name, "Rincewind")
        self.assertEqual(self.user_rincewind.salutation(), "Hi, Rincewind!")

        # User with neither preferred name nor first name
        self.assertEqual(self.user_death.name, "death")
        self.assertEqual(self.user_death.salutation(), "Hi, death!")

    def test_email_unique(self):
        """Test that email addresses are unique."""
        with self.assertRaises(Exception):
            User.objects.create_user(
                username="duplicate",
                email="rincewind@unseenuni.ankh",
                password="duplicate123",
            )


class OneTimePasswordModelTest(TestCase):
    def setUp(self):
        User = get_user_model()
        # Create a user for testing
        self.user = User.objects.create_user(
            username="vimes",
            email="vimes@watch.ankh",
            first_name="Sam",
            password="bootstheory123",
        )

    def test_otp_creation(self):
        """Test that an OTP can be created successfully."""
        initial = OneTimePassword.objects.create(user=self.user, token_length=10)
        otp = OneTimePassword.objects.create(user=self.user, token_length=10)
        self.assertEqual(otp.user, self.user)
        self.assertEqual(len(otp.token), 10)
        self.assertTrue(otp.is_active)
        initial.refresh_from_db()
        self.assertFalse(initial.is_active)

    def test_otp_token_is_unique(self):
        """Test that OTP tokens are unique."""
        otp1 = OneTimePassword.objects.create(user=self.user)
        otp2 = OneTimePassword.objects.create(user=self.user)
        self.assertNotEqual(otp1.token, otp2.token)

    def test_otp_user_only_one_active(self):
        """Test that a user can only have one active OTP at a time."""
        otp1 = OneTimePassword.objects.create(user=self.user)
        otp2 = OneTimePassword.objects.create(user=self.user)
        otp1.refresh_from_db()
        self.assertFalse(otp1.is_active)
        self.assertTrue(otp2.is_active)

    @patch("django.utils.timezone.now")
    def test_otp_expiration(self, mock_now):
        """Test that an OTP expires correctly."""
        mock_now.return_value = now()
        otp = OneTimePassword.objects.create(user=self.user, token_length=10)
        otp.expires = now() - timedelta(minutes=1)
        otp.save()
        self.assertFalse(otp.is_valid())

    def test_otp_is_valid_method(self):
        """Test the is_valid method of the OTP model."""
        otp = OneTimePassword.objects.create(user=self.user)
        self.assertTrue(otp.is_valid())
        otp.refresh_from_db()
        self.assertFalse(otp.is_active)

    def test_otp_save_method_generates_token(self):
        """Test that the save method generates a token if not provided."""
        otp = OneTimePassword(user=self.user)
        otp.save()
        self.assertIsNotNone(otp.token)
        self.assertEqual(len(otp.token), 6)  # Default token length is 6

    @patch("django.utils.timezone.now")
    def test_otp_save_method_sets_expiration(self, mock_now):
        """Test that the save method sets an expiration time if not provided."""
        save_now = now()
        mock_now.return_value = save_now
        otp = OneTimePassword.objects.create(user=self.user)
        expected_expiration = save_now + timedelta(
            minutes=int(settings.OTP_EXPIRATION_MINUTES)
        )
        self.assertAlmostEqual(
            otp.expires, expected_expiration, delta=timedelta(seconds=1)
        )

    def test_otp_db_table_name(self):
        """Test the database table name for the OTP model."""
        self.assertEqual(OneTimePassword._meta.db_table, "otp")

    def test_otp_verbose_name(self):
        """Test the verbose name for the OTP model."""
        self.assertEqual(OneTimePassword._meta.verbose_name, "One-Time Password")
        self.assertEqual(
            OneTimePassword._meta.verbose_name_plural, "One-Time Passwords"
        )
