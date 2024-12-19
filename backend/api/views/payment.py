from rest_framework import status
from rest_framework.permissions import AllowAny

from api.serializers import ProductSerializer
from config.api import StandardResponse, StandardViewSet
from payment.models import Product


class ProductViewSet(StandardViewSet):
    queryset = Product.objects.all()
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(is_active=True)

    def list(self, request):
        products = self.get_queryset()
        serializer = self.get_serializer(products, many=True)
        return StandardResponse(
            data=serializer.data,
            message="Products retrieved successfully.",
            status=status.HTTP_200_OK,
        )
