import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/products?q=${search}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
            <div className="container-fluid px-3">

                {/* Logo */}
                <Link className="navbar-brand fw-bold fs-4" to="/">
                    🛒 ShopDjango
                </Link>

                {/* Hamburger */}
                <button className="navbar-toggler" type="button"
                        data-bs-toggle="collapse" data-bs-target="#navContent">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navContent">

                    {/* Search */}
                    <form className="d-flex mx-auto my-2 my-lg-0"
                          style={{ width: '100%', maxWidth: '500px' }}
                          onSubmit={handleSearch}>
                        <input
                            className="form-control rounded-start rounded-0"
                            type="search"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="btn btn-warning rounded-end rounded-0 fw-bold"
                                type="submit">
                            🔍
                        </button>
                    </form>

                    {/* Nav Links */}
                    <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">
                                Products
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/cart">
                                🛒 Cart
                                {cartCount > 0 && (
                                    <span className="badge bg-danger ms-1">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </li>

                        {user ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/wishlist">
                                        ❤️ Wishlist
                                    </Link>
                                </li>

                                {/* User Dropdown */}
                                
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                                    href="#" data-bs-toggle="dropdown">

                                        {/* Show avatar if exists, else show initial */}
                                        {user?.profile?.avatar_url ? (
                                            <img
                                                src={user.profile.avatar_url}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '2px solid white'
                                                }}
                                                alt="avatar"
                                            />
                                        ) : (
                                            <div style={{
                                                width: '32px', height: '32px',
                                                borderRadius: '50%', background: '#ffe500',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <span style={{
                                                    color: '#2874f0',
                                                    fontWeight: 'bold',
                                                    fontSize: '13px'
                                                }}>
                                                    {user?.first_name?.[0]?.toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        {user?.first_name}
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end shadow">
                                        <li>
                                            <Link className="dropdown-item" to="/profile">
                                                👤 My Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/orders">
                                                📦 My Orders
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button className="dropdown-item text-danger"
                                                    onClick={handleLogout}>
                                                🚪 Logout
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-warning btn-sm fw-bold ms-1"
                                          to="/register">
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}