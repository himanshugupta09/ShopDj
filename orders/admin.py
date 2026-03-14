from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem
admin.site.register(Order)
admin.site.register(Cart)

# Register your models here.
