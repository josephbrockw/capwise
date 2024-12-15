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

    def add_unordered_list(self, items):
        self.context["content_list"].append({"type": "unordered_list", "items": items})

    def add_ordered_list(self, items):
        self.context["content_list"].append({"type": "ordered_list", "items": items})

    def add_table(self, headers, rows):
        self.context["content_list"].append(
            {"type": "table", "headers": headers, "rows": rows}
        )

    def add_space(self):
        self.context["content_list"].append({"type": "space"})

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
    otp = OneTimePassword.objects.create(user=user, token_length=6)
    email = Email(subject="Verify your email", to=[user.email], template="default")
    email.add_paragraph(user.salutation())
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
    otp = OneTimePassword.objects.create(user=user, token_length=6)
    email = Email(subject="Reset your password", to=[user.email], template="default")
    email.add_paragraph(user.salutation())
    email.add_paragraph("Please click the button below to reset your password.")
    email.add_button(
        "Reset Password",
        f"{settings.FRONTEND_URL}/password/confirm?token={otp.token}",
    )
    email.add_paragraph(
        "If you did not request a password reset, no further action is required."
    )
    email.add_paragraph("Thank you!")
    return email


def password_changed_email(user):
    email = Email(subject="Password Changed", to=[user.email], template="default")
    print(f"salutation: {user.salutation()}")
    email.add_paragraph(user.salutation())
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
    lines = report.splitlines()[1:]  # Skip the header
    table_headers = None
    table_data = []

    for i, line in enumerate(lines):
        if line.startswith("Experiment:"):
            # Add the previous table if it exists before starting a new experiment
            if table_headers and table_data:
                email.add_table(table_headers, table_data)
                email.add_space()
                table_headers = None
                table_data = []

            # Add the experiment section header
            email.add_section_header(line)
        elif line.startswith("Description:"):
            email.add_paragraph(line.replace("Description: ", ""))
        elif line.startswith("Created at:"):
            email.add_paragraph(line)
        elif line.startswith("Variations:"):
            email.add_divider()
            email.add_section_subheader(line)
        elif "Name,Weight,Views,Conversion Rate" in line:
            # Capture the header row for stats
            table_headers = line.split(",")
        elif table_headers:
            # The next line should be the stats data
            stats = line.split(",")
            table_data.append(stats)

    # If there was a table pending, add it to the email
    if table_headers and table_data:
        email.add_table(table_headers, table_data)

    return email
