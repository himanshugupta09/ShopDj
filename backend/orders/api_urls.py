from django.urls import path
from . import api_views

urlpatterns = [
    path('cart/', api_views.cart_api),
    path('cart/add/<int:product_id>/', api_views.add_to_cart_api),
    path('cart/remove/<int:item_id>/', api_views.remove_from_cart_api),
    path('cart/update/<int:item_id>/', api_views.update_cart_item_api),
    path('cart/checkout/', api_views.checkout_api),
    path('orders/', api_views.order_history_api),
    path('orders/<int:order_id>/', api_views.order_detail_api),
]