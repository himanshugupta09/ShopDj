import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/api';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOrders()
            .then(res => setOrders(res.data.data || []))
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
                orders.map(order => {
                    const activeStepIndex = STATUS_STEPS.indexOf(order.status);
                    
                    return (
                        <div key={order.id} className="card border-0 shadow-sm mb-4 overflow-hidden">
                            {/* Header */}
                            <div className="card-header bg-white border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="fw-bold mb-0 text-primary">Order #{order.id}</h6>
                                    <small className="text-muted">
                                        Placed on: {new Date(order.created_at).toLocaleDateString('en-IN')}
                                    </small>
                                </div>
                                <div className="text-end">
                                    <p className="fw-bold mb-0 fs-5 text-success">₹{order.total_price}</p>
                                </div>
                            </div>

                            <div className="card-body px-4">
                                <div className="row">
                                    {/* Left: Product List */}
                                    <div className="col-md-6 border-end">
                                        <h6 className="small fw-bold text-uppercase text-muted mb-3">Items</h6>
                                        {order.items.map(item => (
                                            <div key={item.id} className="d-flex align-items-center gap-3 mb-2">
                                                <img src={item.product.image_url || 'https://via.placeholder.com/40'}
                                                     style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                                     alt={item.product.name} />
                                                <span className="small text-dark">{item.product.name} × {item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right: Tracking Timeline */}
                                    <div className="col-md-6 ps-md-4 mt-4 mt-md-0">
                                        <h6 className="small fw-bold text-uppercase text-muted mb-3">Delivery Status</h6>
                                        
                                        {/* Visual Tracker */}
                                        <div className="d-flex justify-content-between mb-4 position-relative">
                                            <div style={{ position: 'absolute', top: '12px', left: '0', right: '0', height: '2px', background: '#eee', zIndex: 0 }}></div>
                                            {STATUS_STEPS.map((step, idx) => (
                                                <div key={step} className="text-center" style={{ zIndex: 1, width: '25%' }}>
                                                    <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center shadow-sm ${idx <= activeStepIndex ? 'bg-success text-white' : 'bg-white text-muted border'}`}
                                                         style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                                        {idx <= activeStepIndex ? '✓' : idx + 1}
                                                    </div>
                                                    <div className={`smaller mt-1 text-capitalize ${idx <= activeStepIndex ? 'fw-bold text-success' : 'text-muted'}`}>
                                                        {step}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Detailed Activity Log */}
                                        <div className="bg-light p-3 rounded">
                                            {order.tracking_history?.length > 0 ? (
                                                order.tracking_history.map((update, i) => (
                                                    <div key={i} className="mb-2 pb-2 border-bottom-0 small">
                                                        <div className="d-flex justify-content-between">
                                                            <strong className="text-capitalize text-dark">{update.status}</strong>
                                                            <span className="text-muted" style={{ fontSize: '10px' }}>
                                                                {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="text-muted">{update.message}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-muted small italic text-center py-2">
                                                    Current Status: {order.status_display}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-5">
                    <h4 className="text-muted">No orders yet</h4>
                    <Link to="/products" className="btn btn-primary mt-3 text-white fw-bold">Start Shopping</Link>
                </div>
            )}
        </div>
    );
}