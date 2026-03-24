import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        fetchProducts();
    }, [searchParams]);

    useEffect(() => {
        getCategories()
            .then(res => setCategories(res.data.data || []));  // ← .data.data
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await getProducts({
                q: searchParams.get('q') || '',
                category: searchParams.get('category') || ''
            });
            setProducts(res.data.data || []);               // ← .data.data
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid px-4 py-4">

            {/* Search info */}
            {searchParams.get('q') && (
                <div className="alert alert-info py-2 d-flex justify-content-between">
                    <span>
                        Results for: <strong>{searchParams.get('q')}</strong>
                        <span className="text-muted ms-2">
                            ({products.length} found)
                        </span>
                    </span>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setSearchParams({})}
                    >
                        Clear ✕
                    </button>
                </div>
            )}

            {/* Category filter */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
                <button
                    className={`btn btn-sm ${
                        !searchParams.get('category')
                            ? 'btn-primary'
                            : 'btn-outline-primary'
                    }`}
                    onClick={() => setSearchParams({})}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`btn btn-sm ${
                            searchParams.get('category') === cat.slug
                                ? 'btn-primary'
                                : 'btn-outline-primary'
                        }`}
                        onClick={() => setSearchParams({ category: cat.slug })}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Products */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : products.length > 0 ? (
                <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-5">
                    <p style={{ fontSize: '48px' }}>🔍</p>
                    <p className="text-muted">No products found</p>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSearchParams({})}
                    >
                        View all products
                    </button>
                </div>
            )}
        </div>
    );
}