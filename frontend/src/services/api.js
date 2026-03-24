import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ── AUTH ──
export const registerUser = (data) => API.post('/auth/register/', data);
export const loginUser = (data) => API.post('/auth/login/', data);
export const getProfile = () => API.get('/auth/profile/');
export const updateProfile = (data) => API.put('/auth/profile/', data);

// ── PRODUCTS ──
export const getProducts = (params) => API.get('/products/', { params });
export const getProduct = (slug) => API.get(`/products/${slug}/`);
export const getCategories = () => API.get('/categories/');

// ── CART ──
export const getCart = () => API.get('/cart/');
export const addToCart = (productId) => API.post(`/cart/add/${productId}/`);
export const removeFromCart = (itemId) => API.delete(`/cart/remove/${itemId}/`);
export const updateCartItem = (itemId, quantity) => API.put(`/cart/update/${itemId}/`, { quantity });
export const checkout = () => API.post('/cart/checkout/');

// ── ORDERS ──
export const getOrders = () => API.get('/orders/');
export const getOrder = (orderId) => API.get(`/orders/${orderId}/`);

// ── WISHLIST ──
export const getWishlist = () => API.get('/wishlist/');
export const toggleWishlist = (productId) => API.post(`/wishlist/toggle/${productId}/`);

export default API;