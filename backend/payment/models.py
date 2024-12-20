from decimal import Decimal

from django.conf import settings
from django.db import models


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


class Subscription(models.Model):
    BILLING_CYCLE_CHOICES = [
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
        ("lifetime", "Lifetime"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tier = models.ForeignKey(Tier, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    stripe_customer_id = models.CharField(max_length=255)
    stripe_subscription_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    next_billing_date = models.DateField()
    price = models.IntegerField()
    billing_cycle = models.CharField(
        max_length=20, choices=BILLING_CYCLE_CHOICES, default="monthly"
    )

    class Meta:
        verbose_name = "Subscription"
        verbose_name_plural = "Subscriptions"
        db_table = "subscriptions"
        unique_together = ("user", "tier")

    def __str__(self):
        return f"{self.user.email} - {self.tier.name}"


class DiscountCode(models.Model):
    code = models.CharField(max_length=255, unique=True)
    percentage = models.PositiveIntegerField(null=True, blank=True)
    money = models.PositiveIntegerField(null=True, blank=True)
    trial_days = models.PositiveIntegerField(null=True, blank=True)
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, null=True, blank=True
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Discount Code"
        verbose_name_plural = "Discount Codes"
        db_table = "discount_codes"

    def __str__(self):
        return self.code.upper()
