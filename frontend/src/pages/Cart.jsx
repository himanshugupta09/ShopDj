import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, updateCartItem } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const { fetchCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const res = await getCart();
            setCart(res.data.data);          // ← .data.data
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleRemove = async (itemId) => {
        try {
            const res = await removeFromCart(itemId);
            setMessage(res.data.message);
            setTimeout(() => setMessage(''), 3000);
            loadCart();
            fetchCart();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (itemId, quantity) => {
        try {
            await updateCartItem(itemId, quantity);
            loadCart();
            fetchCart();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
        </div>
    );

    return (
        <div className="container py-4">
            <h4 className="fw-bold mb-4">🛒 Your Cart</h4>

            {message && (
                <div className="alert alert-success">{message}</div>
            )}

            {cart?.items?.length > 0 ? (
                <div className="row g-4">

                    {/* Cart Items */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm">
                            {cart.items.map(item => (
                                <div key={item.id}
                                     className="d-flex align-items-center gap-3 p-3 border-bottom flex-wrap">
                                    <img
                                        src={item.product.image_url ||
                                            'https://via.placeholder.com/80'}
                                        style={{
                                            width: '80px', height: '80px',
                                            objectFit: 'contain'
                                        }}
                                        alt={item.product.name}
                                    />
                                    <div className="flex-grow-1">
                                        <p className="fw-bold mb-0">
                                            {item.product.name}
                                        </p>
                                        <p className="text-success mb-0">
                                            ₹{item.product.price}
                                        </p>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => handleUpdate(
                                                item.id, item.quantity - 1
                                            )}
                                        >−</button>
                                        <span className="fw-bold px-2">
                                            {item.quantity}
                                        </span>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => handleUpdate(
                                                item.id, item.quantity + 1
                                            )}
                                        >+</button>
                                    </div>
                                    <p className="fw-bold mb-0">
                                        ₹{item.item_total}
                                    </p>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="btn btn-outline-danger btn-sm"
                                    >🗑️</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm p-3">
                            <h5 className="fw-bold mb-3">Order Summary</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">
                                    Items ({cart.item_count})
                                </span>
                                <span>₹{cart.total}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Delivery</span>
                                <span className="text-success">FREE</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                                <span>Total</span>
                                <span className="text-success">₹{cart.total}</span>
                            </div>
                            <button
                                onClick={() => navigate('/checkout')}
                                className="btn btn-primary w-100 fw-bold"
                            >
                                Proceed to Checkout →
                            </button>
                            <Link
                                to="/products"
                                className="btn btn-outline-secondary w-100 mt-2"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-5">
                    <p style={{ fontSize: '64px' }}>🛒</p>
                    <h4 className="text-muted">Your cart is empty</h4>
                    <Link to="/products" className="btn btn-primary mt-3">
                        Start Shopping
                    </Link>
                </div>
            )}
        </div>
    );
}