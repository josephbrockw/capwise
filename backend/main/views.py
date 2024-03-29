import os

from django.http import JsonResponse


def version(request):
    return JsonResponse({"version": os.environ.get("VERSION", "0.0.1")})
