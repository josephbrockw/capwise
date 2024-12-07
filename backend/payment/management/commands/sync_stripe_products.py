import stripe
from django.conf import settings
from django.core.management.base import BaseCommand

from payment.models import Price, Product, Tier
from payment.process import validate_and_update_tier_features


class Command(BaseCommand):
    help = "Sync Stripe data with our database"

    def handle(self, *args, **options):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.sync_products()
        self.sync_prices()
        validate_and_update_tier_features()

    def sync_products(self):
        products = stripe.Product.list(active=True)

        products = [
            product
            for product in products
            if product.metadata.get("app") == settings.APP_NAME
        ]
        for stripe_product in products:
            product_name, tier_name = stripe_product["name"].split("|")
            product, created = Product.objects.get_or_create(name=product_name)
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Created Product: {product.__str__()}")
                )
            tier, created = Tier.objects.get_or_create(
                product=product,
                name=tier_name,
                stripe_product_id=stripe_product["id"],
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created Tier: {tier.__str__()}"))

    def sync_prices(self):
        prices = stripe.Price.list(active=True)

        for stripe_price in prices["data"]:
            if Tier.objects.filter(stripe_product_id=stripe_price["product"]).exists():
                tier = Tier.objects.get(stripe_product_id=stripe_price["product"])
                if stripe_price["recurring"]:
                    billing_cycle = stripe_price["recurring"]["interval"]
                else:
                    billing_cycle = "lifetime"

                if Price.objects.filter(stripe_price_id=stripe_price["id"]).exists():
                    price = Price.objects.get(stripe_price_id=stripe_price["id"])

                    if price.price != stripe_price["unit_amount"]:
                        price.price = stripe_price["unit_amount"]
                        price.save()
                        self.stdout.write(
                            self.style.SUCCESS(f"Updated Price: {price.__str__()}")
                        )
                else:
                    price = Price.objects.create(
                        tier=tier,
                        stripe_price_id=stripe_price["id"],
                        billing_cycle=billing_cycle,
                        price=stripe_price["unit_amount"],
                    )

                    self.stdout.write(
                        self.style.SUCCESS(f"Created Price: {price.__str__()}")
                    )
