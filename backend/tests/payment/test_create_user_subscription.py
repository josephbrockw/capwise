import os
from unittest.mock import patch

import stripe
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from payment.models import DiscountCode, Price, Product, Subscription, Tier
from payment.process import create_user_subscription
from tests.utils import mock_stripe


class TestCreateUserSubscription(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [os.path.join(base_dir, "fixtures", "products.yaml")]

    def setUp(self):
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="testpass123",
        )
        self.product = Product.objects.get(name="BaseBuild")
        self.tier = Tier.objects.get(product=self.product, name="Basic")
        self.price = Price.objects.get(tier=self.tier, billing_cycle="lifetime")

    def tearDown(self):
        # Clean up any test data
        DiscountCode.objects.all().delete()
        Subscription.objects.all().delete()
        self.user.delete()

    @mock_stripe()
    def test_basic_subscription_creation(self):
        """Test creating a basic subscription without discount or trial."""
        subscription = create_user_subscription(
            self.user,
            {
                "payment_method_id": "pm_123",
                "priceId": self.price.id,
                "tierId": self.tier.id,
            },
        )

        self.assertIsNotNone(subscription)
        self.assertEqual(subscription.user, self.user)
        self.assertEqual(subscription.tier, self.tier)
        self.assertEqual(subscription.price, self.price)
        self.assertEqual(subscription.status, "active")
        self.assertIsNotNone(subscription.stripe_customer_id)
        self.assertIsNotNone(subscription.stripe_subscription_id)

    @mock_stripe()
    def test_subscription_with_discount(self):
        """Test creating a subscription with a discount code."""
        # Create a test discount code since it's not in fixtures
        discount = DiscountCode.objects.create(
            code="TEST10",
            discount_type="percent_off",
            percentage=10,
            duration="once",
            is_active=True,
            product=self.product,
        )

        subscription = create_user_subscription(
            self.user,
            {
                "payment_method_id": "pm_123",
                "priceId": self.price.id,
                "tierId": self.tier.id,
                "discountCode": {"id": discount.id, "code": discount.code},
            },
        )

        self.assertIsNotNone(subscription)
        self.assertEqual(subscription.status, "active")

    @mock_stripe()
    def test_subscription_with_trial(self):
        """Test creating a subscription with trial days."""
        trial_days = 14
        trial_end = timezone.now() + timezone.timedelta(days=trial_days)
        current_period_end = timezone.now() + timezone.timedelta(days=30)

        # Mock the Stripe subscription response to include trial_end
        with patch("stripe.Subscription.create") as mock_sub:
            mock_sub.return_value.id = "sub_123"
            mock_sub.return_value.status = "active"
            mock_sub.return_value.trial_end = int(trial_end.timestamp())
            mock_sub.return_value.current_period_end = int(
                current_period_end.timestamp()
            )
            mock_sub.return_value.cancel_at_period_end = False

            subscription = create_user_subscription(
                self.user,
                {
                    "payment_method_id": "pm_123",
                    "priceId": self.price.id,
                    "tierId": self.tier.id,
                    "trialDays": trial_days,
                },
            )

        self.assertIsNotNone(subscription)
        self.assertEqual(subscription.status, "active")
        self.assertIsNotNone(subscription.trial_end)
        self.assertEqual(subscription.trial_end.date(), trial_end.date())

    @mock_stripe()
    def test_invalid_price_id(self):
        """Test that invalid price ID raises appropriate error."""
        with self.assertRaises(ValueError) as context:
            create_user_subscription(
                self.user,
                {
                    "payment_method_id": "pm_123",
                    "priceId": 9999,
                    "tierId": self.tier.id,
                },
            )
        self.assertIn("Invalid price ID", str(context.exception))

    @mock_stripe()
    def test_invalid_discount_code(self):
        """Test that invalid discount code raises appropriate error."""
        with self.assertRaises(ValueError) as context:
            create_user_subscription(
                self.user,
                {
                    "payment_method_id": "pm_123",
                    "priceId": self.price.id,
                    "tierId": self.tier.id,
                    "discountCode": {"id": 999, "code": "INVALID"},
                },
            )
        self.assertIn("Invalid discount code", str(context.exception))

    def test_stripe_error_handling(self):
        """Test handling of Stripe API errors."""
        with patch("stripe.Customer.create") as mock_create:
            mock_create.side_effect = stripe.error.StripeError("Invalid card")

            with self.assertRaises(ValueError) as context:
                create_user_subscription(
                    self.user,
                    {
                        "payment_method_id": "pm_123",
                        "priceId": self.price.id,
                        "tierId": self.tier.id,
                    },
                )

        self.assertIn("Error setting up payment method", str(context.exception))

    @mock_stripe()
    def test_subscription_cleanup_on_error(self):
        """
        Test that resources are cleaned up if an error occurs during
        subscription creation.
        """
        with patch("stripe.Subscription.create") as mock_sub_create:
            mock_sub_create.side_effect = Exception("Stripe Subscription Error")

            with self.assertRaises(ValueError):
                create_user_subscription(
                    self.user,
                    {
                        "payment_method_id": "pm_123",
                        "priceId": self.price.id,
                        "tierId": self.tier.id,
                    },
                )

        # Verify no subscription was created in our database
        self.assertFalse(Subscription.objects.filter(user=self.user).exists())

    @mock_stripe()
    def test_subscription_with_product_specific_discount(self):
        """Test creating a subscription with a product-specific discount code."""
        product_discount = DiscountCode.objects.create(
            code="PRODUCT20",
            discount_type="percent_off",
            percentage=20,
            duration="once",
            is_active=True,
            product=self.product,
        )

        subscription = create_user_subscription(
            self.user,
            {
                "payment_method_id": "pm_123",
                "priceId": self.price.id,
                "tierId": self.tier.id,
                "discountCode": {
                    "id": product_discount.id,
                    "code": product_discount.code,
                },
            },
        )

        self.assertIsNotNone(subscription)
        self.assertEqual(subscription.status, "active")
