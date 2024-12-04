from django.conf import settings
from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        db_table = "products"


class Tier(models.Model):
    name = models.CharField(max_length=255)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    price_monthly = models.IntegerField()
    price_yearly = models.IntegerField()
    price_lifetime = models.IntegerField()
    features = models.JSONField()
    stripe_price_id = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.product.name} - {self.name}" if self.product else self.name

    class Meta:
        verbose_name = "Tier"
        verbose_name_plural = "Tiers"
        db_table = "tiers"
        unique_together = ("product", "name")


class Subscription(models.Model):
    BILLING_CYCLE_CHOICES = [
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
        ("lifetime", "Lifetime"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tier = models.ForeignKey(Tier, on_delete=models.CASCADE)
    price = models.IntegerField()
    is_active = models.BooleanField(default=True)
    stripe_customer_id = models.CharField(max_length=255)
    stripe_subscription_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    billing_cycle = models.CharField(
        max_length=20, choices=BILLING_CYCLE_CHOICES, default="monthly"
    )
    next_billing_date = models.DateField()

    class Meta:
        verbose_name = "Subscription"
        verbose_name_plural = "Subscriptions"
        db_table = "subscriptions"

    def __str__(self):
        return f"{self.user.email} - {self.tier.name}"
