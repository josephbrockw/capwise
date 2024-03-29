import pytest

from account.models import User


@pytest.mark.django_db
def test_user_model():
    user = User(
        username="jsullivan",
        email="james@minc.com",
        password="password",
        first_name="James",
        last_name="Sullivan",
    )
    user.save()

    assert user.username == "jsullivan"
    assert user.email == "james@minc.com"
    assert user.password == "password"
    assert user.first_name == "James"
    assert user.last_name == "Sullivan"
