from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from api.serializers import UserSerializer
from config.api import StandardResponse, StandardViewSet
from django.contrib.auth import get_user_model


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

    @action(
        detail=False,
        methods=["post"],
        url_path="change-password",
        url_name="change-password",
    )
    def change_password(self, request):
        """
        Change password for the currently authenticated user.
        """
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not current_password or not new_password or not confirm_password:
            return StandardResponse(
                error="current_password, new_password, and confirm_password are"
                " required.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != confirm_password:
            return StandardResponse(
                error="New password and confirm password do not match.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.check_password(current_password):
            return StandardResponse(
                error="Current password is incorrect.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(new_password)
        request.user.save()

        return StandardResponse(
            message="Password changed successfully.",
            status=status.HTTP_200_OK,
        )
