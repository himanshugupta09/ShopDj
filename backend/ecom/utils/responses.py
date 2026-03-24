from rest_framework.response import Response
from rest_framework import status


class APIResponse:
    """
    Standardized API response class.
    All API responses follow the same structure:
    {
        "success": true/false,
        "message": "...",
        "data": {...} or null,
        "errors": {...} or null,
        "status": 200
    }
    """

    @classmethod
    def success(cls, data=None, message="Success", status_code=status.HTTP_200_OK):
        return Response({
            "success": True,
            "message": message,
            "data": data,
            "errors": None,
            "status": status_code
        }, status=status_code)

    @classmethod
    def created(cls, data=None, message="Created successfully"):
        return Response({
            "success": True,
            "message": message,
            "data": data,
            "errors": None,
            "status": status.HTTP_201_CREATED
        }, status=status.HTTP_201_CREATED)

    @classmethod
    def error(cls, message="Something went wrong", errors=None,
              status_code=status.HTTP_400_BAD_REQUEST):
        return Response({
            "success": False,
            "message": message,
            "data": None,
            "errors": errors,
            "status": status_code
        }, status=status_code)

    @classmethod
    def not_found(cls, message="Resource not found"):
        return Response({
            "success": False,
            "message": message,
            "data": None,
            "errors": None,
            "status": status.HTTP_404_NOT_FOUND
        }, status=status.HTTP_404_NOT_FOUND)

    @classmethod
    def unauthorized(cls, message="Authentication required"):
        return Response({
            "success": False,
            "message": message,
            "data": None,
            "errors": None,
            "status": status.HTTP_401_UNAUTHORIZED
        }, status=status.HTTP_401_UNAUTHORIZED)

    @classmethod
    def forbidden(cls, message="You don't have permission"):
        return Response({
            "success": False,
            "message": message,
            "data": None,
            "errors": None,
            "status": status.HTTP_403_FORBIDDEN
        }, status=status.HTTP_403_FORBIDDEN)

    @classmethod
    def validation_error(cls, errors, message="Validation failed"):
        return Response({
            "success": False,
            "message": message,
            "data": None,
            "errors": errors,
            "status": status.HTTP_422_UNPROCESSABLE_ENTITY
        }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)