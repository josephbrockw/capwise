from django.conf import settings
from account.models import OneTimePassword


def email_verification_content_list(user):
    otp = OneTimePassword.objects.create(user=user, token_length=20)
    verification_url = f"{settings.FRONTEND_URL}/verify/?token={otp.token}"
    salutation = f"Hi"
    if user.first_name:
        salutation += f", {user.first_name}!"
    else:
        salutation += "!"

    content_list = [
        {"type": "paragraph", "text": salutation},
        {"type": "paragraph", "text": "Please click the button below to verify your email address."},
        {"type": "button", "text": "Verify Email", "url": verification_url},
        {"type": "paragraph", "text": "If you did not create an account, no further action is required."},
        {"type": "paragraph", "text": "Thank you!"}
    ]
    return content_list