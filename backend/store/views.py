# from django.shortcuts import render, get_object_or_404, redirect
# from django.views.generic import ListView, DetailView
# from django.contrib.auth.decorators import login_required
# from django.contrib import messages
# from django.core.exceptions import PermissionDenied
# from django.db.models import Q
# from .models import Product, Category, Wishlist
# from .forms import ProductForm


# def home(request):
#     featured_products = Product.objects.filter(stock__gt=0).order_by('-created_at')[:10]
#     categories = Category.objects.all()
#     return render(request, 'store/home.html', {
#         'products': featured_products,
#         'categories': categories,
#     })


# class ProductListView(ListView):
#     model = Product
#     template_name = 'store/product_list.html'
#     context_object_name = 'products'
#     paginate_by = 12

#     def get_queryset(self):
#         queryset = Product.objects.filter(stock__gt=0).order_by('-created_at')

#         search_query = self.request.GET.get('q')
#         if search_query:
#             queryset = queryset.filter(
#                 Q(name__icontains=search_query) |
#                 Q(description__icontains=search_query) |
#                 Q(category__name__icontains=search_query)
#             ).order_by('-created_at')

#         return queryset

#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         context['categories'] = Category.objects.all()
#         return context


# class ProductDetailView(DetailView):
#     model = Product
#     template_name = 'store/product_detail.html'
#     context_object_name = 'product'
#     slug_field = 'slug'
#     slug_url_kwarg = 'slug'


# def category_products(request, slug):
#     category = get_object_or_404(Category, slug=slug)
#     products = category.products.filter(stock__gt=0)
#     return render(request, 'store/category_products.html', {
#         'category': category,
#         'products': products,
#     })


# def add_product(request):
#     if not request.user.is_authenticated or request.user.profile.role != 'admin':
#         raise PermissionDenied

#     if request.method == 'POST':
#         form = ProductForm(request.POST, request.FILES)
#         if form.is_valid():
#             product = form.save()
#             messages.success(request, f'"{product.name}" added successfully! ✅')
#             return redirect('product_detail', slug=product.slug)
#     else:
#         form = ProductForm()

#     return render(request, 'store/add_product.html', {'form': form})


# def edit_product(request, slug):
#     if not request.user.is_authenticated or request.user.profile.role != 'admin':
#         raise PermissionDenied

#     product = get_object_or_404(Product, slug=slug)

#     if request.method == 'POST':
#         form = ProductForm(request.POST, request.FILES, instance=product)
#         if form.is_valid():
#             form.save()
#             messages.success(request, f'"{product.name}" updated! ✅')
#             return redirect('product_detail', slug=product.slug)
#     else:
#         form = ProductForm(instance=product)

#     return render(request, 'store/add_product.html', {
#         'form': form,
#         'editing': True,
#         'product': product
#     })


# @login_required
# def wishlist(request):
#     wish, created = Wishlist.objects.get_or_create(user=request.user)
#     products = wish.products.all()
#     return render(request, 'store/wishlist.html', {
#         'wishlist': wish,
#         'products': products,
#     })


# @login_required
# def toggle_wishlist(request, product_id):
#     product = get_object_or_404(Product, id=product_id)
#     wish, created = Wishlist.objects.get_or_create(user=request.user)

#     if product in wish.products.all():
#         wish.products.remove(product)
#         messages.info(request, f'"{product.name}" removed from wishlist')
#     else:
#         wish.products.add(product)
#         messages.success(request, f'"{product.name}" added to wishlist ❤️')

#     return redirect(request.META.get('HTTP_REFERER', 'wishlist'))