from django.http import HttpResponse
from django.shortcuts import render,get_object_or_404
from .models import Product,Category
from django.views.generic import ListView, DetailView
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