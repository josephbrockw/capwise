import os
from unittest.mock import patch

from django.test import TestCase

from payment.models import Product, Tier
from payment.process import validate_and_update_tier_features


class TestValidateAndUpdateTierFeatures(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [os.path.join(base_dir, "fixtures", "products.yaml")]

    def setUp(self):
        self.master_feature_list_patcher = patch(
            "payment.process.MASTER_FEATURE_LIST",
            {
                "BaseBuild": {
                    "feature1": {
                        "display_name": "Feature 1",
                        "description": "Description 1",
                        "included": True,
                    },
                    "feature2": {
                        "display_name": "Feature 2",
                        "description": "Description 2",
                        "included": False,
                    },
                    "feature3": {
                        "display_name": "Feature 3",
                        "description": "Description 3",
                        "included": True,
                    },
                },
            },
        )
        self.master_feature_list_patcher.start()

    def tearDown(self):
        self.master_feature_list_patcher.stop()

    def test_validate_and_update_tier_features(self):
        # Initial state
        base_build = Product.objects.get(name="BaseBuild")
        basic_tier = Tier.objects.get(product=base_build, name="Basic")
        pro_tier = Tier.objects.get(product=base_build, name="Pro")

        # Set initial features
        basic_tier.features = {
            "old_feature": {
                "display_name": "Old Feature",
                "description": "Old Description",
                "included": True,
            }
        }
        basic_tier.save()
        pro_tier.features = {}
        pro_tier.save()

        # Run the function
        updated = validate_and_update_tier_features()

        # Check results
        self.assertEqual(updated, 2)  # Both tiers should be updated

        # Refresh from database
        basic_tier.refresh_from_db()
        pro_tier.refresh_from_db()

        # Check Basic tier features
        self.assertEqual(len(basic_tier.features), 3)
        self.assertIn("feature1", basic_tier.features)
        self.assertIn("feature2", basic_tier.features)
        self.assertIn("feature3", basic_tier.features)
        self.assertNotIn("old_feature", basic_tier.features)

        # Check Pro tier features
        self.assertEqual(len(pro_tier.features), 3)
        self.assertIn("feature1", pro_tier.features)
        self.assertIn("feature2", pro_tier.features)
        self.assertIn("feature3", pro_tier.features)

    def test_validate_and_update_tier_features_no_changes(self):
        # Set features to match MASTER_FEATURE_LIST
        base_build = Product.objects.get(name="BaseBuild")
        basic_tier = Tier.objects.get(product=base_build, name="Basic")
        pro_tier = Tier.objects.get(product=base_build, name="Pro")

        features = {
            "feature1": {
                "display_name": "Feature 1",
                "description": "Description 1",
                "included": True,
            },
            "feature2": {
                "display_name": "Feature 2",
                "description": "Description 2",
                "included": False,
            },
            "feature3": {
                "display_name": "Feature 3",
                "description": "Description 3",
                "included": True,
            },
        }
        basic_tier.features = features
        basic_tier.save()
        pro_tier.features = features
        pro_tier.save()

        # Run the function
        updated = validate_and_update_tier_features()

        # Check results
        self.assertEqual(
            updated, 2
        )  # Both tiers should be counted as updated, even if no changes were made

        # Refresh from database
        basic_tier.refresh_from_db()
        pro_tier.refresh_from_db()

        # Check features are unchanged
        for tier in [basic_tier, pro_tier]:
            self.assertEqual(len(tier.features), 3)
            self.assertIn("feature1", tier.features)
            self.assertIn("feature2", tier.features)
            self.assertIn("feature3", tier.features)

    @patch("payment.process.logger")
    def test_validate_and_update_tier_features_nonexistent_product(self, mock_logger):
        # Add a non-existent product to MASTER_FEATURE_LIST
        with patch(
            "payment.process.MASTER_FEATURE_LIST",
            {
                "BaseBuild": {},
                "NonExistent Plan": {
                    "feature1": {
                        "display_name": "Feature 1",
                        "description": "Description 1",
                        "included": True,
                    }
                },
            },
        ):
            updated = validate_and_update_tier_features()

        # Check results
        self.assertEqual(updated, 2)  # Both existing tiers should be updated
        mock_logger.warning.assert_called_once_with(
            "Product NonExistent Plan does not exist. Skipping..."
        )

    def test_validate_and_update_tier_features_empty_features(self):
        # Set features to None
        base_build = Product.objects.get(name="BaseBuild")
        basic_tier = Tier.objects.get(product=base_build, name="Basic")
        pro_tier = Tier.objects.get(product=base_build, name="Pro")

        basic_tier.features = None
        basic_tier.save()
        pro_tier.features = None
        pro_tier.save()

        # Run the function
        updated = validate_and_update_tier_features()

        # Check results
        self.assertEqual(updated, 2)

        # Refresh from database
        basic_tier.refresh_from_db()
        pro_tier.refresh_from_db()

        # Check features are updated
        for tier in [basic_tier, pro_tier]:
            self.assertEqual(len(tier.features), 3)
            self.assertIn("feature1", tier.features)
            self.assertIn("feature2", tier.features)
            self.assertIn("feature3", tier.features)
