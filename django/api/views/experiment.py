from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny

from config.api import StandardResponse, StandardViewSet
from experiment.models import Experiment


class ExperimentViewSet(StandardViewSet):
    queryset = Experiment.objects.all()
    permission_classes = [AllowAny]

    @action(detail=True, methods=["post"], url_path="track-view")
    def track_view(self, request, pk=None):
        """
        Track that a variation has been shown to the user.
        """
        experiment = Experiment.objects.get(pk=pk)
        variation_name = request.data.get("variation")
        variation = experiment.variations.filter(name=variation_name).first()

        if variation is None:
            return StandardResponse(
                error="Variation not found.", status=status.HTTP_400_BAD_REQUEST
            )

        variation.views += 1
        variation.save()
        return StandardResponse(
            message="View tracked successfully.", status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"], url_path="track-conversion")
    def track_conversion(self, request, pk=None):
        """
        Track that a user has performed the desired outcome for a variation.
        """
        experiment = Experiment.objects.get(pk=pk)
        variation_name = request.data.get("variation")
        variation = experiment.variations.filter(name=variation_name).first()

        if variation is None:
            return StandardResponse(
                error="Variation not found.", status=status.HTTP_400_BAD_REQUEST
            )

        variation.conversions += 1
        variation.save()
        return StandardResponse(
            message="Conversion tracked successfully.", status=status.HTTP_200_OK
        )
