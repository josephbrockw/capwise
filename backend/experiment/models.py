from django.db import models


class Experiment(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name  # pragma: no cover


class Variation(models.Model):
    experiment = models.ForeignKey(
        Experiment, related_name="variations", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=255)
    weight = models.PositiveIntegerField(default=1)  # Weight for allocation
    created_at = models.DateTimeField(auto_now_add=True)
    views = models.PositiveIntegerField(default=0)
    conversions = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.experiment.name} - {self.name}"  # pragma: no cover
