from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.encoding import force_str
from rest_framework import serializers
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.tokens import TokenError

from experiment.models import Experiment, Variation
from payment.models import DiscountCode, Price, Product, Tier
from payment.process import create_user_subscription


class RegisterUserSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    username = serializers.CharField(required=False)
    payment_method_id = serializers.CharField(required=False)
    productId = serializers.IntegerField(required=False)
    tierId = serializers.IntegerField(required=False)
    priceId = serializers.IntegerField(required=False)
    discountCode = serializers.DictField(required=False, allow_null=True)
    trialDays = serializers.IntegerField(required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Dynamically set 'required' based on PAYMENT_REQUIRED
        if settings.PAYMENT_REQUIRED:
            self.fields["payment_method_id"].required = True

    def validate(self, data):
        # If username is not in data, use email as username
        if "username" not in data:
            data["username"] = data["email"]

        if data["password1"] != data["password2"]:
            raise serializers.ValidationError("Passwords must match.")

        if settings.PAYMENT_REQUIRED and "payment_method_id" not in data:
            raise serializers.ValidationError("Payment method is required.")

        User = get_user_model()

        if User.objects.filter(username=data["username"]).exists():
            raise serializers.ValidationError("Username is already taken.")
        if User.objects.filter(email=data["email"]).exists():
            raise serializers.ValidationError(
                "Email is already associated with an account."
            )
        return data

    def create(self, validated_data):
        with transaction.atomic():
            # Remove password1 and password2 from the validated data
            required_fields = (
                "password1",
                "password2",
            )

            if settings.PAYMENT_REQUIRED:
                required_fields += (
                    "productId",
                    "tierId",
                    "priceId",
                    "discountCode",
                    "trialDays",
                )
            else:
                validated_data.pop("productId", None)
                validated_data.pop("tierId", None)
                validated_data.pop("priceId", None)
                validated_data.pop("discountCode", None)
                validated_data.pop("trialDays", None)
                validated_data.pop("payment_method_id", None)

            data = {
                key: value
                for key, value in validated_data.items()
                if key not in required_fields
            }
            data["password"] = validated_data["password1"]

            # Create the user with the provided data
            user = self.Meta.model.objects.create_user(**data)
            user.is_active = False
            user.save()

            # Handle subscription
            if settings.PAYMENT_REQUIRED:
                try:
                    create_user_subscription(
                        user,
                        validated_data,
                    )
                except Exception as e:
                    raise serializers.ValidationError(str(e))

            return user

    class Meta:
        model = get_user_model()
        fields = (
            "id",
            "username",
            "email",
            "password1",
            "password2",
            "first_name",
            "last_name",
            "payment_method_id",
            "productId",
            "tierId",
            "priceId",
            "discountCode",
            "trialDays",
        )
        read_only_fields = ("id",)


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

    def update(self, instance, validated_data):
        # Update the instance without modifying the password fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class LogInSerializer(TokenObtainPairSerializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        User = get_user_model()
        username = attrs["username"]
        password = attrs["password"]

        # If input looks like an email, try to find the user by email first
        if "@" in username:
            try:
                user = User.objects.get(email=username)
                if user.check_password(password):
                    attrs["username"] = user.username
            except User.DoesNotExist:
                pass

        # Now proceed with standard validation
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        user_data = RegisterUserSerializer(user).data
        for key, value in user_data.items():
            if key != "id":
                token[key] = value
        return token


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def to_internal_value(self, data):
        if "refresh" not in data:
            raise serializers.ValidationError({"refresh": "No refresh token provided."})

        return super().to_internal_value(data)

    def validate(self, attrs):
        try:
            return super().validate(attrs)
        except TokenError as e:
            raise serializers.ValidationError({"refresh": force_str(e)})


class VariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variation
        fields = ["id", "name", "weight", "views", "conversions"]


class ExperimentSerializer(serializers.ModelSerializer):
    variations = VariationSerializer(many=True, read_only=True)

    class Meta:
        model = Experiment
        fields = ["id", "name", "description", "created_at", "active", "variations"]


class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = ["id", "billing_cycle", "price"]


class TierSerializer(serializers.ModelSerializer):
    prices = PriceSerializer(many=True, read_only=True, source="price_set")

    class Meta:
        model = Tier
        fields = ["id", "name", "stripe_product_id", "prices", "features", "order"]


class ProductSerializer(serializers.ModelSerializer):
    tiers = TierSerializer(many=True, read_only=True, source="tier_set")
    trial_days = serializers.IntegerField(source="default_trial_days")

    class Meta:
        model = Product
        fields = ["id", "name", "description", "is_active", "tiers", "trial_days"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["tiers"] = sorted(data["tiers"], key=lambda tier: tier["order"])
        return data


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
