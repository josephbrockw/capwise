from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import render

from account.emails import (
    experiment_report_email,
    initiate_password_reset_email,
    password_changed_email,
    verification_email,
)


def test_templates(request, directory="email", template="welcome"):
    frontend_url = f"{settings.FRONTEND_URL}"

    user = get_user_model().objects.first()

    if template == "verify":
        template_name = "default"
        context = {
            "user": user,
            "title": "Verify your email address",
            "content_list": verification_email(user).context["content_list"],
        }
    elif template == "initiate-password-reset":
        template_name = "default"
        email = initiate_password_reset_email(user)
        context = {
            "user": user,
            "title": email.subject,
            "content_list": email.context["content_list"],
        }
    elif template == "confirm-password-reset":
        template_name = "default"
        email = password_changed_email(user)
        context = {
            "title": email.subject,
            "content_list": email.context["content_list"],
        }
    elif template == "experiment-report":
        template_name = "default"
        email = experiment_report_email()
        context = {
            "title": email.subject,
            "content_list": email.context["content_list"],
        }
    else:
        template_name = "default"
        context = {
            "subject": "Hello",
            "title": "Hello",
            "content_list": [
                {"type": "text", "text": "Hello!"},
                {
                    "type": "text",
                    "text": "Thank you for signing up with our service! "
                    "To complete your registration, please verify your "
                    "email address by clicking on the link below:",
                },
                {"type": "button", "text": "Click me", "url": frontend_url},
                {"type": "callout", "text": "123456"},
                {
                    "type": "note",
                    "text": "If you did not sign up for our service, "
                    "please ignore this email.",
                },
            ],
        }

    return render(request, f"{directory}/{template_name}.html", context)
