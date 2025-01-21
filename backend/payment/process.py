from datetime import datetime

import stripe
from django.conf import settings

from config.logger import logger
from payment.models import DiscountCode, Price, Product, Subscription, Tier

stripe.api_key = settings.STRIPE_SECRET_KEY

MASTER_FEATURE_LIST = settings.MASTER_FEATURE_LIST


def validate_and_update_tier_features():
    """
    Validate and update tier features against the master feature list
    """
    updated = 0

    for product_name, product_features in MASTER_FEATURE_LIST.items():
        try:
            product = Product.objects.get(name=product_name)
        except Product.DoesNotExist:
            logger.warning(f"Product {product_name} does not exist. Skipping...")
            continue

        tiers = Tier.objects.filter(product=product)
        for tier in tiers:
            if not tier.features:
                tier.features = {}

            for feature_key, feature_data in product_features.items():
                if feature_key not in tier.features:
                    tier.features[feature_key] = feature_data

            keys_to_remove = [
                key for key in tier.features if key not in product_features
            ]
            for key in keys_to_remove:
                del tier.features[key]

            tier.save()
            updated += 1

    return updated


def create_user_subscription(user, data):
    try:
        # Handle discount code if provided
        if data.get("discountCode"):
            try:
                discount = DiscountCode.objects.get(id=data["discountCode"]["id"])
                trial_days = data.get("trialDays")
                if trial_days is not None and trial_days != discount.trial_days:
                    data["trialDays"] = discount.trial_days
            except DiscountCode.DoesNotExist:
                raise ValueError("Invalid discount code provided")
        else:
            discount = None

        # Create Stripe customer
        try:
            customer = stripe.Customer.create(
                email=user.email,
                payment_method=data["payment_method_id"],
                invoice_settings={"default_payment_method": data["payment_method_id"]},
            )
        except stripe.error.StripeError as e:
            raise ValueError(f"Error setting up payment method: {str(e)}")

        # Get price and create subscription
        try:
            price = Price.objects.get(id=data["priceId"])
        except Price.DoesNotExist:
            raise ValueError("Invalid price ID provided")

        try:
            stripe_subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{"price": price.stripe_price_id}],
                trial_period_days=data.get("trialDays"),
                coupon=discount.stripe_coupon_id if discount else None,
                payment_settings={
                    "payment_method_types": ["card"],
                    "save_default_payment_method": "on_subscription",
                },
            )
        except stripe.error.StripeError as e:
            # Clean up the customer if subscription creation fails
            stripe.Customer.delete(customer.id)
            raise ValueError(f"Error creating subscription: {str(e)}")

        # Create local subscription record
        try:
            # Convert Unix timestamps to datetime objects
            trial_end = (
                datetime.fromtimestamp(stripe_subscription.trial_end)
                if stripe_subscription.trial_end
                else None
            )
            current_period_end = (
                datetime.fromtimestamp(stripe_subscription.current_period_end)
                if stripe_subscription.current_period_end
                else None
            )

            subscription = Subscription.objects.create(
                user=user,
                tier_id=data["tierId"],
                price=price,
                status=stripe_subscription.status,
                stripe_customer_id=customer.id,
                stripe_subscription_id=stripe_subscription.id,
                trial_end=trial_end,
                cancel_at_period_end=stripe_subscription.cancel_at_period_end,
                current_period_end=current_period_end,
            )
            return subscription
        except Exception as e:
            # Clean up Stripe resources if local DB save fails
            stripe.Subscription.delete(stripe_subscription.id)
            stripe.Customer.delete(customer.id)
            raise ValueError(f"Error saving subscription: {str(e)}")

    except Exception as e:
        # Deactivate user if subscription setup fails
        user.is_active = False
        user.save()
        raise ValueError(f"Subscription creation failed: {str(e)}")
