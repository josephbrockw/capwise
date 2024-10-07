from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin

from account.models import User, OneTimePassword


@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    pass


@admin.register(OneTimePassword)
class OneTimePasswordAdmin(admin.ModelAdmin):
    pass
