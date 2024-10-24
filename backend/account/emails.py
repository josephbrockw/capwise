from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.timezone import now

from account.models import OneTimePassword
from experiment.process import generate_active_experiments_report


class Email:
    def __init__(self, subject: str, to: list, template="default"):
        self.subject = subject
        self.to = to
        self.from_email = settings.DEFAULT_FROM_EMAIL
        self.context = {
            "title": self.subject,
            "current_year": now().year,
            "content_list": [],
        }
        self.template = template

    def _get_template(self):
        return f"email/{self.template}.html"

    def add_context(self, key, value):
        self.context[key] = value

    def show_content_list(self):
        for item in self.context["content_list"]:
            print(item)

    def add_paragraph(self, text):
        self.context["content_list"].append({"type": "paragraph", "text": text})

    def add_section_header(self, text):
        self.context["content_list"].append({"type": "section_header", "text": text})

    def add_section_subheader(self, text):
        self.context["content_list"].append({"type": "section_subheader", "text": text})

    def add_divider(self):
        self.context["content_list"].append({"type": "divider"})

    def add_bold_text(self, text):
        self.context["content_list"].append({"type": "bold_text", "text": text})

    def add_button(self, text, url):
        self.context["content_list"].append(
            {"type": "button", "text": text, "url": url}
        )

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


def verification_email(user):
    otp = OneTimePassword.objects.create(user=user, token_length=20)
    email = Email(subject="Verify your email", to=[user.email], template="default")
    salutation = "Hi"
    if user.first_name:
        salutation += f", {user.first_name}!"
    else:
        salutation += "!"
    email.add_paragraph(salutation)
    email.add_paragraph("Please click the button below to verify your email address.")
    email.add_button(
        "Verify Email", f"{settings.FRONTEND_URL}/verify?token={otp.token}"
    )
    email.add_paragraph(
        "If you did not create an account, no further action is required."
    )
    email.add_paragraph("Thank you!")
    return email


def initiate_password_reset_email(user):
    otp = OneTimePassword.objects.create(user=user, token_length=20)
    email = Email(subject="Reset your password", to=[user.email], template="default")
    salutation = "Hi"
    if user.first_name:
        salutation += f", {user.first_name}!"
    else:
        salutation += "!"
    email.add_paragraph(salutation)
    email.add_paragraph("Please click the button below to reset your password.")
    email.add_button(
        "Reset Password",
        f"{settings.FRONTEND_URL}/reset-password?token={otp.token}",
    )
    email.add_paragraph(
        "If you did not request a password reset, no further action is required."
    )
    email.add_paragraph("Thank you!")
    return email


def password_changed_email(user):
    email = Email(subject="Password Changed", to=[user.email], template="default")
    salutation = "Hi"
    if user.first_name:
        salutation += f", {user.first_name}!"
    else:
        salutation += "!"
    email.add_paragraph(salutation)
    email.add_paragraph(
        "This is a confirmation that the password for your account has "
        "just been changed."
    )
    email.add_paragraph(
        "If you did not make this change, please contact us immediately. "
        "Otherwise, no further action is required."
    )
    email.add_paragraph("Thank you!")
    return email


def experiment_report_email():
    report = generate_active_experiments_report()
    email = Email(
        subject="Active Experiments Report",
        to=[settings.OWNER_EMAIL],
        template="default",
    )
    for line in report.splitlines()[1:]:  # Skip the header
        if line.startswith("Experiment:"):
            email.add_section_header(line)
        elif line.startswith("Variations:"):
            email.add_divider()
            email.add_section_subheader(line)
        elif line.strip().startswith("- "):
            email.add_bold_text(line.strip().strip("- "))
        else:
            if line.startswith("Description:"):
                email.add_paragraph(line.strip().strip("Description: "))
            else:
                email.add_paragraph(line)
    return email
