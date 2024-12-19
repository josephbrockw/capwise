import os

from rest_framework import status
from rest_framework.test import APITestCase

from payment.models import Product, Tier
from tests import read_api_response


class ProductViewSetTests(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [os.path.join(base_dir, "fixtures", "products.yaml")]

    def setUp(self):
        self.url = "/api/products"  # Direct URL path

    def test_list_products(self):
        response = self.client.get(self.url)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "Products retrieved successfully.")

        # Check if the number of products returned matches the fixture
        self.assertEqual(len(data), Product.objects.count())

        # Check if the tiers within each product are ordered by their "order" field
        for product in data:
            tiers = product["tiers"]
            self.assertEqual(tiers, sorted(tiers, key=lambda tier: tier["order"]))

    def test_product_structure(self):
        response = self.client.get(self.url)
        data, msg, err, code = read_api_response(response)

        product = data[0]  # Get the first product

        # Check product fields
        self.assertIn("id", product)
        self.assertIn("name", product)
        self.assertIn("description", product)
        self.assertIn("is_active", product)
        self.assertIn("tiers", product)

    def test_tier_structure(self):
        response = self.client.get(self.url)
        data, msg, err, code = read_api_response(response)

        tier = data[0]["tiers"][0]  # Get the first tier of the first product

        # Check tier fields
        self.assertIn("id", tier)
        self.assertIn("name", tier)
        self.assertIn("stripe_product_id", tier)
        self.assertIn("prices", tier)

    def test_price_structure(self):
        response = self.client.get(self.url)
        data, msg, err, code = read_api_response(response)

        price = data[0]["tiers"][0]["prices"][
            0
        ]  # Get the first price of the first tier of the first product

        # Check price fields
        self.assertIn("id", price)
        self.assertIn("billing_cycle", price)
        self.assertIn("price", price)

    def test_inactive_products(self):
        # Set all products to inactive
        Product.objects.all().update(is_active=False)

        response = self.client.get(self.url)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(len(data), 0)  # No products should be returned

    def test_no_products(self):
        # Delete all products
        Product.objects.all().delete()

        response = self.client.get(self.url)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(len(data), 0)

    def test_product_with_no_tiers(self):
        # Create a product with no tiers
        Product.objects.create(
            name="No Tier Product",
            description="A product with no tiers",
            is_active=True,
        )

        response = self.client.get(self.url)
        data, msg, err, code = read_api_response(response)

        no_tier_product = next(
            product for product in data if product["name"] == "No Tier Product"
        )
        self.assertEqual(len(no_tier_product["tiers"]), 0)

    def test_tier_with_no_prices(self):
        # Create a product and a tier with no prices
        product = Product.objects.create(
            name="No Price Product",
            description="A product with a tier but no prices",
            is_active=True,
        )
        Tier.objects.create(
            name="No Price Tier", stripe_product_id="stripe_123", product=product
        )

        response = self.client.get(self.url)
        data, msg, err, code = read_api_response(response)

        no_price_product = next(
            product for product in data if product["name"] == "No Price Product"
        )
        self.assertEqual(len(no_price_product["tiers"][0]["prices"]), 0)
