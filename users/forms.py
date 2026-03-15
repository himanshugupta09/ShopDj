from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Profile

class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={
        'class': 'form-input', 'placeholder': 'Email address'
    }))
    first_name = forms.CharField(required=True, widget=forms.TextInput(attrs={
        'class': 'form-input', 'placeholder': 'First name'
    }))
    last_name = forms.CharField(required=True, widget=forms.TextInput(attrs={
        'class': 'form-input', 'placeholder': 'Last name'
    }))

    class Meta:
        model = User
        # ✅ No 'role' here — role is always 'buyer' by default
        fields = ['username', 'first_name', 'last_name', 'email', 'password1', 'password2']
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-input', 'placeholder': 'Username'
            }),
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("This email is already registered")
        return email
class LoginForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control','placeholder': 'Username'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control','placeholder': 'Password'}))

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = [ 'phone', 'address', 'avatar']
        widgets = {
            
            'phone': forms.TextInput(attrs={'class': 'form-control','placeholder': 'Phone Number'}),
            'address': forms.Textarea(attrs={'class': 'form-control','rows': 3,'placeholder': 'Delivery Address'}),
            
        }