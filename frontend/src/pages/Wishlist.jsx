import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, toggleWishlist, addToCart } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Wishlist() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchCart } = useCart();

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            const res = await getWishlist();
            setProducts(res.data.products || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleRemove = async (productId) => {
        await toggleWishlist(productId);
        loadWishlist();
    };

    const handleAddToCart = async (productId) => {
        await addToCart(productId);
        fetchCart();
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
        </div>
    );

    return (
        <div className="container py-4">
            <h4 className="fw-bold mb-4">
                ❤️ My Wishlist
                <span className="badge bg-secondary ms-2">{products.length} items</span>
            </h4>

            {products.length > 0 ? (
                <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
                    {products.map(product => (
                        <div key={product.id} className="col">
                            <div className="card h-100 border-0 shadow-sm">
                                <Link to={`/products/${product.slug}`}>
                                    <img
                                        src={product.image_url || 'https://via.placeholder.com/200x160'}
                                        className="card-img-top"
                                        style={{ height: '160px', objectFit: 'contain', padding: '8px' }}
                                        alt={product.name}
                                    />
                                </Link>
                                <div className="card-body p-2">
                                    <p className="small fw-bold text-truncate">{product.name}</p>
                                    <p className="text-success fw-bold">₹{product.price}</p>
                                    <div className="d-flex gap-1">
                                        <button onClick={() => handleAddToCart(product.id)}
                                                className="btn btn-warning btn-sm flex-grow-1 fw-bold">
                                            🛒 Add
                                        </button>
                                        <button onClick={() => handleRemove(product.id)}
                                                className="btn btn-outline-danger btn-sm">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5">
                    <p style={{ fontSize: '64px' }}>❤️</p>
                    <h4 className="text-muted">Your wishlist is empty</h4>
                    <Link to="/products" className="btn btn-primary mt-3">
                        Browse Products
                    </Link>
                </div>
            )}
        </div>
    );
}