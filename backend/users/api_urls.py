from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import api_views

urlpatterns = [
    path('register/', api_views.register_api),
    path('login/', api_views.login_api),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', api_views.profile_api),
    path('change-password/', api_views.change_password_api),
]