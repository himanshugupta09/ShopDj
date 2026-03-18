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

    useEffect(() => {
        getProduct(slug)
            .then(res => {
                setProduct(res.data);
                setLoading(false);
            })
            .catch(() => navigate('/products'));
    }, [slug]);

    const handleAddToCart = async () => {
        if (!user) return navigate('/login');
        setAdding(true);
        try {
            await addToCart(product.id);
            fetchCart();
            setMessage('Added to cart! ✅');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Error adding to cart');
        }
        setAdding(false);
    };

    const handleWishlist = async () => {
        if (!user) return navigate('/login');
        try {
            const res = await toggleWishlist(product.id);
            setWishlisted(res.data.status === 'added');
            setMessage(res.data.message);
            setTimeout(() => setMessage(''), 3000);
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
            {message && (
                <div className="alert alert-success alert-dismissible">
                    {message}
                </div>
            )}
            <div className="row bg-white rounded shadow-sm p-4">

                {/* Image */}
                <div className="col-md-5 text-center">
                    <img
                        src={product.image_url || 'https://via.placeholder.com/400x400'}
                        className="img-fluid"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                        alt={product.name}
                    />
                </div>

                {/* Info */}
                <div className="col-md-7 d-flex flex-column gap-3 mt-4 mt-md-0">
                    <h2 className="fw-bold">{product.name}</h2>

                    <p className="text-primary mb-0">
                        🏷️ {product.category?.name}
                    </p>

                    <h3 className="text-success fw-bold">₹{product.price}</h3>

                    <p className="text-muted">{product.description}</p>

                    {product.is_in_stock ? (
                        <>
                            <p className="text-success">
                                ✅ In Stock ({product.stock} units left)
                            </p>
                            <div className="d-flex gap-2 flex-wrap">
                                <button onClick={handleAddToCart}
                                        className="btn btn-warning fw-bold px-4"
                                        disabled={adding}>
                                    {adding ? 'Adding...' : '🛒 Add to Cart'}
                                </button>
                                <button onClick={() => {
                                    handleAddToCart();
                                    navigate('/cart');
                                }}
                                        className="btn btn-primary fw-bold px-4">
                                    ⚡ Buy Now
                                </button>
                                {user && (
                                    <button onClick={handleWishlist}
                                            className={`btn fw-bold px-4 ${wishlisted ? 'btn-danger' : 'btn-outline-danger'}`}>
                                        {wishlisted ? '❤️ Wishlisted' : '🤍 Wishlist'}
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <span className="badge bg-danger fs-6">Out of Stock</span>
                    )}

                    <div className="border-top pt-3">
                        <small className="text-muted">
                            📦 Stock: {product.stock} units
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}