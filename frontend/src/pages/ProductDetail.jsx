import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, addToCart, toggleWishlist } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
    const { slug } = useParams();
    const { user } = useAuth();
    const { fetchCart } = useCart();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wishlisted, setWishlisted] = useState(false);
    const [adding, setAdding] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    useEffect(() => {
        getProduct(slug)
            .then(res => {
                setProduct(res.data.data);      // ← .data.data
                setLoading(false);
            })
            .catch(() => navigate('/products'));
    }, [slug]);

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleAddToCart = async () => {
        if (!user) return navigate('/login');
        setAdding(true);
        try {
            const res = await addToCart(product.id);
            fetchCart();
            showMessage(res.data.message);
        } catch (err) {
            showMessage(
                err.response?.data?.message || 'Error adding to cart',
                'danger'
            );
        }
        setAdding(false);
    };

    const handleWishlist = async () => {
        if (!user) return navigate('/login');
        try {
            const res = await toggleWishlist(product.id);
            setWishlisted(res.data.data?.status === 'added');
            showMessage(res.data.message);
        } catch (err) {
            showMessage('Error updating wishlist', 'danger');
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        navigate('/cart');
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
        </div>
    );

    if (!product) return null;

    return (
        <div className="container py-4">
            {message && (
                <div className={`alert alert-${messageType} alert-dismissible`}>
                    {message}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage('')}
                    />
                </div>
            )}

            <div className="row bg-white rounded shadow-sm p-4">
                {/* Image */}
                <div className="col-md-5 text-center">
                    <img
                        src={product.image_url ||
                            'https://via.placeholder.com/400x400?text=No+Image'}
                        className="img-fluid"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                        alt={product.name}
                    />
                </div>

                {/* Info */}
                <div className="col-md-7 d-flex flex-column gap-3 mt-4 mt-md-0">
                    <h2 className="fw-bold mb-0">{product.name}</h2>

                    <p className="mb-0">
                        <span className="text-primary">
                            🏷️ {product.category?.name}
                        </span>
                    </p>

                    <h3 className="text-success fw-bold mb-0">
                        ₹{product.price}
                    </h3>

                    <p className="text-muted">{product.description}</p>

                    {product.is_in_stock ? (
                        <>
                            <p className="text-success mb-0">
                                ✅ In Stock ({product.stock} units left)
                            </p>
                            <div className="d-flex gap-2 flex-wrap">
                                <button
                                    onClick={handleAddToCart}
                                    className="btn btn-warning fw-bold px-4"
                                    disabled={adding}
                                >
                                    {adding ? 'Adding...' : '🛒 Add to Cart'}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="btn btn-primary fw-bold px-4"
                                >
                                    ⚡ Buy Now
                                </button>
                                {user && (
                                    <button
                                        onClick={handleWishlist}
                                        className={`btn fw-bold px-4 ${wishlisted
                                            ? 'btn-danger'
                                            : 'btn-outline-danger'
                                        }`}
                                    >
                                        {wishlisted ? '❤️ Wishlisted' : '🤍 Wishlist'}
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <span className="badge bg-danger fs-6">
                            Out of Stock
                        </span>
                    )}

                    <div className="border-top pt-3">
                        <small className="text-muted">
                            📦 {product.stock} units available
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}