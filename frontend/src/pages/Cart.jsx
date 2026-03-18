import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, updateCartItem } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const { fetchCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const res = await getCart();
            setCart(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleRemove = async (itemId) => {
        await removeFromCart(itemId);
        loadCart();
        fetchCart();
    };

    const handleUpdate = async (itemId, quantity) => {
        await updateCartItem(itemId, quantity);
        loadCart();
        fetchCart();
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
        </div>
    );

    return (
        <div className="container py-4">
            <h4 className="fw-bold mb-4">🛒 Your Cart</h4>

            {cart?.items?.length > 0 ? (
                <div className="row g-4">
                    {/* Items */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm">
                            {cart.items.map(item => (
                                <div key={item.id}
                                     className="d-flex align-items-center gap-3 p-3 border-bottom">
                                    <img
                                        src={item.product.image_url || 'https://via.placeholder.com/80'}
                                        style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                                        alt={item.product.name}
                                    />
                                    <div className="flex-grow-1">
                                        <p className="fw-bold mb-0">{item.product.name}</p>
                                        <p className="text-success mb-0">₹{item.product.price}</p>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            style={{ width: '70px' }}
                                            value={item.quantity}
                                            min="0"
                                            onChange={(e) => handleUpdate(item.id, parseInt(e.target.value))}
                                        />
                                    </div>
                                    <p className="fw-bold mb-0">₹{item.item_total}</p>
                                    <button onClick={() => handleRemove(item.id)}
                                            className="btn btn-outline-danger btn-sm">
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm p-3">
                            <h5 className="fw-bold">Order Summary</h5>
                            <div className="d-flex justify-content-between my-2">
                                <span className="text-muted">Subtotal</span>
                                <span>₹{cart.total}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Delivery</span>
                                <span className="text-success">FREE</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold fs-5">
                                <span>Total</span>
                                <span className="text-success">₹{cart.total}</span>
                            </div>
                            <button onClick={() => navigate('/checkout')}
                                    className="btn btn-primary w-100 mt-3 fw-bold">
                                Proceed to Checkout →
                            </button>
                            <Link to="/products"
                                  className="btn btn-outline-secondary w-100 mt-2">
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