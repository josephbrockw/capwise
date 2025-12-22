---
sidebar_position: 3
---

# Serializers

Serializers in Django REST Framework handle the conversion between Python objects and JSON data. This document covers the key serializers used in the BaseBuild API.

## Location

All serializers are located in `django/api/serializers.py`.

## Authentication Serializers

### SignUpSerializer

Handles user registration data validation and user creation.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | EmailField | Yes | User's email address |
| `password` | CharField | Yes | User's password (write-only) |

**Validation:**

- Email must be unique
- Password must meet minimum requirements

**Usage:**

```python
from api.serializers import SignUpSerializer

serializer = SignUpSerializer(data={
    'email': 'user@example.com',
    'password': 'securepassword'
})
if serializer.is_valid():
    user = serializer.save()
```

### LoginSerializer

Handles user login and token generation.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | EmailField | Yes | User's email address |
| `password` | CharField | Yes | User's password |
| `remember_me` | BooleanField | No | Extend token lifetime (default: False) |

### VerifyEmailSerializer

Handles email verification with OTP.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | EmailField | Yes | User's email address |
| `otp` | CharField | Yes | 6-digit verification code |

### PasswordResetSerializer

Handles password reset requests.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | EmailField | Yes | User's email address |

### PasswordResetConfirmSerializer

Handles password reset confirmation.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | CharField | Yes | Reset token from email |
| `password` | CharField | Yes | New password |

## User Serializers

### UserSerializer

Serializes user data for API responses.

**Fields:**

| Field | Type | Read-Only | Description |
|-------|------|-----------|-------------|
| `id` | IntegerField | Yes | User ID |
| `email` | EmailField | Yes | User's email |
| `is_verified` | BooleanField | Yes | Email verification status |
| `date_joined` | DateTimeField | Yes | Registration date |

### ChangePasswordSerializer

Handles password change requests.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `current_password` | CharField | Yes | Current password |
| `new_password` | CharField | Yes | New password |

**Validation:**

- Current password must be correct
- New password must meet minimum requirements
- New password must be different from current

## Creating Custom Serializers

When adding new API endpoints, follow these patterns:

### Basic Serializer

```python
from rest_framework import serializers

class MyModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyModel
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']
```

### Serializer with Custom Validation

```python
from rest_framework import serializers

class MySerializer(serializers.Serializer):
    field_one = serializers.CharField(max_length=100)
    field_two = serializers.IntegerField(min_value=0)

    def validate_field_one(self, value):
        if 'invalid' in value:
            raise serializers.ValidationError("Invalid value")
        return value

    def validate(self, data):
        # Cross-field validation
        if data['field_two'] < len(data['field_one']):
            raise serializers.ValidationError("field_two must be >= field_one length")
        return data
```

### Nested Serializers

```python
from rest_framework import serializers

class AddressSerializer(serializers.Serializer):
    street = serializers.CharField()
    city = serializers.CharField()
    country = serializers.CharField()

class UserProfileSerializer(serializers.ModelSerializer):
    address = AddressSerializer()

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'address']
```
