from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from store.models import Product
from .models import Cart, CartItem, Order, OrderItem


@login_required
def cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    items = cart.items.select_related('product').all()
    context = {
        'cart': cart,
        'items': items,
        'total': cart.get_total(),
    }
    return render(request, 'orders/cart.html', context)


@login_required
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if not product.is_in_stock():
        messages.error(request, f'"{product.name}" is out of stock ❌')
        return redirect('product_detail', slug=product.slug)

    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_item, item_created = CartItem.objects.get_or_create(
        cart=cart,
        product=product
    )

    if not item_created:
        if cart_item.quantity < product.stock:
            cart_item.quantity += 1
            cart_item.save()
            messages.success(request, f'"{product.name}" quantity updated 🛒')
        else:
            messages.warning(request, f'Max stock reached ⚠️')
    else:
        messages.success(request, f'"{product.name}" added to cart ✅')

    return redirect('cart')


@login_required
def remove_from_cart(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    product_name = cart_item.product.name
    cart_item.delete()
    messages.success(request, f'"{product_name}" removed 🗑️')
    return redirect('cart')


@login_required
def update_cart(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    quantity = int(request.POST.get('quantity', 1))

    if quantity <= 0:
        cart_item.delete()
        messages.success(request, 'Item removed from cart')
    elif quantity <= cart_item.product.stock:
        cart_item.quantity = quantity
        cart_item.save()
        messages.success(request, 'Cart updated ✅')
    else:
        messages.warning(request, f'Only {cart_item.product.stock} in stock ⚠️')

    return redirect('cart')


@login_required
def checkout(request):
    cart = get_object_or_404(Cart, user=request.user)
    items = cart.items.select_related('product').all()

    if not items:
        messages.warning(request, 'Your cart is empty!')
        return redirect('cart')

    if request.method == 'POST':
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
        messages.success(request, f'Order #{order.id} placed! 🎉')
        return redirect('order_confirmation', order_id=order.id)

    context = {
        'cart': cart,
        'items': items,
        'total': cart.get_total(),
        'address': request.user.profile.address,
    }
    return render(request, 'orders/checkout.html', context)


@login_required
def order_confirmation(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    items = order.items.select_related('product').all()
    return render(request, 'orders/order_confirmation.html', {
        'order': order,
        'items': items
    })


@login_required
def order_history(request):
    orders = Order.objects.filter(
        user=request.user
    ).order_by('-created_at').prefetch_related('items__product')
    return render(request, 'orders/order_history.html', {'orders': orders})


@login_required
def update_order_status(request, order_id):
    if request.user.profile.role != 'admin':
        raise PermissionDenied
    order = get_object_or_404(Order, id=order_id)
    if request.method == 'POST':
        order.status = request.POST.get('status')
        order.save()
        messages.success(request, f'Order #{order.id} updated ✅')
    return redirect('order_history')