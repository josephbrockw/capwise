from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.timezone import now
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from api.serializers import LogInSerializer, UserSerializer
from config.api import StandardAPIView, StandardResponse
from account.models import OneTimePassword
from account.emails import email_verification_content_list


class SignUpView(generics.CreateAPIView, StandardAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        self.send_verification_email(user)

    def send_verification_email(self, user):
        content_list = email_verification_content_list(user)

        html_content = render_to_string(
            "email/verify_email.html", {
                "user": user,
                "content_list": content_list,
                "current_year": now().year
            }
        )
        text_content = strip_tags(html_content)

        email = EmailMultiAlternatives(
            subject="Verify your email",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
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


class LogInView(TokenObtainPairView):
    serializer_class = LogInSerializer
