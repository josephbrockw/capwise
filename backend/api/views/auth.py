from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

from account.emails import Email
from account.models import OneTimePassword
from api.serializers import (
    CustomTokenRefreshSerializer,
    LogInSerializer,
    RegisterUserSerializer,
)
from config.api import StandardAPIView, StandardResponse, StandardViewSet


class AuthViewSet(StandardViewSet):
    permission_classes = [AllowAny]

    def send_verification_email(self, user):
        # Create a new OTP
        otp = OneTimePassword.objects.create(user=user, token_length=20)
        email = Email(subject="Verify your email", to=[user.email], template="default")
        salutation = "Hi"
        if user.first_name:
            salutation += f", {user.first_name}!"
        else:
            salutation += "!"
        email.add_paragraph(salutation)
        email.add_paragraph(
            "Please click the button below to verify your email address."
        )
        email.add_button(
            "Verify Email", f"{settings.FRONTEND_URL}/verify?token={otp.token}"
        )
        email.add_paragraph(
            "If you did not create an account, no further action is required."
        )
        email.add_paragraph("Thank you!")
        email.send()

    @action(detail=False, methods=["post"], url_path="sign-up", url_name="sign_up")
    def sign_up(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        self.send_verification_email(user)
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

        self.send_verification_email(user)
        return StandardResponse(
            message="Verification email sent.", status=status.HTTP_200_OK
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
