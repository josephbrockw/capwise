from api.serializers import UserSerializer
from config.api import StandardResponse, StandardViewSet
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated


class UserViewSet(StandardViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = get_user_model().objects.all()

    def get_object(self):
        """
        Override get_object to retrieve the currently authenticated user.
        """
        return self.request.user

    @action(detail=False, methods=["get"], url_path="me", url_name="me")
    def retrieve_user(self, request):
        """
        Retrieve details of the currently authenticated user.
        """
        user = self.get_object()
        serializer = self.get_serializer(user)
        return StandardResponse(
            data=serializer.data,
            message="User details retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["put", "patch"], url_path="me", url_name="update_me")
    def update_user(self, request):
        """
        Update information of the currently authenticated user.
        """
        user = self.get_object()
        partial = request.method == "PATCH"
        serializer = self.get_serializer(user, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return StandardResponse(
            data=serializer.data,
            message="User information updated successfully.",
            status=status.HTTP_200_OK,
        )
