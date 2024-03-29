from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView


class StandardViewSet(viewsets.ModelViewSet):
    def finalize_response(self, request, response, *args, **kwargs):
        # Ensure the original response is a DRF Response object
        if not isinstance(response, Response):
            return super().finalize_response(request, response, *args, **kwargs)

        # Structure the new response format if response.status_code >= 400:
        if response.status_code >= 400:
            data = {
                "data": None,
                "message": "An error occurred",
                "error": response.data,
            }
        else:
            data = {
                "data": response.data,
                "message": "Request successful",
                "error": None,
            }

        # Create a new Response object with the structured data
        response = Response(data, status=response.status_code)
        return super().finalize_response(request, response, *args, **kwargs)


class StandardAPIView(APIView):
    def finalize_response(self, request, response, *args, **kwargs):
        # Ensure the original response is a DRF Response object
        if not isinstance(response, Response):
            return super().finalize_response(request, response, *args, **kwargs)

        # Structure the new response format
        if response.status_code >= 400:
            data = {
                "data": None,
                "message": "An error occurred",
                "error": response.data,
            }
        else:
            data = {
                "data": response.data,
                "message": "Request successful",
                "error": None,
            }

        # Create a new Response object with the structured data
        response = Response(data, status=response.status_code)
        return super().finalize_response(request, response, *args, **kwargs)
