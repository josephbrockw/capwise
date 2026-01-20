from django.db import migrations


def seed_positions(apps, schema_editor):
    Position = apps.get_model("league", "Position")
    positions = [
        ("PG", "Point Guard"),
        ("SG", "Shooting Guard"),
        ("SF", "Small Forward"),
        ("PF", "Power Forward"),
        ("C", "Center"),
        ("G", "Guard"),
        ("F", "Forward"),
        ("UTIL", "Utility"),
    ]
    for code, name in positions:
        Position.objects.get_or_create(code=code, defaults={"name": name})


def reverse_seed_positions(apps, schema_editor):
    Position = apps.get_model("league", "Position")
    Position.objects.filter(
        code__in=["PG", "SG", "SF", "PF", "C", "G", "F", "UTIL"]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("league", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_positions, reverse_seed_positions),
    ]
