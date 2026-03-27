from rest_framework import serializers
from store.serializers import ProductSerializer
from .models import Cart, CartItem, Order, OrderItem, OrderStatusUpdate

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    item_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'item_total']

    def get_item_total(self, obj):
        return str(obj.get_item_total())

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count']

    def get_total(self, obj):
        return str(obj.get_total())

    def get_item_count(self, obj):
        return obj.items.count()

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusUpdate
        fields = ['status', 'message', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    # This field fetches the new tracking timeline
    tracking_history = OrderStatusUpdateSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'status_display', 'total_price',
            'created_at', 'items', 'tracking_history'
        ]