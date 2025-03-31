---
sidebar_position: 3
---

# API Serializers

The BaseBuild API uses serializers to convert complex data types, such as Django models, to Python native datatypes that can be rendered into JSON. This document explains the key serializers used in the application.

## File Location

```
backend/api/serializers.py
```

## User Registration and Authentication

### RegisterUserSerializer

Handles user registration with or without payment information, depending on the application configuration.

```python
class RegisterUserSerializer(serializers.ModelSerializer):
    # Fields for basic registration
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    username = serializers.CharField(required=False)

    # Fields for payment registration
    payment_method_id = serializers.CharField(required=False)
    productId = serializers.IntegerField(required=False)
    tierId = serializers.IntegerField(required=False)
    priceId = serializers.IntegerField(required=False)
    discountCode = serializers.DictField(required=False, allow_null=True)
    trialDays = serializers.IntegerField(required=False)
```

**Key Features:**

- Dynamically sets required fields based on whether payment is required
- Validates passwords match
- Checks for existing usernames and emails
- Creates user accounts with transaction support
- Handles subscription creation when payment is required

### UserSerializer

Provides serialization for user profile information.

```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = (
            "id",
            "username",
            "preferred_name",
            "first_name",
            "last_name",
            "email",
        )
        read_only_fields = ("id", "username", "email")
```

### LogInSerializer

Extends the JWT token serializer to handle authentication with either username or email.

```python
class LogInSerializer(TokenObtainPairSerializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
```

**Key Features:**

- Allows users to log in with either username or email
- Includes user data in the JWT token payload

## Payment and Product Serializers

### ProductSerializer

Handles product information including associated tiers.

```python
class ProductSerializer(serializers.ModelSerializer):
    tiers = TierSerializer(many=True, read_only=True, source="tier_set")
    trial_days = serializers.IntegerField(source="default_trial_days")
```

### TierSerializer

Serializes product tier information with associated prices.

```python
class TierSerializer(serializers.ModelSerializer):
    prices = PriceSerializer(many=True, read_only=True, source="price_set")
```

### PriceSerializer

Serializes price information for product tiers.

```python
class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = ["id", "billing_cycle", "price"]
```

### DiscountCodeSerializer

Handles discount code information for payment processing.

```python
class DiscountCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountCode
        fields = [
            "id",
            "code",
            "discount_type",
            "percentage",
            "amount",
            "duration",
            "duration_in_months",
            "trial_days",
            "product",
            "is_active",
        ]
```

## Experiment Serializers

### ExperimentSerializer

Serializes experiment data with associated variations.

```python
class ExperimentSerializer(serializers.ModelSerializer):
    variations = VariationSerializer(many=True, read_only=True)
```

### VariationSerializer

Serializes experiment variation data.

```python
class VariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variation
        fields = ["id", "name", "weight", "views", "conversions"]
```

## Usage in the Registration Flow

The serializers play a crucial role in the registration flow:

1. **Basic Registration**: The `RegisterUserSerializer` handles the basic account creation with email and password validation.

2. **Payment Registration**: The same serializer can handle the extended registration flow with payment information when the `PAYMENT_REQUIRED` setting is enabled.

3. **Authentication**: After registration, the `LogInSerializer` handles user authentication and token generation.

## Best Practices

When working with these serializers:

- Always validate incoming data thoroughly
- Use transactions for operations that modify multiple database records
- Handle exceptions gracefully and provide meaningful error messages
- Keep serializers focused on specific data models or related groups of models
