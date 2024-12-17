from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from rest_framework_simplejwt.tokens import AccessToken

from config.asgi import application

TEST_CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}


@database_sync_to_async
def create_user(username, password):
    user = get_user_model().objects.create_user(username=username, password=password)
    access = AccessToken.for_user(user)
    return user, access


class TestWebSocket(TransactionTestCase):
    async def test_can_connect_to_server(self):
        with self.settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS):
            _, access = await create_user("granny", "testpass123")

            communicator = WebsocketCommunicator(application, f"/ws?token={access}")
            connected, _ = await communicator.connect()
            assert connected is True
            await communicator.disconnect()

    async def test_can_send_and_receive_messages(self):
        with self.settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS):
            _, access = await create_user("granny", "testpass123")

            communicator = WebsocketCommunicator(application, f"/ws?token={access}")
            connected, _ = await communicator.connect()
            assert connected is True

            message = {
                "type": "echo.message",
                "data": "Hello, world!",
            }
            await communicator.send_json_to(message)
            response = await communicator.receive_json_from()
            assert response == message

            await communicator.disconnect()

    async def test_can_send_and_receive_broadcast_messages(self):
        with self.settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS):
            _, access = await create_user("granny", "testpass123")

            communicator = WebsocketCommunicator(application, f"/ws?token={access}")
            connected, _ = await communicator.connect()
            assert connected is True

            message = {
                "type": "echo.message",
                "data": "This is a test message.",
            }
            channel_layer = get_channel_layer()
            await channel_layer.group_send("test", message=message)
            response = await communicator.receive_json_from()
            assert response == message
            await communicator.disconnect()

    async def test_cannot_connect_to_socket(self):
        with self.settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS):
            communicator = WebsocketCommunicator(
                application=application,
                path="/ws",
            )
            connected, _ = await communicator.connect()
            assert connected is False
            await communicator.disconnect()
