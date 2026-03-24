import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCart, checkout } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout() {
    const { user } = useAuth();
    const { fetchCart } = useCart();
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const res = await getCart();
            const cartData = res.data.data;

            // Redirect to cart if empty
            if (!cartData?.items?.length) {
                navigate('/cart');
                return;
            }
            setCart(cartData);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handlePlaceOrder = async () => {
        setPlacing(true);
        setError('');
        try {
            const res = await checkout();
            const { order_id } = res.data.data;
            fetchCart(); // reset cart count in navbar
            navigate(`/order-confirmation/${order_id}`);
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to place order'
            );
        }
        setPlacing(false);
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
        </div>
    );

    return (
        <div className="container py-4">
            <h4 className="fw-bold mb-4">📦 Checkout</h4>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            <div className="row g-4">

                {/* Left — Order Items + Delivery */}
                <div className="col-lg-8">

                    {/* Delivery Address */}
                    <div className="card border-0 shadow-sm p-4 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0">
                                📍 Delivery Address
                            </h5>
                            <Link to="/profile"
                                  className="btn btn-outline-primary btn-sm">
                                Change
                            </Link>
                        </div>

                        {user?.profile?.address ? (
                            <div className="p-3 bg-light rounded">
                                <p className="fw-bold mb-1">
                                    {user.first_name} {user.last_name}
                                </p>
                                <p className="text-muted mb-1">
                                    {user.profile.address}
                                </p>
                                {user.profile.phone && (
                                    <p className="text-muted mb-0">
                                        📞 {user.profile.phone}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="alert alert-warning mb-0">
                                ⚠️ No delivery address saved.
                                <Link to="/profile"
                                      className="ms-2 fw-bold">
                                    Add address →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="card border-0 shadow-sm p-4">
                        <h5 className="fw-bold mb-3">
                            🛍️ Order Items ({cart?.item_count})
                        </h5>

                        {cart?.items?.map(item => (
                            <div key={item.id}
                                 className="d-flex align-items-center gap-3 py-3 border-bottom">
                                <img
                                    src={item.product.image_url ||
                                        'https://via.placeholder.com/70'}
                                    style={{
                                        width: '70px',
                                        height: '70px',
                                        objectFit: 'contain',
                                        background: '#f5f5f5',
                                        padding: '4px',
                                        borderRadius: '8px'
                                    }}
                                    alt={item.product.name}
                                />
                                <div className="flex-grow-1">
                                    <p className="fw-bold mb-0">
                                        {item.product.name}
                                    </p>
                                    <small className="text-muted">
                                        {item.product.category?.name}
                                    </small>
                                </div>
                                <div className="text-center">
                                    <small className="text-muted d-block">
                                        Qty
                                    </small>
                                    <span className="fw-bold">
                                        {item.quantity}
                                    </span>
                                </div>
                                <div className="text-end">
                                    <small className="text-muted d-block">
                                        ₹{item.product.price} each
                                    </small>
                                    <span className="fw-bold text-success">
                                        ₹{item.item_total}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — Price Summary */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4 sticky-top"
                         style={{ top: '80px' }}>
                        <h5 className="fw-bold mb-3">
                            💰 Price Summary
                        </h5>

                        {/* Item breakdown */}
                        {cart?.items?.map(item => (
                            <div key={item.id}
                                 className="d-flex justify-content-between mb-2 small">
                                <span className="text-muted text-truncate"
                                      style={{ maxWidth: '160px' }}>
                                    {item.product.name} × {item.quantity}
                                </span>
                                <span>₹{item.item_total}</span>
                            </div>
                        ))}

                        <hr />

                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Subtotal</span>
                            <span>₹{cart?.total}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Delivery</span>
                            <span className="text-success fw-bold">
                                FREE
                            </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Tax</span>
                            <span className="text-muted">Included</span>
                        </div>

                        <hr />

                        <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                            <span>Total</span>
                            <span className="text-success">
                                ₹{cart?.total}
                            </span>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            className="btn btn-primary w-100 fw-bold py-3"
                            disabled={placing || !user?.profile?.address}
                        >
                            {placing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Placing Order...
                                </>
                            ) : (
                                `🎉 Place Order — ₹${cart?.total}`
                            )}
                        </button>

                        {!user?.profile?.address && (
                            <p className="text-danger small text-center mt-2">
                                Please add delivery address first
                            </p>
                        )}

                        <Link to="/cart"
                              className="btn btn-outline-secondary w-100 mt-2">
                            ← Back to Cart
                        </Link>

                        {/* Trust badges */}
                        <div className="mt-3 pt-3 border-top">
                            <div className="d-flex gap-2 flex-wrap justify-content-center">
                                <small className="text-muted">
                                    🔒 Secure Checkout
                                </small>
                                <small className="text-muted">
                                    📦 Free Delivery
                                </small>
                                <small className="text-muted">
                                    ↩️ Easy Returns
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}