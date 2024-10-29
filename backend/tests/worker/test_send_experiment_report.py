import os
from unittest.mock import patch

from django.core import mail
from django.test import TestCase, override_settings

from worker.tasks import send_experiment_report_email


class SendExperimentReportEmailTest(TestCase):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    fixtures = [os.path.join(base_dir, "fixtures", "experiments.yaml")]

    @patch("worker.tasks.experiment_report_email")
    def test_send_experiment_report_email_task(self, mock_experiment_report_email):
        """Test that the send_experiment_report_email task sends an email."""
        mock_email_instance = mock_experiment_report_email.return_value
        send_experiment_report_email()
        mock_email_instance.send.assert_called_once()

    @override_settings(OWNER_EMAIL="owner@example.com")
    def test_send_experiment_report_email_outbox(self):
        """Test that the email is actually being sent."""
        send_experiment_report_email()
        # Verify that exactly one email was sent
        self.assertEqual(len(mail.outbox), 1)
        # Verify the email content
        sent_email = mail.outbox[0]
        self.assertEqual(sent_email.subject, "Active Experiments Report")
        self.assertIn("owner@example.com", sent_email.to)
