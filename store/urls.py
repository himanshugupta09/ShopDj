from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),

    path('products/', views.ProductListView.as_view(), name='product_list'),
    # .as_view() converts CBV class into a callable view function

    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
    # <slug:slug> matches URL-friendly strings like "samsung-tv-2025"

    path('category/<slug:slug>/', views.category_products, name='category_products'),
]