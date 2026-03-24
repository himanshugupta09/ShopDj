import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../services/api';

export default function OrderConfirmation() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOrder(orderId)
            .then(res => {
                setOrder(res.data.data);
                setLoading(false);
            })
            .catch(console.error);
    }, [orderId]);

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
        </div>
    );

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-7">

                    {/* Success Header */}
                    <div className="card border-0 shadow-sm p-5 text-center mb-4">
                        <div style={{ fontSize: '72px' }}>🎉</div>
                        <h2 className="fw-bold text-success mt-2">
                            Order Placed Successfully!
                        </h2>
                        <p className="text-muted mb-1">
                            Order ID:
                            <strong className="text-dark ms-1">
                                #{order?.id}
                            </strong>
                        </p>
                        <span className={`badge fs-6 mx-auto mt-2 ${
                            order?.status === 'delivered'
                                ? 'bg-success'
                                : 'bg-warning text-dark'
                        }`}
                              style={{ width: 'fit-content' }}>
                            {order?.status?.toUpperCase()}
                        </span>
                    </div>

                    {/* Order Items */}
                    <div className="card border-0 shadow-sm p-4 mb-4">
                        <h5 className="fw-bold mb-3">📦 Items Ordered</h5>

                        {order?.items?.map(item => (
                            <div key={item.id}
                                 className="d-flex align-items-center gap-3 py-2 border-bottom">
                                <img
                                    src={item.product.image_url ||
                                        'https://via.placeholder.com/60'}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        objectFit: 'contain',
                                        background: '#f5f5f5',
                                        padding: '4px',
                                        borderRadius: '8px'
                                    }}
                                    alt={item.product.name}
                                />
                                <div className="flex-grow-1">
                                    <p className="fw-bold mb-0 small">
                                        {item.product.name}
                                    </p>
                                    <small className="text-muted">
                                        Qty: {item.quantity}
                                    </small>
                                </div>
                                <span className="fw-bold text-success">
                                    ₹{item.price}
                                </span>
                            </div>
                        ))}

                        {/* Total */}
                        <div className="d-flex justify-content-between fw-bold fs-5 mt-3">
                            <span>Total Paid</span>
                            <span className="text-success">
                                ₹{order?.total_price}
                            </span>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="card border-0 shadow-sm p-4 mb-4">
                        <h5 className="fw-bold mb-3">📍 Order Status</h5>
                        <div className="d-flex justify-content-between">
                            {[
                                { label: 'Ordered', icon: '✅' },
                                { label: 'Processing', icon: '⚙️' },
                                { label: 'Shipped', icon: '🚚' },
                                { label: 'Delivered', icon: '🏠' },
                            ].map((step, index) => (
                                <div key={index}
                                     className="text-center flex-fill">
                                    <div style={{ fontSize: '24px' }}>
                                        {step.icon}
                                    </div>
                                    <small className={
                                        index === 0
                                            ? 'text-success fw-bold'
                                            : 'text-muted'
                                    }>
                                        {step.label}
                                    </small>
                                    {index < 3 && (
                                        <div className="border-top border-2 mt-2"
                                             style={{
                                                 borderColor: index === 0
                                                     ? '#198754'
                                                     : '#dee2e6'
                                             }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-3">
                        <Link to="/orders"
                              className="btn btn-outline-primary flex-fill fw-bold">
                            📦 View My Orders
                        </Link>
                        <Link to="/products"
                              className="btn btn-primary flex-fill fw-bold">
                            🛍️ Continue Shopping
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}