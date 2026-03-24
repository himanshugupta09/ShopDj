from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.api_overview),
    path('products/', api_views.ProductListAPI.as_view()),
    path('products/create/', api_views.ProductCreateAPI.as_view()),
    path('products/<slug:slug>/', api_views.ProductDetailAPI.as_view()),
    path('products/<slug:slug>/update/', api_views.ProductUpdateAPI.as_view()),
    path('products/<slug:slug>/delete/', api_views.ProductDeleteAPI.as_view()),
    path('categories/', api_views.CategoryListAPI.as_view()),
    path('wishlist/', api_views.wishlist_api),
    path('wishlist/toggle/<int:product_id>/', api_views.toggle_wishlist_api),
]