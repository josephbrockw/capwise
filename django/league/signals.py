from datetime import datetime

from django.db.models.signals import post_save
from django.dispatch import receiver
from league.models import DraftPick, Team


@receiver(post_save, sender=Team)
def create_draft_picks_for_new_team(sender, instance, created, **kwargs):
    """Create 7 years of 1st and 2nd round draft picks when a new team is created."""
    if not created:
        return

    current_year = datetime.now().year
    current_month = datetime.now().month
    if current_month >= 10:
        start_year = current_year + 1
    else:
        start_year = current_year

    draft_picks = []
    for year_offset in range(7):
        year = start_year + year_offset
        for round_num in [1, 2]:
            draft_picks.append(
                DraftPick(
                    league=instance.league,
                    original_team=instance,
                    current_team=instance,
                    year=year,
                    round=round_num,
                )
            )

    DraftPick.objects.bulk_create(draft_picks)
