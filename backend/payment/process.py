from django.conf import settings

from config.logger import logger
from payment.models import Product, Tier

MASTER_FEATURE_LIST = settings.MASTER_FEATURE_LIST


def validate_and_update_tier_features():
    """
    Validate and update tier features against the master feature list
    """
    updated = 0

    for product_name, product_features in MASTER_FEATURE_LIST.items():
        try:
            product = Product.objects.get(name=product_name)
        except Product.DoesNotExist:
            logger.warning(f"Product {product_name} does not exist. Skipping...")
            continue

        tiers = Tier.objects.filter(product=product)
        for tier in tiers:
            if not tier.features:
                tier.features = {}

            for feature_key, feature_data in product_features.items():
                if feature_key not in tier.features:
                    tier.features[feature_key] = feature_data

            keys_to_remove = [
                key for key in tier.features if key not in product_features
            ]
            for key in keys_to_remove:
                del tier.features[key]

            tier.save()
            updated += 1

    return updated
