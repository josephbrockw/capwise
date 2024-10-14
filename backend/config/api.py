from django.http import JsonResponse
from django.utils.encoding import force_str
from rest_framework import status, viewsets
from rest_framework.exceptions import (AuthenticationFailed, NotAuthenticated,
                                       PermissionDenied, ValidationError)
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError

STANDARD_MESSAGES = {
    "request_successful": "Request successful",
    "error_occurred": "An error occurred",
}


class StandardResponse(JsonResponse):
    def __init__(
        self, data={}, message="", error="", error_code=None, status=400, **kwargs
    ):
        formatted_data = {
            "data": data,
            "message": message,
            "error": error,
            "error_code": error_code,
        }
        super().__init__(formatted_data, status=status, **kwargs)


class StandardException(Exception):
    def __init__(self, message, error_code=None, status=400):
        self.message = message
        self.error_code = error_code
        self.status = status


class StandardMixin:
    def handle_exception(self, exc):
        print(type(exc))
        if isinstance(exc, StandardException):
            response = StandardResponse(
                error=exc.message,
                error_code=exc.error_code,
                status=exc.status,
            )
            return response
        elif isinstance(exc, AuthenticationFailed):
            return StandardResponse(
                error=force_str(exc), error_code="AUTHENTICATION_FAILED", status=401
            )
        elif isinstance(exc, NotAuthenticated):
            return StandardResponse(
                error=force_str(exc), error_code="NOT_AUTHENTICATED", status=401
            )
        elif isinstance(exc, PermissionDenied):
            return StandardResponse(
                error=force_str(exc), error_code="PERMISSION_DENIED", status=403
            )
        elif isinstance(exc, ValidationError):
            # Extracting the validation error messages
            if isinstance(exc.detail, dict):
                # Flattening the validation error messages
                error_messages = []
                for field, messages in exc.detail.items():
                    if isinstance(messages, list):
                        error_messages.extend([str(msg) for msg in messages])
                    else:
                        error_messages.append(str(messages))
                combined_message = " ".join(error_messages)
            else:
                combined_message = str(exc.detail)

            return StandardResponse(
                error=combined_message,
                error_code="VALIDATION_ERROR",
                status=status.HTTP_400_BAD_REQUEST,
            )
        elif isinstance(exc, TokenError):
            error_message = force_str(exc)
            response = StandardResponse(
                data={},
                message="",
                error=error_message,
                error_code="INVALID_CREDENTIAL",
                status=401,
            )
            return response
        return super().handle_exception(exc)

    def finalize_response(self, request, response, *args, **kwargs):
        # Ensure the original response is a StandardResponse object
        if isinstance(response, StandardResponse):
            return super().finalize_response(request, response, *args, **kwargs)

        if response.status_code >= 400:
            message = ""
            error = getattr(response, "error", STANDARD_MESSAGES["error_occurred"])
        else:
            message = getattr(
                response, "message", STANDARD_MESSAGES["request_successful"]
            )
            error = getattr(response, "error", "")

        error_code = getattr(response, "error_code", None)
        status_code = getattr(response, "status_code", 200)
        data = response.data if response.status_code < 400 else {}

        # Create a new StandardResponse object to structure the data
        response = StandardResponse(
            data=data,
            message=message,
            error=error,
            error_code=error_code,
            status=status_code,
        )
        return super().finalize_response(request, response, *args, **kwargs)


class StandardViewSet(StandardMixin, viewsets.ViewSet):
    pass


class StandardAPIView(StandardMixin, APIView):
    pass
