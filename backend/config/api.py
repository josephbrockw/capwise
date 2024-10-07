from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse


class StandardResponse(JsonResponse):
    def __init__(self, data={}, message="", error="", status=400, **kwargs):
        formatted_data = {
            "data": data,
            "message": message,
            "error": error,
        }
        super().__init__(formatted_data, status=status, **kwargs)


class StandardViewSet(viewsets.ModelViewSet):
    def finalize_response(self, request, response, *args, **kwargs):
        # Ensure the original response is a DRF Response object
        if isinstance(response, JsonResponse):
            return super().finalize_response(request, response, *args, **kwargs)

        message = getattr(response, "message", "")
        error = getattr(response, "error", "")
        status_code = getattr(response, "status_code", 200)

        # Structure the new response format if response.status_code >= 400:
        if response.status_code >= 400:
            data = {}
            if not message:
                msg = "An error occurred"
            if not error:
                err = response.data
        else:
            data = response.data
            if not message:
                msg = "Request successful"
            err = None
            if not error:
                err = ""

        # Create a new StandardResponse object to structure the data
        response = StandardResponse(data, msg, err, status=status_code)
        return super().finalize_response(request, response, *args, **kwargs)


class StandardAPIView(APIView):
    def finalize_response(self, request, response, *args, **kwargs):
        # Ensure the original response is a DRF Response object
        if isinstance(response, StandardResponse):
            return super().finalize_response(request, response, *args, **kwargs)

        print(response)
        message = getattr(response, "message", "")
        error = getattr(response, "error", "")
        status_code = getattr(response, "status_code", 200)

        # Structure the new response format if response.status_code >= 400:
        if response.status_code >= 400:
            data = {}
            if not message:
                msg = "An error occurred"
            if not error:
                err = response.data
        else:
            data = response.data
            if not message:
                msg = "Request successful"
            err = None
            if not error:
                err = ""

        # Create a new StandardResponse object to structure the data
        response = StandardResponse(data, msg, err, status=status_code)
        return super().finalize_response(request, response, *args, **kwargs)
