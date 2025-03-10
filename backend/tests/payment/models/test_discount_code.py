from unittest.mock import patch

import stripe
from django.test import TestCase, tag

from payment.models import DiscountCode, Product
from tests.utils import mock_stripe


@tag("payment", "discount-code")
class TestDiscountCode(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="Test Product",
            description="A test product",
            is_active=True,
            default_trial_days=7,
        )

        self.base_discount_data = {
            "code": "TEST50",
            "discount_type": "percent_off",
            "percentage": 50,
            "duration": "once",
            "product": self.product,
        }

    def tearDown(self):
        # Clean up any test data
        DiscountCode.objects.all().delete()
        self.product.delete()

    @mock_stripe()
    def test_create_percentage_discount(self):
        discount = DiscountCode.objects.create(**self.base_discount_data)

        self.assertEqual(discount.stripe_coupon_id, "coupon_mock123")
        self.assertEqual(discount.code, "TEST50")
        self.assertEqual(discount.percentage, 50)

    @mock_stripe()
    def test_create_amount_discount(self):
        amount_data = self.base_discount_data.copy()
        amount_data.update(
            {
                "discount_type": "amount_off",
                "percentage": None,
                "amount": 1000,  # $10.00
            }
        )

        discount = DiscountCode.objects.create(**amount_data)

        self.assertEqual(discount.amount, 1000)
        self.assertEqual(discount.stripe_coupon_id, "coupon_mock123")

    @mock_stripe()
    def test_update_discount(self):
        discount = DiscountCode.objects.create(**self.base_discount_data)

        # Update the discount
        discount.percentage = 75
        discount.save()

        self.assertEqual(discount.percentage, 75)
        self.assertEqual(discount.stripe_coupon_id, "coupon_mock123")

    @mock_stripe()
    def test_delete_discount(self):
        discount = DiscountCode.objects.create(**self.base_discount_data)
        discount_id = discount.id

        discount.delete()

        self.assertFalse(DiscountCode.objects.filter(id=discount_id).exists())

    @mock_stripe()
    def test_str_representation(self):
        discount = DiscountCode.objects.create(**self.base_discount_data)

        expected_str = "TEST50 - (50% off for the first billing cycle.)"
        self.assertEqual(str(discount), expected_str)

    @mock_stripe()
    def test_trial_period_discount(self):
        trial_data = self.base_discount_data.copy()
        trial_data["trial_days"] = 14

        discount = DiscountCode.objects.create(**trial_data)

        self.assertEqual(discount.trial_days, 14)
        self.assertEqual(discount.stripe_coupon_id, "coupon_mock123")

    @mock_stripe()
    def test_repeating_discount(self):
        repeating_data = self.base_discount_data.copy()
        repeating_data.update({"duration": "repeating", "duration_in_months": 3})

        discount = DiscountCode.objects.create(**repeating_data)

        self.assertEqual(discount.duration, "repeating")
        self.assertEqual(discount.duration_in_months, 3)
        self.assertEqual(discount.stripe_coupon_id, "coupon_mock123")

    def test_stripe_error_handling(self):
        with patch("stripe.Coupon.create") as mock_stripe_create:
            mock_stripe_create.side_effect = stripe.error.StripeError(
                "Stripe API error"
            )

            with self.assertRaises(ValueError) as context:
                DiscountCode.objects.create(**self.base_discount_data)

            self.assertTrue("Error setting up discount code" in str(context.exception))

    @mock_stripe()
    def test_description_property(self):
        test_cases = [
            {
                "data": {
                    **self.base_discount_data,
                    "code": "FOREVER50",
                    "duration": "forever",
                },
                "expected": "50% off forever.",
            },
            {
                "data": {
                    **self.base_discount_data,
                    "code": "AMOUNT1000",
                    "discount_type": "amount_off",
                    "amount": 1000,
                    "percentage": None,
                    "duration": "once",
                },
                "expected": "$1000 off for the first billing cycle.",
            },
            {
                "data": {
                    **self.base_discount_data,
                    "code": "REPEAT50",
                    "duration": "repeating",
                    "duration_in_months": 6,
                },
                "expected": "50% off for 6 months.",
            },
        ]

        for case in test_cases:
            discount = DiscountCode.objects.create(**case["data"])
            self.assertEqual(discount.description, case["expected"])
            discount.delete()  # Clean up after each test case
