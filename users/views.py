from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import RegisterForm, LoginForm, ProfileUpdateForm
from orders.models import Order

def register_view(request):
    if request.user.is_authenticated:
        return redirect('home')  # already logged in

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Auto-login after registration
            login(request, user)
            messages.success(request, f'Welcome {user.first_name}! Account created ✅')
            return redirect('home')
    else:
        form = RegisterForm()

    return render(request, 'users/register.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            user = authenticate(request, username=username, password=password)
            # authenticate() checks credentials and returns User or None

            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {user.first_name}! 👋')
                # Redirect to next page if user was redirected to login
                next_url = request.GET.get('next', 'home')
                return redirect(next_url)
            else:
                messages.error(request, 'Invalid username or password ❌')
    else:
        form = LoginForm()

    return render(request, 'users/login.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.success(request, 'Logged out successfully 👋')
    return redirect('home')


@login_required  # redirects to login if not authenticated
def profile_view(request):
    if request.method == 'POST':
        form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated ✅')
            return redirect('profile')
    else:
        form = ProfileUpdateForm(instance=request.user.profile)

    # Get user's order history
    orders = Order.objects.filter(user=request.user).order_by('-created_at')

    return render(request, 'users/profile.html', {
        'form': form,
        'orders': orders
    })