from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

from account.emails import (
    initiate_password_reset_email,
    password_changed_email,
    verification_email,
)
from account.models import OneTimePassword
from api.serializers import (
    CustomTokenRefreshSerializer,
    LogInSerializer,
    RegisterUserSerializer,
)
from config.api import StandardAPIView, StandardResponse, StandardViewSet


class AuthViewSet(StandardViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"], url_path="sign-up", url_name="sign_up")
    def sign_up(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        email = verification_email(user)
        email.send()

        return StandardResponse(
            serializer.data,
            message="User created successfully. An email has been "
            "sent to verify your email address.",
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="verify", url_name="verify_email")
    def verify_email(self, request):
        """
        Handle email verification using the OTP token.
        """
        token = request.data.get("token", None)
        if not token:
            return StandardResponse(
                error="The 'token' field is required to verify the email.",
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            otp = OneTimePassword.objects.get(token=token, is_active=True)
        except OneTimePassword.DoesNotExist:
            return StandardResponse(
                error="Invalid or expired token.", status=status.HTTP_400_BAD_REQUEST
            )

        if not otp.is_valid():
            return StandardResponse(
                error="Invalid or expired token.", status=status.HTTP_400_BAD_REQUEST
            )

        user = otp.user
        user.is_active = True
        user.save()

        return StandardResponse(
            message="Email verified successfully.", status=status.HTTP_200_OK
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="resend-verify",
        url_name="resend_verify",
    )
    def resend_verification(self, request):
        email = request.data.get("email")
        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            return StandardResponse(
                error="User not found.", status=status.HTTP_400_BAD_REQUEST
            )

        if user.is_active:
            return StandardResponse(
                error="User is already verified.", status=status.HTTP_400_BAD_REQUEST
            )

        email = verification_email(user)
        email.send()

        return StandardResponse(
            message="Verification email sent.", status=status.HTTP_200_OK
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="password/reset",
        url_name="reset_password_initiate",
    )
    def password_reset_initiate(self, request):
        User = get_user_model()
        email = request.data.get("email")
        message = "If an account with that email exists, an email will be sent."
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return StandardResponse(message=message, status=status.HTTP_200_OK)

        email = initiate_password_reset_email(user)
        email.send()

        return StandardResponse(message=message, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        url_path="password/reset/confirm",
        url_name="reset_password",
    )
    def password_reset(self, request):
        token = request.data.get("token", None)
        password = request.data.get("password", None)
        password_confirm = request.data.get("password_confirm", None)

        if not token:
            return StandardResponse(
                error="The 'token' field is required to reset the password.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password:
            return StandardResponse(
                error="The 'password' field is required to reset the password.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password_confirm or password != password_confirm:
            return StandardResponse(
                error="Passwords must match.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            otp = OneTimePassword.objects.get(token=token, is_active=True)
        except OneTimePassword.DoesNotExist:
            return StandardResponse(
                error="Invalid or expired token.", status=status.HTTP_400_BAD_REQUEST
            )

        if not otp.is_valid():
            return StandardResponse(
                error="Invalid or expired token.", status=status.HTTP_400_BAD_REQUEST
            )

        user = otp.user
        user.set_password(password)
        user.save()

        email = password_changed_email(user)
        email.send()

        return StandardResponse(
            message="Password reset successfully.", status=status.HTTP_200_OK
        )


class LogInView(TokenObtainPairView, StandardAPIView):
    serializer_class = LogInSerializer


class TokenRefreshView(BaseTokenRefreshView, StandardAPIView):
    serializer_class = CustomTokenRefreshSerializer


class LogoutView(StandardAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return StandardResponse(
                message="Logout successful.", status=status.HTTP_200_OK
            )
        except Exception as e:
            return StandardResponse(
                error="Could not complete logout.",
                error_code=str(e),
                status=status.HTTP_400_BAD_REQUEST,
            )
