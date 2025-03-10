from decimal import Decimal

import stripe
from django.conf import settings
from django.db import models

from config.logger import logger


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    default_trial_days = models.PositiveIntegerField(default=7)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        db_table = "products"


class Tier(models.Model):
    name = models.CharField(max_length=255)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    features = models.JSONField(blank=True, null=True)
    stripe_product_id = models.CharField(max_length=255)
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} - {self.name}" if self.product else self.name

    class Meta:
        verbose_name = "Tier"
        verbose_name_plural = "Tiers"
        db_table = "tiers"
        unique_together = ("product", "name")
        ordering = ["order"]


class Price(models.Model):
    BILLING_CYCLE_CHOICES = [
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
        ("lifetime", "Lifetime"),
    ]
    tier = models.ForeignKey(Tier, on_delete=models.CASCADE)
    billing_cycle = models.CharField(
        max_length=20, choices=BILLING_CYCLE_CHOICES, default="monthly"
    )
    price = models.PositiveIntegerField()
    stripe_price_id = models.CharField(max_length=255)

    class Meta:
        verbose_name = "Payment Cycle"
        verbose_name_plural = "Payment Cycles"
        db_table = "payment_cycles"
        unique_together = ("tier", "billing_cycle")

    def __str__(self):
        product_name = self.tier.product.name
        tier_name = self.tier.name
        price = f"{self.billing_cycle} @ {self.display_price}"
        return f"{product_name} - {tier_name} ({price})"

    @property
    def display_price(self):
        # I want to turn the price field (cents) into a dollar amount
        return f"${Decimal(self.price) / 100:.2f}"

    def get_final_price(self, discount_code=None):
        if discount_code:
            if discount_code.discount_type == "percentage":
                return self.price * (1 - discount_code.percentage / 100)
            elif discount_code.discount_type == "amount":
                return self.price - discount_code.amount
        return self.price


class Subscription(models.Model):
    BILLING_CYCLE_CHOICES = [
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
        ("lifetime", "Lifetime"),
    ]
    STATUS_CHOICES = [
        ("active", "Active"),
        ("canceled", "Canceled"),
        ("past_due", "Past Due"),
        ("incomplete", "Incomplete"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tier = models.ForeignKey(Tier, on_delete=models.CASCADE)
    price = models.ForeignKey(Price, on_delete=models.SET_NULL, null=True)
    stripe_customer_id = models.CharField(max_length=255)
    stripe_subscription_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    trial_end = models.DateField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    current_period_end = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "Subscription"
        verbose_name_plural = "Subscriptions"
        db_table = "subscriptions"
        unique_together = ("user", "tier")

    def __str__(self):
        return f"{self.user.email} - {self.tier.name} ({self.status})"


class DiscountCode(models.Model):
    DISCOUNT_TYPES = [
        ("percent_off", "Percentage Off"),
        ("amount_off", "Fixed Amount Off"),
    ]
    DURATION_CHOICES = [
        ("forever", "Forever"),
        ("once", "Once"),
        ("repeating", "Repeating"),
    ]

    code = models.CharField(max_length=255, unique=True)
    discount_type = models.CharField(
        max_length=20, choices=DISCOUNT_TYPES, default="percent_off"
    )
    percentage = models.PositiveIntegerField(null=True, blank=True)
    amount = models.PositiveIntegerField(null=True, blank=True)
    duration = models.CharField(max_length=20, choices=DURATION_CHOICES, default="once")
    duration_in_months = models.PositiveIntegerField(null=True, blank=True)
    trial_days = models.PositiveIntegerField(null=True, blank=True)
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, null=True, blank=True
    )
    is_active = models.BooleanField(default=True)
    stripe_coupon_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Discount Code"
        verbose_name_plural = "Discount Codes"
        db_table = "discount_codes"

    def __str__(self):
        if self.description:
            return f"{self.code.upper()} - ({self.description})"
        return f"{self.code.upper()}"

    def save(self, *args, **kwargs):
        try:
            if not self.stripe_coupon_id:
                self.create_stripe_coupon()
            else:
                self.update_stripe_coupon()
        except stripe.error.StripeError as e:
            logger.error(f"Error setting up discount code: {str(e)}")
            raise ValueError(f"Error setting up discount code: {str(e)}")
        super().save(*args, **kwargs)

    def create_stripe_coupon(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        coupon_params = {
            "duration": self.duration,
            "duration_in_months": self.duration_in_months,
            "name": self.code,
            "currency": "usd",
        }
        if self.discount_type == "percent_off":
            coupon_params["percent_off"] = self.percentage
        elif self.discount_type == "amount_off":
            coupon_params["amount_off"] = self.amount
        if self.trial_days:
            coupon_params["trial_period_days"] = self.trial_days

        stripe_coupon = stripe.Coupon.create(**coupon_params)
        self.stripe_coupon_id = stripe_coupon.id
        # Don't call save() here as it would cause recursion

    def update_stripe_coupon(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        stripe.api_key = settings.STRIPE_SECRET_KEY
        coupon_params = {
            "duration": self.duration,
            "duration_in_months": self.duration_in_months,
            "name": self.code,
        }
        if self.discount_type == "percent_off":
            coupon_params["percent_off"] = self.percentage
        elif self.discount_type == "amount_off":
            coupon_params["amount_off"] = self.amount
        if self.trial_days:
            coupon_params["trial_period_days"] = self.trial_days

        stripe.Coupon.modify(self.stripe_coupon_id, **coupon_params)

    def delete(self, *args, **kwargs):
        if self.stripe_coupon_id:
            try:
                self.delete_stripe_coupon()
            except stripe.error.StripeError as e:
                logger.error(f"Error deleting discount code: {str(e)}")
                raise ValueError(f"Error deleting discount code: {str(e)}")

        super().delete(*args, **kwargs)

    def delete_stripe_coupon(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        stripe.Coupon.delete(self.stripe_coupon_id)
        self.stripe_coupon_id = None
        # Don't call save() here as it would cause recursion

    @property
    def description(self):
        description = ""
        if self.discount_type == "percent_off":
            description += f"{self.percentage}% off"
        elif self.discount_type == "amount_off":
            description += f"${self.amount} off"
        else:
            if self.product.trial_days != self.trial_days:
                description += f"{self.trial_days} day trial"
            else:
                return ""

        if self.duration == "forever":
            description += " forever"
        elif self.duration == "once":
            description += " for the first billing cycle"
        elif self.duration == "repeating":
            description += f" for {self.duration_in_months} months"

        return description + "."
