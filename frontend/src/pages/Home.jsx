import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);
                setProducts(prodRes.data.data || []);       // ← .data.data
                setCategories(catRes.data.data || []);      // ← .data.data
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div>
            {/* Categories */}
            <div className="bg-white border-bottom py-2 px-3">
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    <span className="text-muted small fw-bold me-2">
                        Categories:
                    </span>
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            to={`/products?category=${cat.slug}`}
                            className="badge text-decoration-none"
                            style={{
                                background: '#e8f0fe',
                                color: '#2874f0',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                border: '1px solid #2874f0'
                            }}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Hero */}
            <div className="bg-primary text-white py-5 mb-4">
                <div className="container text-center">
                    <h1 className="fw-bold">Welcome to ShopDjango</h1>
                    <p className="lead">
                        Discover amazing products at unbeatable prices
                    </p>
                    <Link
                        to="/products"
                        className="btn btn-warning btn-lg fw-bold px-5"
                    >
                        Shop Now →
                    </Link>
                </div>
            </div>

            {/* Featured Products */}
            <div className="container-fluid px-4 mb-5">
                <h4 className="fw-bold mb-3">⭐ Featured Products</h4>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : (
                    <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}