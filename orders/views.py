from django.http import HttpResponse

def cart(request):
    return HttpResponse("<h1>Your Cart 🛒</h1>")

def order_history(request):
    return HttpResponse("<h1>Your Orders 📦</h1>")
