from account.models import OneTimePassword, User
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin


@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    pass


@admin.register(OneTimePassword)
class OneTimePasswordAdmin(admin.ModelAdmin):
    pass
