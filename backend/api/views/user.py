from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from api.serializers import UserSerializer
from config.api import StandardResponse, StandardViewSet


class UserViewSet(StandardViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = get_user_model().objects.all()

    @action(detail=False, methods=["get"], url_path="me", url_name="me")
    def me(self, request):
        """
        Retrieve details of the currently authenticated user.
        """
        serializer = self.get_serializer(request.user)
        return StandardResponse(
            data=serializer.data,
            message="User details retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    @me.mapping.patch
    def update_user(self, request):
        """
        Update information of the currently authenticated user.
        """
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return StandardResponse(
            data=serializer.data,
            message="User information updated successfully.",
            status=status.HTTP_200_OK,
        )
