from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from orders.views import cart
from store.models import Product
from .models import Cart, CartItem, Delivery, Order, OrderItem
from .serializers import CartSerializer, OrderSerializer
from ecom.utils.responses import APIResponse
from ecom.utils.exceptions import (
    ProductNotFoundException,
    OutOfStockException,
    CartEmptyException,
    OrderNotFoundException
)



class CheckoutAPI(APIView):
    def post(self, request):
        address_id = request.data.get('address_id')
        
        order = Order.objects.create(
            user=request.user,
            total_price=cart.get_total(),
            status='processing' # Move from pending to processing
        )
        
        Delivery.objects.create(
            order=order,
            tracking_number=f"SDJ-{order.id}-{request.user.id}" # Simple tracking logic
        )

class CartAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return APIResponse.success(data=serializer.data)


class CartItemAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise ProductNotFoundException(product_id)

        if not product.is_in_stock():
            raise OutOfStockException(product.name)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product
        )

        if not created:
            if cart_item.quantity < product.stock:
                cart_item.quantity += 1
                cart_item.save()
            else:
                return APIResponse.error(
                    message=f"Max stock reached for {product.name}"
                )

        return APIResponse.success(
            data={
                'cart_total': str(cart.get_total()),
                'item_count': cart.items.count()
            },
            message=f"{product.name} added to cart"
        )

    def put(self, request, item_id):
        try:
            cart_item = CartItem.objects.get(
                id=item_id, cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return APIResponse.not_found("Cart item not found")

        quantity = request.data.get('quantity', 1)

        if quantity <= 0:
            cart_item.delete()
            return APIResponse.success(message="Item removed from cart")
        elif quantity <= cart_item.product.stock:
            cart_item.quantity = quantity
            cart_item.save()
            return APIResponse.success(message="Cart updated")
        else:
            return APIResponse.error(
                message=f"Only {cart_item.product.stock} items in stock"
            )

    def delete(self, request, item_id):
        try:
            cart_item = CartItem.objects.get(
                id=item_id, cart__user=request.user
            )
            name = cart_item.product.name
            cart_item.delete()
            return APIResponse.success(
                message=f"{name} removed from cart"
            )
        except CartItem.DoesNotExist:
            return APIResponse.not_found("Cart item not found")


class CheckoutAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            raise CartEmptyException()

        items = cart.items.select_related('product').all()

        if not items:
            raise CartEmptyException()

        order = Order.objects.create(
            user=request.user,
            total_price=cart.get_total(),
            status='pending'
        )

        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            item.product.stock -= item.quantity
            item.product.save()

        cart.items.all().delete()

        return APIResponse.created(
            data={
                'order_id': order.id,
                'total': str(order.total_price),
                'status': order.status
            },
            message="Order placed successfully! 🎉"
        )


class OrderListAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(
            user=request.user
        ).order_by('-created_at').prefetch_related('items__product')
        serializer = OrderSerializer(orders, many=True)
        return APIResponse.success(data=serializer.data)


class OrderDetailAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            raise OrderNotFoundException(order_id)

        serializer = OrderSerializer(order)
        return APIResponse.success(data=serializer.data)