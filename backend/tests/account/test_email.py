from datetime import datetime
from unittest.mock import patch

from account.emails import Email
from django.conf import settings
from django.test import TestCase


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

    def test_add_button(self):
        """Test that a button can be added to the content_list."""
        self.email.add_button("Click Me", "http://example.com")
        self.assertEqual(len(self.email.context["content_list"]), 1)
        self.assertEqual(self.email.context["content_list"][0]["type"], "button")
        self.assertEqual(self.email.context["content_list"][0]["text"], "Click Me")
        self.assertEqual(
            self.email.context["content_list"][0]["url"], "http://example.com"
        )

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
    # @patch("django.template.loader.render_to_string")
    # @patch("django.utils.html.strip_tags")
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
