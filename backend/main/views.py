from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.template.exceptions import TemplateDoesNotExist

from account.emails import email_verification_content_list


def test_templates(request, directory="email", template="welcome"):
    if hasattr(settings, "FRONTEND_URL"):
        frontend_url = f"{settings.FRONTEND_URL}"
    else:
        frontend_url = f"http://localhost:8000"

    if template == "verify":
        template_name = "default"
        user = get_user_model().objects.first()
        context = {
            "user": user,
            "title": "Verify your email address",
            "content_list": email_verification_content_list(user),
        }
    # elif template == "welcome":
    #     frontend_url = frontend_url + "/login"
    #     context = {
    #         "subject": f"Welcome!",
    #         "title": f"Welcome, friend!",
    #         "content_list": [
    #             {
    #                 "type": "text",
    #                 "text": f"Hello, Gytha Ogg!"
    #             },
    #             {
    #                 "type": "text",
    #                 "text": f"Thank you for verifying your email address with us! We’re excited to have you on board and look forward to helping you get the most out of {app_name}."
    #             },
    #             {
    #                 "type": "text",
    #                 "text": "Welcome to the community!"
    #             },
    #             {
    #                 "type": "button",
    #                 "text": "Get Started",
    #                 "url": frontend_url
    #             },
    #         ],
    #     }
    # elif template == "reset-password":
    #     context = {
    #         "subject": "Reset your password",
    #         "title": "Reset your password",
    #         "content_list": [
    #             {
    #                 "type": "text",
    #                 "text": "Hello!"
    #             },
    #             {
    #                 "type": "text",
    #                 "text": "You are receiving this email because we received a password reset request for your account. Click 'Reset Password' and enter the code at hte bottom of this email to reset your password."
    #             },
    #             {
    #                 "type": "button",
    #                 "text": "Reset Password",
    #                 "url": frontend_url + "/reset-password"
    #             },
    #             {
    #                 "type": "note",
    #                 "text": "If you did not request a password reset, no further action is required."
    #             },
    #             {
    #                 "type": "code",
    #                 "text": "123456"
    #             },
    #         ],
    #     }
    else:
        template_name = "default"
        context = {
            "subject": "Verify your email address",
            "title": "Verify your email address",
            "content_list": [
                {"type": "text", "text": "Hello!"},
                {
                    "type": "text",
                    "text": "Thank you for signing up with our service! To complete your registration, please verify your emaill address by clicking on the link below:",
                },
                {"type": "button", "text": "Click me", "url": frontend_url},
                {"type": "callout", "text": "123456"},
                {
                    "type": "note",
                    "text": "If you did not sign up for our service, please ignore this email.",
                },
            ],
        }

    try:
        return render(request, f"{directory}/{template_name}.html", context)
    except TemplateDoesNotExist:
        return HttpResponse("Requested template does not exist", status=404)
