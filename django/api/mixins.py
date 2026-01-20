class TeamContextMixin:
    """
    Mixin for views that require team context.
    Provides helper methods to access team and league from request.
    """

    def get_team(self):
        return getattr(self.request, "team", None)

    def get_league(self):
        team = self.get_team()
        return team.league if team else None
