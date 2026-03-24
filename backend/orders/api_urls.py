from django.urls import path
from . import api_views

urlpatterns = [
    path('cart/', api_views.CartAPI.as_view()),
    path('cart/add/<int:product_id>/', api_views.CartItemAPI.as_view()),
    path('cart/update/<int:item_id>/', api_views.CartItemAPI.as_view()),
    path('cart/remove/<int:item_id>/', api_views.CartItemAPI.as_view()),
    path('cart/checkout/', api_views.CheckoutAPI.as_view()),
    path('orders/', api_views.OrderListAPI.as_view()),
    path('orders/<int:order_id>/', api_views.OrderDetailAPI.as_view()),
]