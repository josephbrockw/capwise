import os

from rest_framework import status
from rest_framework.test import APITestCase

from experiment.models import Variation
from tests import read_api_response


class ExperimentViewSetTest(APITestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [os.path.join(base_dir, "fixtures", "experiments.yaml")]

    def test_track_view_valid_variation(self):
        variation_a = Variation.objects.get(name="Variation A")
        self.assertEqual(variation_a.views, 0)
        url = "/api/experiments/1/track-view"
        response = self.client.post(url, data={"variation": "Variation A"})
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "View tracked successfully.")
        variation_a.refresh_from_db()
        self.assertEqual(variation_a.views, 1)

    def test_track_view_invalid_variation(self):
        url = "/api/experiments/1/track-view"
        response = self.client.post(url, data={"variation": "Invalid Variation"})
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Variation not found.")

    def test_track_conversion_valid_variation(self):
        variation_b = Variation.objects.get(name="Variation B")
        self.assertEqual(variation_b.conversions, 0)
        url = "/api/experiments/1/track-conversion"
        response = self.client.post(url, data={"variation": "Variation B"})
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_200_OK)
        self.assertEqual(msg, "Conversion tracked successfully.")
        variation_b.refresh_from_db()
        self.assertEqual(variation_b.conversions, 1)

    def test_track_conversion_invalid_variation(self):
        url = "/api/experiments/1/track-conversion"
        response = self.client.post(url, data={"variation": "Invalid Variation"})
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Variation not found.")

    def test_track_view_missing_variation(self):
        url = "/api/experiments/1/track-view"
        response = self.client.post(url, data={})
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Variation not found.")

    def test_track_conversion_missing_variation(self):
        url = "/api/experiments/1/track-conversion"
        response = self.client.post(url, data={})
        data, msg, err, code = read_api_response(response)

        self.assertEqual(code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(err, "Variation not found.")
