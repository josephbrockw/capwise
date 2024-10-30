from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse


@override_settings(DEBUG=True)
class TestEmailTemplatesView(TestCase):
    # def test_welcome_template_renders_correctly(self):
    #     """Test that the 'welcome' template is rendered with the correct context."""
    #     response = self.client.get(f'{self.url}?template=')
    #     self.assertEqual(response.status_code, 200)
    #     self.assertContains(response, "Welcome, friend!")
    #     self.assertContains(response, "Hello, Gytha Ogg!")
    #     self.assertContains(response, "Get Started")

    def test_verify_template_renders_correctly(self):
        """Test that the 'verify' template is rendered with the correct context."""
        url = reverse("test_templates", args=["email", "verify"])
        get_user_model().objects.create_user(
            email="svimes@ankhmorpork.gov",
            username="sam",
            first_name="Sam",
            password="password",
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_initiate_password_reset_template_renders_correctly(self):
        """Test that the 'verify' template is rendered with the correct context."""
        url = reverse("test_templates", args=["email", "initiate-password-reset"])
        get_user_model().objects.create_user(
            email="svimes@ankhmorpork.gov",
            username="sam",
            first_name="Sam",
            password="password",
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_confirm_password_reset_template_renders_correctly(self):
        """Test that the 'verify' template is rendered with the correct context."""
        url = reverse("test_templates", args=["email", "confirm-password-reset"])
        get_user_model().objects.create_user(
            email="svimes@ankhmorpork.gov",
            username="sam",
            first_name="Sam",
            password="password",
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_experiment_report_template_renders_correctly(self):
        """
        Test that the 'experiment-report' template is rendered
        with the correct context.
        """
        url = reverse("test_templates", args=["email", "experiment-report"])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_default_template_renders_correctly(self):
        """Test that the default case is rendered when no template is passed."""
        url = reverse("test_templates", args=["email", "default"])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
