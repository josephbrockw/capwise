from account.emails import email_verification_content_list
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.shortcuts import render
from django.template.exceptions import TemplateDoesNotExist


def test_templates(request, directory="email", template="welcome"):
    if hasattr(settings, "FRONTEND_URL"):
        frontend_url = f"{settings.FRONTEND_URL}"
    else:
        frontend_url = "http://localhost:8000"

    if template == "verify":
        template_name = "default"
        user = get_user_model().objects.first()
        context = {
            "user": user,
            "title": "Verify your email address",
            "content_list": email_verification_content_list(user),
        }
    else:
        template_name = "default"
        context = {
            "subject": "Verify your email address",
            "title": "Verify your email address",
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

    try:
        return render(request, f"{directory}/{template_name}.html", context)
    except TemplateDoesNotExist:
        return HttpResponse("Requested template does not exist", status=404)
