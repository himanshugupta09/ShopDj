import { Link } from 'react-router-dom';
import { toggleWishlist } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { addToCart } from '../services/api';
import { useState } from 'react';

export default function ProductCard({ product, wishlisted = false, onWishlistChange }) {
    const { user } = useAuth();
    const { fetchCart } = useCart();
    const [isWishlisted, setIsWishlisted] = useState(wishlisted);
    const [adding, setAdding] = useState(false);

    const handleWishlist = async (e) => {
        e.preventDefault();
        if (!user) return;
        try {
            await toggleWishlist(product.id);
            setIsWishlisted(!isWishlisted);
            if (onWishlistChange) onWishlistChange();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!user) return;
        setAdding(true);
        try {
            await addToCart(product.id);
            fetchCart();
        } catch (err) {
            console.error(err);
        }
        setAdding(false);
    };

    return (
        <div className="col">
            <div className="card h-100 border-0 shadow-sm">
                <Link to={`/products/${product.slug}`}>
                    <img
                        src={product.image_url || 'https://via.placeholder.com/200x180?text=No+Image'}
                        className="card-img-top"
                        style={{ height: '180px', objectFit: 'contain', padding: '8px' }}
                        alt={product.name}
                    />
                </Link>

                <div className="card-body p-2">
                    <Link to={`/products/${product.slug}`}
                          className="text-decoration-none text-dark">
                        <p className="small fw-bold text-truncate mb-1">
                            {product.name}
                        </p>
                    </Link>

                    <div className="d-flex justify-content-between align-items-center">
                        <span className="text-success fw-bold">₹{product.price}</span>
                        {user && (
                            <button onClick={handleWishlist}
                                    className="btn btn-sm p-0 border-0"
                                    style={{ color: isWishlisted ? '#dc3545' : '#aaa', fontSize: '18px' }}>
                                {isWishlisted ? '❤️' : '🤍'}
                            </button>
                        )}
                    </div>

                    {product.is_in_stock ? (
                        <button onClick={handleAddToCart}
                                className="btn btn-warning btn-sm w-100 mt-2 fw-bold"
                                disabled={adding}>
                            {adding ? 'Adding...' : '🛒 Add to Cart'}
                        </button>
                    ) : (
                        <button className="btn btn-secondary btn-sm w-100 mt-2" disabled>
                            Out of Stock
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}