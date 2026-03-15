from django import forms
from .models import Product, Category

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'stock', 'category', 'image']
        widgets = {
            'name': forms.TextInput(attrs={'class':'form-control'}),
            'description': forms.Textarea(attrs={'class':'form-control',
            'rows': 4,
            'placeholder': 'Enter product description'}),
            'price': forms.NumberInput(attrs={'class':'form-control', 'step': '0.01'}),
            'stock': forms.NumberInput(attrs={'class':'form-control','placeholder': '0'}),
            'slug': forms.TextInput(attrs={'class':'form-control','placeholder': 'product-slug'}),
            'category': forms.Select(attrs={'class':'form-control'}),
        }
    def clean_price(self):
        price = self.cleaned_data.get('price')
        if price is not None and price < 0:
            raise forms.ValidationError("Price cannot be negative.")
        return price
    def clean_stock(self):
        stock = self.cleaned_data.get('stock')
        if stock is not None and stock < 0:
            raise forms.ValidationError("Stock cannot be negative.")
        return stock
    def clean_name(self):
        name = self.cleaned_data.get('name')
        if name and len(name) < 3:
            raise forms.ValidationError("Product name must be at least 3 characters long.")
        return name
    def clean(self):
        cleaned_data = super().clean()
        name = cleaned_data.get('name')
        price = cleaned_data.get('price')
        category = cleaned_data.get('category')
        stock = cleaned_data.get('stock')
        if price and stock:
            if price > 10000 and stock > 1000:
                raise forms.ValidationError("High-priced items cannot have excessive stock.")
        return cleaned_data

class SearchForm(forms.Form):
    q = forms.CharField(required=False, widget=forms.TextInput(attrs={'class':'form-control','placeholder': 'Search products...'}))
    category = forms.ModelChoiceField(queryset=Category.objects.all(), required=False,empty_label="All Categories" ,widget=forms.Select(attrs={'class':'form-control'}))
        