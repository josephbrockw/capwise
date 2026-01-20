import uuid
from urllib.parse import parse_qs

from channels.auth import AuthMiddleware
from channels.db import database_sync_to_async
from channels.sessions import CookieMiddleware, SessionMiddleware
from rest_framework_simplejwt.tokens import AccessToken

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections

User = get_user_model()


class TeamContextMiddleware:
    """
    Middleware that reads X-Team-Context header and attaches team to request.
    For authenticated users, validates they own the team or are league commissioner.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.team = None
        team_id = request.headers.get("X-Team-Context")

        if team_id:
            try:
                from league.models import Team

                team_uuid = uuid.UUID(team_id)
                team = Team.objects.select_related("league", "owner").get(id=team_uuid)

                if request.user.is_authenticated:
                    is_owner = team.owner == request.user
                    is_commissioner = team.league.commissioner == request.user
                    if is_owner or is_commissioner:
                        request.team = team
                else:
                    request.team = team
            except (ValueError, TypeError):
                pass
            except Exception:
                pass

        response = self.get_response(request)
        return response


@database_sync_to_async
def get_user(scope):
    close_old_connections()
    query_string = parse_qs(scope["query_string"].decode())
    token = query_string.get("token")
    if not token:
        return AnonymousUser()

    try:
        access_token = AccessToken(token[0])
        user = User.objects.get(id=access_token["id"])
    except Exception:
        return AnonymousUser()

    if not user.is_active:
        return AnonymousUser()

    return user


class TokenAuthMiddleware(AuthMiddleware):
    async def resolve_scope(self, scope):
        scope["user"]._wrapped = await get_user(scope)


def TokenAuthMiddlewareStack(inner):
    return CookieMiddleware(SessionMiddleware(TokenAuthMiddleware(inner)))
