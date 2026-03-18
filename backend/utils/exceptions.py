from rest_framework.views import exception_handler
from rest_framework import status
from .responses import error_response


def custom_exception_handler(exc, context):
    # Call DRF's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        error_map = {
            400: "Bad request",
            401: "Authentication required",
            403: "Permission denied",
            404: "Resource not found",
            405: "Method not allowed",
            500: "Internal server error",
        }

        message = error_map.get(response.status_code, "Something went wrong")

        # Extract error details
        errors = response.data
        if isinstance(errors, dict) and 'detail' in errors:
            message = str(errors['detail'])
            errors = None

        return error_response(
            message=message,
            errors=errors,
            status_code=response.status_code
        )

    return response