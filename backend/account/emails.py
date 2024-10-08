from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.timezone import now
from account.models import OneTimePassword


class Email:
    def __init__(self, subject: str, to: list, template="default"):
        self.subject = subject
        self.to = to
        self.from_email = settings.DEFAULT_FROM_EMAIL
        self.context = {"title": self.subject, "current_year": now().year, "content_list": []}
        self.template = template

        # self.html_content = render_to_string(self._find_template(email_name), self.context)
        # self.text_content = strip_tags(self.html_content)

    def _get_template(self):
        return f"email/{self.template}.html"

    def add_context(self, key, value):
        self.context[key] = value

    def show_content_list(self):
        for item in self.context["content_list"]:
            print(item)

    def add_paragraph(self, text):
        self.context["content_list"].append({"type": "paragraph", "text": text})

    def add_button(self, text, url):
        self.context["content_list"].append({"type": "button", "text": text, "url": url})

    def send(self):
        if not self.context["content_list"]:
            raise ValueError("No content to send.")

        html_content = render_to_string(self._get_template(), self.context)
        text_content = strip_tags(html_content)
        email = EmailMultiAlternatives(
            subject=self.subject,
            body=text_content,
            from_email=self.from_email,
            to=self.to,
        )
        email.attach_alternative(html_content, "text/html")
        email.send()


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
