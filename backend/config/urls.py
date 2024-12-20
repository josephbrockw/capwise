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

from django.conf import settings  # type: ignore
from django.contrib import admin  # type: ignore
from django.urls import include, path  # type: ignore
from drf_spectacular.views import (  # type: ignore
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework.routers import DefaultRouter  # type: ignore

from account.views import test_templates  # type: ignore
from api.views import version  # type: ignore
from api.views.auth import (  # type: ignore
    AuthViewSet,
    LogInView,
    LogoutView,
    TokenRefreshView,
)
from api.views.experiment import ExperimentViewSet  # type: ignore
from api.views.payment import ProductViewSet, PurchaseViewSet  # type: ignore
from api.views.user import UserViewSet  # type: ignore

router = DefaultRouter(trailing_slash=False)
router.register(r"auth", AuthViewSet, basename="auth")
router.register(r"users", UserViewSet, basename="users")
router.register(r"experiments", ExperimentViewSet, basename="experiments")
router.register(r"products", ProductViewSet, basename="products")
router.register(r"purchases", PurchaseViewSet, basename="purchases")

urlpatterns = [
    path("admin", admin.site.urls),
    path("version", version, name="version"),
    path("api/auth/login", LogInView.as_view(), name="log_in"),
    path("api/auth/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout", LogoutView.as_view(), name="log_out"),
    path("api/", include(router.urls)),
    # OpenAPI 3 documentation with Swagger UI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
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
