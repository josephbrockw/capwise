from rest_framework import permissions


class HasTeamContext(permissions.BasePermission):
    """
    Requires valid team context header (X-Team-Context).
    """

    message = "Team context header (X-Team-Context) is required."

    def has_permission(self, request, view):
        return getattr(request, "team", None) is not None


class IsTeamOwner(permissions.BasePermission):
    """
    User must own the team in context.
    """

    message = "You must be the owner of the team."

    def has_permission(self, request, view):
        team = getattr(request, "team", None)
        if not team:
            return False
        if not request.user.is_authenticated:
            return False
        return team.owner == request.user


class IsLeagueCommissioner(permissions.BasePermission):
    """
    User must be commissioner of the team's league.
    """

    message = "You must be the league commissioner."

    def has_permission(self, request, view):
        team = getattr(request, "team", None)
        if not team:
            return False
        if not request.user.is_authenticated:
            return False
        return team.league.commissioner == request.user


class IsTeamOwnerOrCommissioner(permissions.BasePermission):
    """
    User must be either team owner or league commissioner.
    """

    message = "You must be the team owner or league commissioner."

    def has_permission(self, request, view):
        team = getattr(request, "team", None)
        if not team:
            return False
        if not request.user.is_authenticated:
            return False
        return team.owner == request.user or team.league.commissioner == request.user
