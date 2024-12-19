# Test my new version route
from django.test import Client, TestCase


class TestVersion(TestCase):
    def setUp(self):
        self.client = Client()

    def test_version(self):
        response = self.client.get("/version")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"version": "0.0.1"})
