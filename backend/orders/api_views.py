from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from store.models import Product
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, OrderSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_api(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart_api(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if not product.is_in_stock():
        return Response(
            {'error': f'{product.name} is out of stock'},
            status=status.HTTP_400_BAD_REQUEST
        )

    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product
    )

    if not created:
        if cart_item.quantity < product.stock:
            cart_item.quantity += 1
            cart_item.save()
        else:
            return Response(
                {'error': 'Max stock reached'},
                status=status.HTTP_400_BAD_REQUEST
            )

    return Response({
        'message': f'{product.name} added to cart',
        'cart_total': str(cart.get_total()),
        'item_count': cart.items.count()
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart_api(request, item_id):
    try:
        cart_item = CartItem.objects.get(
            id=item_id,
            cart__user=request.user
        )
        cart_item.delete()
        return Response({'message': 'Item removed from cart'})
    except CartItem.DoesNotExist:
        return Response(
            {'error': 'Item not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item_api(request, item_id):
    try:
        cart_item = CartItem.objects.get(
            id=item_id,
            cart__user=request.user
        )
    except CartItem.DoesNotExist:
        return Response(
            {'error': 'Item not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    quantity = request.data.get('quantity', 1)

    if quantity <= 0:
        cart_item.delete()
        return Response({'message': 'Item removed'})
    elif quantity <= cart_item.product.stock:
        cart_item.quantity = quantity
        cart_item.save()
        return Response({'message': 'Cart updated'})
    else:
        return Response(
            {'error': f'Only {cart_item.product.stock} in stock'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_api(request):
    try:
        cart = Cart.objects.get(user=request.user)
    except Cart.DoesNotExist:
        return Response(
            {'error': 'Cart not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    items = cart.items.select_related('product').all()

    if not items:
        return Response(
            {'error': 'Cart is empty'},
            status=status.HTTP_400_BAD_REQUEST
        )

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

    return Response({
        'message': 'Order placed successfully! 🎉',
        'order_id': order.id,
        'total': str(order.total_price),
        'status': order.status
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_history_api(request):
    orders = Order.objects.filter(
        user=request.user
    ).order_by('-created_at').prefetch_related('items__product')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail_api(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )