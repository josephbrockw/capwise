from django.http import JsonResponse
from django.utils.encoding import force_str
from rest_framework import status, viewsets
from rest_framework.exceptions import (
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    ValidationError,
)
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

STANDARD_MESSAGES = {
    "request_successful": "Request successful",
    "error_occurred": "An error occurred",
    "token_invalid": "Your session has expired. Please sign in again.",
    "token_not_found": "Authentication required. Please sign in.",
    "permission_denied": "You don't have permission to perform this action.",
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
        if isinstance(exc, StandardException):
            response = StandardResponse(
                error=exc.message,
                error_code=exc.error_code,
                status=exc.status,
            )
            return response
        elif isinstance(exc, (AuthenticationFailed, InvalidToken)):
            error_detail = force_str(exc)
            if "token_not_valid" in error_detail:
                return StandardResponse(
                    error=STANDARD_MESSAGES["token_invalid"],
                    error_code="TOKEN_EXPIRED",
                    status=401,
                )
            return StandardResponse(
                error=STANDARD_MESSAGES["token_not_found"],
                error_code="AUTHENTICATION_FAILED",
                status=401,
            )
        elif isinstance(exc, NotAuthenticated):
            return StandardResponse(
                error=STANDARD_MESSAGES["token_not_found"],
                error_code="NOT_AUTHENTICATED",
                status=401,
            )
        elif isinstance(exc, PermissionDenied):
            return StandardResponse(
                error=STANDARD_MESSAGES["permission_denied"],
                error_code="PERMISSION_DENIED",
                status=403,
            )
        elif isinstance(exc, ValidationError):
            # Extracting the validation error messages
            if isinstance(exc.detail, dict):
                # Format validation error messages with field names
                error_messages = []
                for field, messages in exc.detail.items():
                    if field == "non_field_errors":
                        if isinstance(messages, list):
                            error_messages.extend([str(msg) for msg in messages])
                        else:
                            error_messages.append(str(messages))
                    else:
                        if isinstance(messages, list):
                            for msg in messages:
                                error_messages.append(f"{field}: {str(msg)}")
                        else:
                            error_messages.append(f"{field}: {str(messages)}")
                combined_message = " ".join(error_messages)
            else:
                combined_message = str(exc.detail)

            # Check if the validation error is related to a blacklisted token
            if (
                "token" in combined_message.lower()
                and "blacklisted" in combined_message.lower()
            ):
                return StandardResponse(
                    error=STANDARD_MESSAGES["token_invalid"],
                    error_code="BLACKLISTED_TOKEN",
                    status=401,
                )

            return StandardResponse(
                error=combined_message,
                error_code="VALIDATION_ERROR",
                status=status.HTTP_400_BAD_REQUEST,
            )

        elif isinstance(exc, TokenError):
            return StandardResponse(
                error=STANDARD_MESSAGES["token_invalid"],
                error_code="INVALID_CREDENTIAL",
                status=401,
            )

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
    def get_serializer(self, *args, **kwargs):
        """
        Returns the serializer instance that should be used for validating and
        deserializing input, and for serializing output.
        """
        serializer_class = self.get_serializer_class()
        kwargs.setdefault("context", self.get_serializer_context())
        return serializer_class(*args, **kwargs)

    def get_serializer_class(self):
        """
        Returns the class to use for the serializer.
        """
        if hasattr(self, "serializer_class"):
            return self.serializer_class
        raise NotImplementedError(
            "Please set 'serializer_class' attribute or override "
            "'get_serializer_class()'."
        )

    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        return {"request": self.request, "format": self.format_kwarg, "view": self}


class StandardAPIView(StandardMixin, APIView):
    pass
