from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

from api.serializers import LogInSerializer, UserSerializer
from config.api import StandardAPIView, StandardResponse
from account.models import OneTimePassword
from account.emails import Email


class SignUpView(generics.CreateAPIView, StandardAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        self.send_verification_email(user)

    def send_verification_email(self, user):
        otp = OneTimePassword.objects.create(user=user, token_length=20)
        email = Email(subject="Verify your email", to=[user.email], template="default")
        salutation = f"Hi"
        if user.first_name:
            salutation += f", {user.first_name}!"
        else:
            salutation += "!"
        email.add_paragraph(salutation)
        email.add_paragraph("Please click the button below to verify your email address.")
        email.add_button("Verify Email", f"{settings.FRONTEND_URL}/verify?token={otp.token}")
        email.add_paragraph("If you did not create an account, no further action is required.")
        email.add_paragraph("Thank you!")
        email.send()


class VerifyEmailView(StandardAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        try:
            otp = OneTimePassword.objects.get(token=token, is_active=True)
        except OneTimePassword.DoesNotExist:
            return StandardResponse(error="Invalid or expired token.", status=status.HTTP_400_BAD_REQUEST)

        if not otp.is_valid():
            return StandardResponse(error="Invalid or expired token.", status=status.HTTP_400_BAD_REQUEST)

        user = otp.user
        user.is_active = True
        user.save()

        return StandardResponse(message="Email verified successfully.", status=status.HTTP_200_OK)


class LogInView(TokenObtainPairView, StandardAPIView):
    serializer_class = LogInSerializer


class TokenRefreshView(BaseTokenRefreshView, StandardAPIView):
    pass
