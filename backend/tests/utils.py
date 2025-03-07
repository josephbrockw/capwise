from functools import wraps
from unittest.mock import patch

import stripe
from django.utils import timezone


def mock_stripe():
    """
    Decorator to mock all Stripe API calls.
    Handles customer, subscription, and coupon operations.

    Usage:
        @mock_stripe()
        def test_something(self):
            # Your test code here
    """

    def decorator(test_func):
        @wraps(test_func)
        def wrapper(*args, **kwargs):
            # Get Unix timestamps for dates
            current_period_end = int(
                (timezone.now() + timezone.timedelta(days=30)).timestamp()
            )

            # Mock customer creation
            customer_mock = patch("stripe.Customer.create").start()
            customer_mock.return_value = stripe.Customer.construct_from(
                {
                    "id": "cus_mock123",
                    "email": "test@example.com",
                },
                "mock_key",
            )

            # Mock subscription creation
            subscription_mock = patch("stripe.Subscription.create").start()
            subscription_mock.return_value = stripe.Subscription.construct_from(
                {
                    "id": "sub_mock123",
                    "status": "active",
                    "trial_end": None,
                    "cancel_at_period_end": False,
                    "current_period_end": current_period_end,
                    "customer": "cus_mock123",
                },
                "mock_key",
            )

            # Mock customer deletion for cleanup
            delete_customer_mock = patch("stripe.Customer.delete").start()
            delete_customer_mock.return_value = stripe.Customer.construct_from(
                {"deleted": True, "id": "cus_mock123"}, "mock_key"
            )

            # Mock subscription deletion for cleanup
            delete_subscription_mock = patch("stripe.Subscription.delete").start()
            delete_subscription_mock.return_value = stripe.Subscription.construct_from(
                {"deleted": True, "id": "sub_mock123"}, "mock_key"
            )

            # Mock coupon creation
            coupon_create_mock = patch("stripe.Coupon.create").start()
            coupon_create_mock.return_value = stripe.Coupon.construct_from(
                {
                    "id": "coupon_mock123",
                    "duration": "once",
                    "percent_off": 50,
                    "name": "TEST50",
                    "valid": True,
                    "metadata": {},
                    "livemode": False,
                },
                "mock_key",
            )

            # Mock coupon modification
            coupon_modify_mock = patch("stripe.Coupon.modify").start()
            coupon_modify_mock.return_value = stripe.Coupon.construct_from(
                {
                    "id": "coupon_mock123",
                    "duration": "once",
                    "percent_off": 50,
                    "name": "TEST50",
                    "valid": True,
                    "metadata": {},
                    "livemode": False,
                },
                "mock_key",
            )

            # Mock coupon deletion
            coupon_delete_mock = patch("stripe.Coupon.delete").start()
            coupon_delete_mock.return_value = stripe.Coupon.construct_from(
                {"id": "coupon_mock123", "deleted": True}, "mock_key"
            )

            try:
                return test_func(*args, **kwargs)
            finally:
                patch.stopall()

        return wrapper

    return decorator
