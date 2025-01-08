from rest_framework import status
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny

from api.serializers import DiscountCodeSerializer, ProductSerializer
from config.api import StandardResponse, StandardViewSet
from payment.models import DiscountCode, Product


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


class PurchaseViewSet(StandardViewSet):
    permission_classes = [AllowAny]

    @action(
        detail=False,
        methods=["post"],
        url_path="check-discount",
        url_name="check_discount",
    )
    def check_discount(self, request):
        code = request.data.get("code", "").upper()
        product_id = request.data.get("product_id", None)

        discount = get_object_or_404(DiscountCode, code=code)

        # If discount is tied to a specific product, make sure it matches
        if discount.product and str(discount.product.id) != product_id:
            return StandardResponse(
                error="Discount code is not valid for this product.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        # certify that discount applies
        if discount.is_active:
            serializer = DiscountCodeSerializer(discount)
            return StandardResponse(
                data=serializer.data,
                message="Discount code applied successfully.",
                status=status.HTTP_200_OK,
            )

        # Discount is not active and does not apply
        return StandardResponse(
            error="Invalid discount code.", status=status.HTTP_400_BAD_REQUEST
        )
