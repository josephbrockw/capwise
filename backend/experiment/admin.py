# register the Experiment and Variation models in the Django admin site
from django.contrib import admin

from .models import Experiment, Variation


@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_active", "created_at")
    search_fields = ("name",)
    list_filter = ("is_active",)


@admin.register(Variation)
class VariationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "experiment",
        "weight",
        "views",
        "conversions",
        "created_at",
    )
    search_fields = ("name",)
    list_filter = ("experiment",)
    raw_id_fields = ("experiment",)
    ordering = ("experiment", "weight")
