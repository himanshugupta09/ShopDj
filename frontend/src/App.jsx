import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <Navbar />
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/:slug" element={<ProductDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected */}
                        <Route path="/cart" element={
                            <ProtectedRoute><Cart /></ProtectedRoute>
                        } />
                        <Route path="/checkout" element={
                            <ProtectedRoute><Checkout /></ProtectedRoute>
                        } />
                        <Route path="/order-confirmation/:orderId" element={
                            <ProtectedRoute><OrderConfirmation /></ProtectedRoute>
                        } />
                        <Route path="/wishlist" element={
                            <ProtectedRoute><Wishlist /></ProtectedRoute>
                        } />
                        <Route path="/orders" element={
                            <ProtectedRoute><OrderHistory /></ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute><Profile /></ProtectedRoute>
                        } />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
