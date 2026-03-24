import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/api';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOrders()
            .then(res => setOrders(res.data.data || []))  // ← .data.data
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
        </div>
    );

    return (
        <div className="container py-4">
            <h4 className="fw-bold mb-4">📦 My Orders</h4>

            {orders.length > 0 ? (
                orders.map(order => (
                    <div key={order.id}
                         className="card border-0 shadow-sm mb-3 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="fw-bold mb-0">
                                    Order #{order.id}
                                </h6>
                                <small className="text-muted">
                                    {new Date(order.created_at).toLocaleDateString(
                                        'en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }
                                    )}
                                </small>
                            </div>
                            <div className="text-end">
                                <span className={`badge ${
                                    order.status === 'delivered'
                                        ? 'bg-success'
                                        : order.status === 'cancelled'
                                        ? 'bg-danger'
                                        : 'bg-info'
                                }`}>
                                    {order.status}
                                </span>
                                <p className="fw-bold mb-0 mt-1">
                                    ₹{order.total_price}
                                </p>
                            </div>
                        </div>

                        <div className="border-top mt-2 pt-2">
                            {order.items.map(item => (
                                <div key={item.id}
                                     className="d-flex justify-content-between
                                                align-items-center py-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <img
                                            src={item.product.image_url ||
                                                'https://via.placeholder.com/40'}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'contain'
                                            }}
                                            alt={item.product.name}
                                        />
                                        <span className="small text-muted">
                                            {item.product.name} × {item.quantity}
                                        </span>
                                    </div>
                                    <span className="small fw-bold">
                                        ₹{item.price}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-5">
                    <p style={{ fontSize: '64px' }}>📦</p>
                    <h4 className="text-muted">No orders yet</h4>
                    <Link to="/products" className="btn btn-primary mt-3">
                        Start Shopping
                    </Link>
                </div>
            )}
        </div>
    );
}