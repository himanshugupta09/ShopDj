from django.http import HttpResponse
from django.shortcuts import redirect, render,get_object_or_404
from .models import Product,Category
from django.views.generic import ListView, DetailView
from django.contrib import messages
from .forms import ProductForm
from django.core.exceptions import PermissionDenied

def add_product(request):
    # Only admin role can add products
    if not request.user.is_authenticated or request.user.profile.role != 'admin':
        raise PermissionDenied  # returns 403 Forbidden
    ...
    
def home(request):
    featured_products = Product.objects.filter(stock__gt=0)[:8]
    categories = Category.objects.all()
    context = {
        'products': featured_products,
        'categories': categories,
    }
    return render(request, 'store/home.html', context)

class ProductListView(ListView):
    model = Product
    template_name = 'store/product_list.html'
    context_object_name = 'products'
    paginate_by = 12

    def get_queryset(self):
        queryset = Product.objects.filter(stock__gt=0)
        category_slug = self.request.GET.get('category_slug')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        search_query = self.request.GET.get('q')
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
        return queryset
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        return context
class ProductDetailView(DetailView):
    model = Product
    template_name = 'store/product_detail.html'
    context_object_name = 'product'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'

def category_products(request, slug):
    category = get_object_or_404(Category, slug=slug)
    # get_object_or_404 = get the object OR return a 404 page
    # never use Category.objects.get() in views — it crashes if not found

    products = category.products.filter(stock__gt=0)
    context = {
        'category': category,
        'products': products,
    }
    return render(request, 'store/category_products.html', context)
def get_query_results(request):
    search_query = request.GET.get('q')
    if search_query:
        products = Product.objects.filter(name__icontains=search_query, stock__gt=0)
    else:
        products = Product.objects.none()
    context = {
        'products': products,
        'search_query': search_query,
    }
    return render(request, 'store/search_results.html', context)

def add_product(request):
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Product added successfully!')
            return redirect('home')
    else:
        form = ProductForm()
    return render(request, 'store/add_product.html', {'form': form})

def edit_product(request, slug):
    product = get_object_or_404(Product, slug=slug)
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            form.save()
            messages.success(request, f"Product '{product.name}' updated successfully!")
            return redirect('product_detail', slug=product.slug)
    else:
        form = ProductForm(instance=product)
    return render(request, 'store/add_product.html', {'form': form, 'editing': True, 'product': product})