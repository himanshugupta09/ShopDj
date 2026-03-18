from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Q
from .models import Product, Category, Wishlist
from .serializers import ProductSerializer, CategorySerializer, WishlistSerializer


@api_view(['GET'])
def api_overview(request):
    urls = {
        'products': '/api/products/',
        'product_detail': '/api/products/<slug>/',
        'categories': '/api/categories/',
        'register': '/api/auth/register/',
        'login': '/api/auth/login/',
        'profile': '/api/auth/profile/',
        'cart': '/api/cart/',
        'checkout': '/api/cart/checkout/',
        'orders': '/api/orders/',
        'wishlist': '/api/wishlist/',
        'toggle_wishlist': '/api/wishlist/toggle/<product_id>/',
    }
    return Response(urls)


class ProductListAPI(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(
            stock__gt=0
        ).order_by('-created_at')

        q = self.request.GET.get('q')
        category = self.request.GET.get('category')

        if q:
            queryset = queryset.filter(
                Q(name__icontains=q) |
                Q(description__icontains=q) |
                Q(category__name__icontains=q)
            )
        if category:
            queryset = queryset.filter(category__slug=category)

        return queryset

    def get_serializer_context(self):
        return {'request': self.request}


class ProductDetailAPI(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    lookup_field = 'slug'

    def get_serializer_context(self):
        return {'request': self.request}


class CategoryListAPI(generics.ListAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class ProductCreateAPI(generics.CreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]


class ProductUpdateAPI(generics.UpdateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all()
    lookup_field = 'slug'


class ProductDeleteAPI(generics.DestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all()
    lookup_field = 'slug'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_api(request):
    wish, created = Wishlist.objects.get_or_create(user=request.user)
    serializer = WishlistSerializer(wish, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist_api(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    wish, created = Wishlist.objects.get_or_create(user=request.user)

    if product in wish.products.all():
        wish.products.remove(product)
        return Response({
            'status': 'removed',
            'message': f'{product.name} removed from wishlist'
        })
    else:
        wish.products.add(product)
        return Response({
            'status': 'added',
            'message': f'{product.name} added to wishlist'
        })