import pytest
from account.serializers import UserSerializer


@pytest.mark.django_db
def test_valid_user_serializer():
    valid_serializer_data = {
        "username": "jsullivan",
        "email": "james@minc.com",
        "password": "password",
    }
    serializer = UserSerializer(data=valid_serializer_data)
    assert serializer.is_valid()
    for field, value in valid_serializer_data.items():
        assert serializer.validated_data[field] == value
    assert serializer.errors == {}


@pytest.mark.django_db
def test_invalid_user_serializer():
    invalid_serializer_data = {
        "email": "james@minc.com",
        "password": "password",
    }
    serializer = UserSerializer(data=invalid_serializer_data)
    assert not serializer.is_valid()
    assert serializer.validated_data == {}
    assert serializer.data == invalid_serializer_data
    assert serializer.errors == {"username": ["This field is required."]}
