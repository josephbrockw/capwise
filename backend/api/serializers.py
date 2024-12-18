from django.contrib.auth import get_user_model
from django.utils.encoding import force_str
from rest_framework import serializers
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.tokens import TokenError

from experiment.models import Experiment, Variation
from payment.models import Price, Product, Tier


class RegisterUserSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    username = serializers.CharField(required=False)

    def validate(self, data):
        # If username is not in data, use email as username
        if "username" not in data:
            data["username"] = data["email"]

        if data["password1"] != data["password2"]:
            raise serializers.ValidationError("Passwords must match.")
        User = get_user_model()
        if User.objects.filter(username=data["username"]).exists():
            raise serializers.ValidationError("Username is already taken.")
        if User.objects.filter(email=data["email"]).exists():
            raise serializers.ValidationError(
                "Email is already associated with an account."
            )
        return data

    def create(self, validated_data):
        # Remove password1 and password2 from the validated data
        data = {
            key: value
            for key, value in validated_data.items()
            if key not in ("password1", "password2")
        }
        data["password"] = validated_data["password1"]

        # Create the user with the provided data
        user = self.Meta.model.objects.create_user(**data)
        user.is_active = False
        user.save()
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

    class Meta:
        model = Product
        fields = ["id", "name", "description", "is_active", "tiers"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["tiers"] = sorted(data["tiers"], key=lambda tier: tier["order"])
        return data
