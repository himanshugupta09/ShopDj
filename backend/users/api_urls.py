from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import api_views

urlpatterns = [
    path('register/', api_views.RegisterAPI.as_view()),
    path('login/', api_views.LoginAPI.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', api_views.ProfileAPI.as_view()),
    path('change-password/', api_views.ChangePasswordAPI.as_view()),
]