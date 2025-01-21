# backend/tests/api/payments/test_discount_codes.py
import os

from django.test import tag
from rest_framework import status
from rest_framework.test import APITestCase

from tests import read_api_response


@tag("purchases")
class PurchasesTest(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures", "purchases.yaml"),
    ]
    url = "/api/purchases/check-discount"

    def test_valid_discount_code(self):
        data = {"code": "ACTIVE10", "product_id": str(1)}
        response = self.client.post(self.url, data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "Discount code applied successfully.")
        self.assertEqual(data["code"], "ACTIVE10")
        self.assertEqual(data["percentage"], 10)

    def test_product_specific_discount_code(self):
        data = {"code": "PRODUCT20", "product_id": str(1)}
        response = self.client.post(self.url, data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "Discount code applied successfully.")
        self.assertEqual(data["code"], "PRODUCT20")
        self.assertEqual(data["percentage"], 20)

    def test_product_specific_discount_code_wrong_product(self):
        data = {"code": "PRODUCT20", "product_id": 2}
        response = self.client.post(self.url, data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Discount code is not valid for this product.")

    def test_inactive_discount_code(self):
        data = {"code": "INACTIVE30", "product_id": str(1)}
        response = self.client.post(self.url, data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Invalid discount code.")

    def test_nonexistent_discount_code(self):
        data = {"code": "NONEXISTENT", "product_id": str(1)}
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_missing_code(self):
        data = {"product_id": str(1)}
        response = self.client.post(self.url, data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_404_NOT_FOUND)

    def test_missing_product_id(self):
        data = {"code": "ACTIVE10"}
        response = self.client.post(self.url, data)
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "Discount code applied successfully.")
        self.assertEqual(data["code"], "ACTIVE10")
