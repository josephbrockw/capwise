"""config URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.views import version
from api.views.auth import LogInView, AuthViewSet, TokenRefreshView
from main.views import test_templates

router = DefaultRouter(trailing_slash=False)
router.register(r"auth", AuthViewSet, basename="auth")

urlpatterns = [
    path("admin", admin.site.urls),
    path("version", version, name="version"),
    path("api/login", LogInView.as_view(), name="log_in"),
    path("api/token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include(router.urls)),
]

dev_patterns = [
    path(
        "test-templates/<str:directory>/<str:template>",
        test_templates,
        name="test_templates",
    ),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
]


if settings.DEBUG:
    urlpatterns += dev_patterns
