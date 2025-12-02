from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Activate or deactivate a user."

    def add_arguments(self, parser):
        parser.add_argument(
            "email", type=str, help="Email of the user to be activated or deactivated."
        )
        parser.add_argument(
            "action",
            type=str,
            choices=["activate", "deactivate"],
            help="Action to perform: activate or deactivate the user.",
        )

    def handle(self, *args, **options):
        email = options["email"]
        action = options["action"]
        print(f"action: {action}")

        try:
            user = User.objects.get(email=email)
        except ObjectDoesNotExist:
            self.stdout.write(self.style.ERROR(f'User "{email}" does not exist.'))
        try:
            if action == "activate":
                if user.is_active:
                    self.stdout.write(
                        self.style.WARNING(f'User "{email}" is already active.')
                    )
                else:
                    user.is_active = True
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'User "{email}" has been activated.')
                    )
            else:
                if not user.is_active:
                    self.stdout.write(
                        self.style.WARNING(f'User "{email}" is already deactivated.')
                    )
                else:
                    user.is_active = False
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'User "{email}" has been deactivated.')
                    )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {str(e)}"))
