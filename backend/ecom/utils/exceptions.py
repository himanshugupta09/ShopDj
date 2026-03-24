from rest_framework.views import exception_handler
from rest_framework.exceptions import (
    ValidationError,
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    NotFound,
    MethodNotAllowed,
    Throttled
)
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


class AppException(Exception):
    """
    Base custom exception for ShopDjango.
    Use this as parent for all custom exceptions.
    """
    def __init__(self, message="An error occurred", status_code=400, errors=None):
        self.message = message
        self.status_code = status_code
        self.errors = errors
        super().__init__(self.message)


class ProductNotFoundException(AppException):
    def __init__(self, product_id=None):
        message = f"Product not found"
        if product_id:
            message = f"Product with id {product_id} not found"
        super().__init__(message=message, status_code=404)


class OutOfStockException(AppException):
    def __init__(self, product_name=""):
        super().__init__(
            message=f"'{product_name}' is out of stock",
            status_code=400
        )


class CartEmptyException(AppException):
    def __init__(self):
        super().__init__(
            message="Your cart is empty",
            status_code=400
        )


class InvalidCredentialsException(AppException):
    def __init__(self):
        super().__init__(
            message="Invalid username or password",
            status_code=401
        )


class UserAlreadyExistsException(AppException):
    def __init__(self, field="username"):
        super().__init__(
            message=f"This {field} is already registered",
            status_code=400
        )


class OrderNotFoundException(AppException):
    def __init__(self, order_id=None):
        message = "Order not found"
        if order_id:
            message = f"Order #{order_id} not found"
        super().__init__(message=message, status_code=404)


def custom_exception_handler(exc, context):
    """
    Global exception handler — catches ALL exceptions
    and returns standardized JSON responses.
    """

    # Handle our custom AppException first
    if isinstance(exc, AppException):
        logger.error(f"AppException: {exc.message}")
        return Response({
            "success": False,
            "message": exc.message,
            "data": None,
            "errors": exc.errors,
            "status": exc.status_code
        }, status=exc.status_code)

    # Let DRF handle its own exceptions first
    response = exception_handler(exc, context)

    if response is not None:

        # Validation errors (400)
        if isinstance(exc, ValidationError):
            return Response({
                "success": False,
                "message": "Validation failed",
                "data": None,
                "errors": response.data,
                "status": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)

        # Not authenticated (401)
        if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
            return Response({
                "success": False,
                "message": "Authentication required. Please login.",
                "data": None,
                "errors": None,
                "status": status.HTTP_401_UNAUTHORIZED
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Permission denied (403)
        if isinstance(exc, PermissionDenied):
            return Response({
                "success": False,
                "message": "You don't have permission to perform this action",
                "data": None,
                "errors": None,
                "status": status.HTTP_403_FORBIDDEN
            }, status=status.HTTP_403_FORBIDDEN)

        # Not found (404)
        if isinstance(exc, NotFound):
            return Response({
                "success": False,
                "message": "The requested resource was not found",
                "data": None,
                "errors": None,
                "status": status.HTTP_404_NOT_FOUND
            }, status=status.HTTP_404_NOT_FOUND)

        # Method not allowed (405)
        if isinstance(exc, MethodNotAllowed):
            return Response({
                "success": False,
                "message": f"Method not allowed",
                "data": None,
                "errors": None,
                "status": status.HTTP_405_METHOD_NOT_ALLOWED
            }, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        # Rate limit exceeded (429)
        if isinstance(exc, Throttled):
            return Response({
                "success": False,
                "message": f"Too many requests. Try again in {exc.wait} seconds.",
                "data": None,
                "errors": None,
                "status": status.HTTP_429_TOO_MANY_REQUESTS
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

    # Unhandled exceptions (500)
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return Response({
        "success": False,
        "message": "Internal server error",
        "data": None,
        "errors": str(exc) if str(exc) else None,
        "status": status.HTTP_500_INTERNAL_SERVER_ERROR
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)