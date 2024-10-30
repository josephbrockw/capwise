from datetime import datetime
from unittest.mock import patch

from django.conf import settings
from django.core.management import call_command
from django.test import TestCase

from account.emails import (
    Email,
    experiment_report_email,
    initiate_password_reset_email,
    password_changed_email,
    verification_email,
)
from experiment.models import Experiment


class TestEmailClass(TestCase):
    def setUp(self):
        self.subject = "Test Subject"
        self.to = ["test@example.com"]
        self.template = "default"
        self.email = Email(self.subject, self.to, self.template)

    def test_email_initialization(self):
        """Test that the Email object is initialized with correct values."""
        self.assertEqual(self.email.subject, self.subject)
        self.assertEqual(self.email.to, self.to)
        self.assertEqual(self.email.from_email, settings.DEFAULT_FROM_EMAIL)
        self.assertEqual(self.email.template, self.template)
        self.assertEqual(self.email.context["title"], self.subject)
        self.assertEqual(self.email.context["current_year"], datetime.now().year)
        self.assertEqual(self.email.context["content_list"], [])

    def test_get_template(self):
        """Test that the correct template path is returned."""
        template_path = self.email._get_template()
        self.assertEqual(template_path, f"email/{self.template}.html")

    def test_add_context(self):
        """Test that context can be added to the email."""
        self.email.add_context("user", "John Doe")
        self.assertEqual(self.email.context["user"], "John Doe")

    def test_add_paragraph(self):
        """Test that a paragraph can be added to the content_list."""
        self.email.add_paragraph("This is a test paragraph.")
        self.assertEqual(len(self.email.context["content_list"]), 1)
        self.assertEqual(self.email.context["content_list"][0]["type"], "paragraph")
        self.assertEqual(
            self.email.context["content_list"][0]["text"], "This is a test paragraph."
        )

    def test_add_section_header(self):
        """Test that a section header can be added to the content_list."""
        self.email.add_section_header("Section Header")
        self.assertEqual(len(self.email.context["content_list"]), 1)
        self.assertEqual(
            self.email.context["content_list"][0]["type"], "section_header"
        )
        self.assertEqual(
            self.email.context["content_list"][0]["text"], "Section Header"
        )

    def test_add_section_subheader(self):
        """Test that a section subheader can be added to the content_list."""
        self.email.add_section_subheader("Section Subheader")
        self.assertEqual(len(self.email.context["content_list"]), 1)
        self.assertEqual(
            self.email.context["content_list"][0]["type"], "section_subheader"
        )
        self.assertEqual(
            self.email.context["content_list"][0]["text"], "Section Subheader"
        )

    def test_add_divider(self):
        """Test that a divider can be added to the content_list."""
        self.email.add_divider()
        self.assertEqual(len(self.email.context["content_list"]), 1)
        self.assertEqual(self.email.context["content_list"][0]["type"], "divider")

    def test_add_bold_text(self):
        """Test that bold text can be added to the content_list."""
        self.email.add_bold_text("Bold Text")
        self.assertEqual(len(self.email.context["content_list"]), 1)
        self.assertEqual(self.email.context["content_list"][0]["type"], "bold_text")
        self.assertEqual(self.email.context["content_list"][0]["text"], "Bold Text")

    def test_add_button(self):
        """Test that a button can be added to the content_list."""
        self.email.add_button("Click Me", "http://example.com")
        self.assertEqual(len(self.email.context["content_list"]), 1)
        self.assertEqual(self.email.context["content_list"][0]["type"], "button")
        self.assertEqual(self.email.context["content_list"][0]["text"], "Click Me")
        self.assertEqual(
            self.email.context["content_list"][0]["url"], "http://example.com"
        )

    def test_add_unordered_list(self):
        """Test that an unordered list can be added to the content_list."""
        items = ["Item 1", "Item 2", "Item 3"]
        self.email.add_unordered_list(items)
        self.assertEqual(len(self.email.context["content_list"]), 1)
        self.assertEqual(
            self.email.context["content_list"][0]["type"], "unordered_list"
        )
        self.assertEqual(self.email.context["content_list"][0]["items"], items)

    def test_add_ordered_list(self):
        """Test that an ordered list can be added to the content_list."""
        items = ["First", "Second", "Third"]
        self.email.add_ordered_list(items)
        self.assertEqual(len(self.email.context["content_list"]), 1)
        self.assertEqual(self.email.context["content_list"][0]["type"], "ordered_list")
        self.assertEqual(self.email.context["content_list"][0]["items"], items)

    def test_add_table(self):
        """Test that a table can be added to the content_list."""
        headers = ["Name", "Age"]
        rows = [["Alice", 30], ["Bob", 25]]
        self.email.add_table(headers, rows)
        self.assertEqual(len(self.email.context["content_list"]), 1)
        self.assertEqual(self.email.context["content_list"][0]["type"], "table")
        self.assertEqual(self.email.context["content_list"][0]["headers"], headers)
        self.assertEqual(self.email.context["content_list"][0]["rows"], rows)

    def test_add_space(self):
        """Test that a space can be added to the content_list."""
        self.email.add_space()
        self.assertEqual(len(self.email.context["content_list"]), 1)
        self.assertEqual(self.email.context["content_list"][0]["type"], "space")

    def test_show_content_list(self):
        """Test that content list can be displayed (mock print)."""
        self.email.add_paragraph("First paragraph.")
        with patch("builtins.print") as mocked_print:
            self.email.show_content_list()
            mocked_print.assert_called_with(
                {"type": "paragraph", "text": "First paragraph."}
            )

    def test_send_with_empty_content_list_raises_error(self):
        """Test that sending an email with an empty content list raises ValueError."""
        with self.assertRaises(ValueError) as context:
            self.email.send()
        self.assertEqual(str(context.exception), "No content to send.")

    @patch("account.emails.EmailMultiAlternatives.send")
    @patch("account.emails.render_to_string")
    @patch("account.emails.strip_tags")
    def test_send_email(self, mock_strip_tags, mock_render_to_string, mock_send):
        """Test that an email is sent with the correct content."""
        # Mock the HTML and text content rendering
        mock_render_to_string.return_value = "<p>This is a test email</p>"
        mock_strip_tags.return_value = "This is a test email"

        # Create the Email object
        email = Email(
            subject="Test Subject", to=["test@example.com"], template="default"
        )

        # Add content to the email
        email.add_paragraph("This is a test email content.")

        # Call the send method
        email.send()

        # Check that the HTML content is rendered using the correct template and context
        mock_render_to_string.assert_called_once_with(
            email._get_template(), email.context
        )

        # Check that strip_tags is called with the HTML content
        mock_strip_tags.assert_called_once_with(mock_render_to_string.return_value)

        # Ensure that the send method was called once
        mock_send.assert_called_once()


class TestEmailFunctions(TestCase):
    def setUp(self):
        self.user = self.create_user()

    def create_user(self):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        return User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="password123",
            first_name="Test",
        )

    @patch("account.models.OneTimePassword.objects.create")
    def test_verification_email(self, mock_otp_create):
        """Test that verification email is generated correctly."""
        mock_otp_create.return_value.token = "mocked_token"
        email = verification_email(self.user)
        self.assertEqual(email.subject, "Verify your email")
        self.assertEqual(email.to, [self.user.email])
        self.assertEqual(len(email.context["content_list"]), 5)

    @patch("account.models.OneTimePassword.objects.create")
    def test_initiate_password_reset_email(self, mock_otp_create):
        """Test that password reset email is generated correctly."""
        mock_otp_create.return_value.token = "mocked_token"
        email = initiate_password_reset_email(self.user)
        self.assertEqual(email.subject, "Reset your password")
        self.assertEqual(email.to, [self.user.email])
        self.assertEqual(len(email.context["content_list"]), 5)

    def test_password_changed_email(self):
        """Test that password changed email is generated correctly."""
        email = password_changed_email(self.user)
        self.assertEqual(email.subject, "Password Changed")
        self.assertEqual(email.to, [self.user.email])
        self.assertEqual(len(email.context["content_list"]), 4)

    def test_experiment_report_email(self):
        """Test that experiment report email is generated correctly."""
        call_command("loaddata", "tests/account/fixtures/experiments.yaml")
        email = experiment_report_email()
        self.assertEqual(email.subject, "Active Experiments Report")
        self.assertEqual(email.to, [settings.OWNER_EMAIL])
        self.assertGreater(len(email.context["content_list"]), 0)
        self.assertTrue(
            any(item["type"] == "table" for item in email.context["content_list"])
        )

    def test_experiment_report_email_none_active(self):
        """Test that experiment report email is generated correctly."""
        call_command("loaddata", "tests/account/fixtures/experiments.yaml")
        Experiment.objects.all().update(is_active=False)
        email = experiment_report_email()
        self.assertEqual(email.subject, "Active Experiments Report")
        self.assertEqual(email.to, [settings.OWNER_EMAIL])
        self.assertEqual(len(email.context["content_list"]), 0)
        self.assertFalse(
            any(item["type"] == "table" for item in email.context["content_list"])
        )
