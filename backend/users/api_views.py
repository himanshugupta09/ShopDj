from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .serializers import UserSerializer, ProfileSerializer
from ecom.utils.responses import APIResponse
from ecom.utils.exceptions import (
    InvalidCredentialsException,
    UserAlreadyExistsException
)


class RegisterAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if not username or not email or not password:
            return APIResponse.error(
                message="Username, email and password are required"
            )

        if User.objects.filter(username=username).exists():
            raise UserAlreadyExistsException('username')

        if User.objects.filter(email=email).exists():
            raise UserAlreadyExistsException('email')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        refresh = RefreshToken.for_user(user)
        return APIResponse.created(
            data={
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(
                    user, context={'request': request}
                ).data
            },
            message="Account created successfully"
        )


class LoginAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return APIResponse.error(
                message="Username and password required"
            )

        user = authenticate(username=username, password=password)

        if user is None:
            raise InvalidCredentialsException()

        refresh = RefreshToken.for_user(user)
        return APIResponse.success(
            data={
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(
                    user, context={'request': request}
                ).data
            },
            message=f"Welcome back, {user.first_name}!"
        )


class ProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(
            request.user,
            context={'request': request}
        )
        return APIResponse.success(data=serializer.data)

    def put(self, request):
        serializer = ProfileSerializer(
            request.user.profile,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(
                data=serializer.data,
                message="Profile updated successfully"
            )
        return APIResponse.validation_error(errors=serializer.errors)


class ChangePasswordAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return APIResponse.error(
                message="Old password is incorrect"
            )

        user.set_password(new_password)
        user.save()
        return APIResponse.success(
            message="Password updated successfully"
        )