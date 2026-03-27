from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.db.models import Q
from .models import Product, Category, Wishlist
from .serializers import ProductSerializer, CategorySerializer, WishlistSerializer
from ecom.utils.responses import APIResponse
from ecom.utils.exceptions import ProductNotFoundException, OutOfStockException


@api_view(['GET'])
def api_overview(request):
    urls = {
        'products': '/api/products/',
        'product_detail': '/api/products/<slug>/',
        'categories': '/api/categories/',
        'register': '/api/auth/register/',
        'login': '/api/auth/login/',
        'cart': '/api/cart/',
        'checkout': '/api/cart/checkout/',
        'orders': '/api/orders/',
        'wishlist': '/api/wishlist/',
    }
    return APIResponse.success(data=urls, message="GopalWala API")


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

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(
            queryset, many=True,
            context={'request': request}
        )
        return APIResponse.success(
            data=serializer.data,
            message=f"Found {queryset.count()} products"
        )


class ProductDetailAPI(APIView):
    def get(self, request, slug):
        try:
            product = Product.objects.get(slug=slug)
        except Product.DoesNotExist:
            raise ProductNotFoundException()

        serializer = ProductSerializer(
            product,
            context={'request': request}
        )
        return APIResponse.success(data=serializer.data)


class CategoryListAPI(generics.ListAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data)


class WishlistAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wish, created = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wish, context={'request': request})
        return APIResponse.success(data=serializer.data)

    def post(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise ProductNotFoundException(product_id)

        wish, _ = Wishlist.objects.get_or_create(user=request.user)

        if product in wish.products.all():
            wish.products.remove(product)
            return APIResponse.success(
                data={'status': 'removed'},
                message=f'{product.name} removed from wishlist'
            )
        else:
            wish.products.add(product)
            return APIResponse.success(
                data={'status': 'added'},
                message=f'{product.name} added to wishlist'
            )


class ProductCreateAPI(generics.CreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.created(
                data=serializer.data,
                message="Product created successfully"
            )
        return APIResponse.validation_error(errors=serializer.errors)


class ProductUpdateAPI(generics.UpdateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all()
    lookup_field = 'slug'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(
                data=serializer.data,
                message="Product updated successfully"
            )
        return APIResponse.validation_error(errors=serializer.errors)


class ProductDeleteAPI(generics.DestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all()
    lookup_field = 'slug'

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.name
        instance.delete()
        return APIResponse.success(message=f'"{name}" deleted successfully')