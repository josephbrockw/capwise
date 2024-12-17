from unittest.mock import patch

from django.conf import settings
from django.core.management import call_command
from django.test import TestCase, tag

from payment.models import Price, Product, Tier


class StripeMockObject:
    def __init__(self, **kwargs):
        self._data = {}
        for key, value in kwargs.items():
            if isinstance(value, dict):
                value = StripeMockObject(**value)
            self._data[key] = value
            setattr(self, key, value)

    def __getitem__(self, key):
        return self._data[key]

    def get(self, key, default=None):
        return self._data.get(key, default)


@tag("payment")
class TestSyncStripeProducts(TestCase):
    def setUp(self):
        self.mock_stripe_products = [
            StripeMockObject(
                id="prod_123",
                name="Basic Plan|Starter",
                metadata={"app": settings.APP_NAME},
                active=True,
            ),
            StripeMockObject(
                id="prod_456",
                name="Pro Plan|Premium",
                metadata={"app": settings.APP_NAME},
                active=True,
            ),
            StripeMockObject(
                id="prod_789",
                name="Other App|Premium",
                metadata={"app": "other_app"},
                active=True,
            ),
        ]

        self.mock_stripe_prices = [
            StripeMockObject(
                id="price_123",
                product="prod_123",
                unit_amount=1000,
                recurring={"interval": "month"},
                active=True,
            ),
            StripeMockObject(
                id="price_456",
                product="prod_123",
                unit_amount=10000,
                recurring={"interval": "year"},
                active=True,
            ),
            StripeMockObject(
                id="price_789",
                product="prod_456",
                unit_amount=5000,
                recurring=None,
                active=True,
            ),
        ]

    @patch("stripe.Product.list")
    @patch("stripe.Price.list")
    def test_sync_new_products_and_prices(self, mock_price_list, mock_product_list):
        mock_product_list.return_value = self.mock_stripe_products
        mock_price_list.return_value = {"data": self.mock_stripe_prices}

        # Run command
        call_command("sync_stripe_products")

        # Check products were created correctly
        assert Product.objects.count() == 2
        basic_plan = Product.objects.get(name="Basic Plan")
        pro_plan = Product.objects.get(name="Pro Plan")

        # Check tiers were created correctly
        assert Tier.objects.count() == 2
        starter_tier = Tier.objects.get(name="Starter")
        premium_tier = Tier.objects.get(name="Premium")

        assert starter_tier.product == basic_plan
        assert starter_tier.stripe_product_id == "prod_123"
        assert premium_tier.product == pro_plan
        assert premium_tier.stripe_product_id == "prod_456"

        # Check prices were created correctly
        assert Price.objects.count() == 3
        monthly_price = Price.objects.get(stripe_price_id="price_123")
        yearly_price = Price.objects.get(stripe_price_id="price_456")
        lifetime_price = Price.objects.get(stripe_price_id="price_789")

        assert monthly_price.tier == starter_tier
        assert monthly_price.price == 1000
        assert monthly_price.billing_cycle == "month"

        assert yearly_price.tier == starter_tier
        assert yearly_price.price == 10000
        assert yearly_price.billing_cycle == "year"

        assert lifetime_price.tier == premium_tier
        assert lifetime_price.price == 5000
        assert lifetime_price.billing_cycle == "lifetime"

    @patch("stripe.Product.list")
    @patch("stripe.Price.list")
    def test_update_existing_price(
        self,
        mock_price_list,
        mock_product_list,
    ):
        # Setup existing data
        product = Product.objects.create(name="Basic Plan")
        tier = Tier.objects.create(
            product=product, name="Starter", stripe_product_id="prod_123"
        )
        existing_price = Price.objects.create(
            tier=tier,
            stripe_price_id="price_123",
            billing_cycle="month",
            price=500,  # Different from the mock price
        )

        # Setup mocks
        mock_product_list.return_value = self.mock_stripe_products
        mock_price_list.return_value = {"data": self.mock_stripe_prices}

        # Run command
        call_command("sync_stripe_products")

        # Check price was updated
        existing_price.refresh_from_db()
        assert existing_price.price == 1000  # Updated to new price
        assert Price.objects.count() == 3  # All prices created

    @patch("stripe.Product.list")
    @patch("stripe.Price.list")
    def test_skip_other_app_products(
        self,
        mock_price_list,
        mock_product_list,
    ):
        # Setup mocks
        mock_product_list.return_value = self.mock_stripe_products
        mock_price_list.return_value = {"data": self.mock_stripe_prices}

        # Run command
        call_command("sync_stripe_products")

        # Check only our app's products were created
        assert Product.objects.count() == 2
        assert not Product.objects.filter(name="Other App").exists()

    @patch("stripe.Product.list")
    @patch("stripe.Price.list")
    def test_idempotency(
        self,
        mock_price_list,
        mock_product_list,
    ):
        # Setup mocks
        mock_product_list.return_value = self.mock_stripe_products
        mock_price_list.return_value = {"data": self.mock_stripe_prices}

        # Run command twice
        call_command("sync_stripe_products")
        call_command("sync_stripe_products")

        # Check no duplicates were created
        assert Product.objects.count() == 2
        assert Tier.objects.count() == 2
        assert Price.objects.count() == 3

    @patch("stripe.Product.list")
    @patch("stripe.Price.list")
    def test_existing_product_new_tier(
        self,
        mock_price_list,
        mock_product_list,
    ):
        # Setup existing product without the tier
        product = Product.objects.create(name="Basic Plan")

        # Setup mocks
        mock_product_list.return_value = self.mock_stripe_products
        mock_price_list.return_value = {"data": self.mock_stripe_prices}

        # Run command
        call_command("sync_stripe_products")

        # Verify product wasn't duplicated
        assert Product.objects.count() == 2
        assert Product.objects.filter(name="Basic Plan").count() == 1

        # Verify new tier was created
        assert Tier.objects.count() == 2
        starter_tier = Tier.objects.get(name="Starter", product=product)
        assert starter_tier.stripe_product_id == "prod_123"

        # Verify prices were created for the new tier
        assert Price.objects.count() == 3
        monthly_price = Price.objects.get(stripe_price_id="price_123")
        yearly_price = Price.objects.get(stripe_price_id="price_456")

        assert monthly_price.tier == starter_tier
        assert monthly_price.price == 1000
        assert monthly_price.billing_cycle == "month"

        assert yearly_price.tier == starter_tier
        assert yearly_price.price == 10000
        assert yearly_price.billing_cycle == "year"

    @patch("stripe.Product.list")
    @patch("stripe.Price.list")
    def test_existing_tier_new_price(
        self,
        mock_price_list,
        mock_product_list,
    ):
        # Setup existing product and tier without prices
        product = Product.objects.create(name="Basic Plan")
        tier = Tier.objects.create(
            product=product, name="Starter", stripe_product_id="prod_123"
        )

        # Setup mocks
        mock_product_list.return_value = self.mock_stripe_products
        mock_price_list.return_value = {"data": self.mock_stripe_prices}

        # Run command
        call_command("sync_stripe_products")

        # Verify no new products or tiers were created
        assert Product.objects.count() == 2
        assert Tier.objects.count() == 2
        assert Tier.objects.filter(name="Starter", product=product).count() == 1

        # Verify new prices were created
        assert Price.objects.count() == 3
        monthly_price = Price.objects.get(stripe_price_id="price_123")
        yearly_price = Price.objects.get(stripe_price_id="price_456")

        assert monthly_price.tier == tier
        assert monthly_price.price == 1000
        assert monthly_price.billing_cycle == "month"

        assert yearly_price.tier == tier
        assert yearly_price.price == 10000
        assert yearly_price.billing_cycle == "year"
