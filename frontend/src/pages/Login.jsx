import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await loginUser(form);
            login(res.data, res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '60px auto' }}
             className="bg-white p-4 rounded shadow-sm">
            <h2 className="fw-bold mb-4 text-center">🔐 Login</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="fw-bold">Username</label>
                    <input type="text" className="form-control mt-1"
                           placeholder="Enter username"
                           value={form.username}
                           onChange={(e) => setForm({ ...form, username: e.target.value })}
                           required />
                </div>
                <div className="mb-3">
                    <label className="fw-bold">Password</label>
                    <input type="password" className="form-control mt-1"
                           placeholder="Enter password"
                           value={form.password}
                           onChange={(e) => setForm({ ...form, password: e.target.value })}
                           required />
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold"
                        disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p className="text-center mt-3">
                No account? <Link to="/register">Register here</Link>
            </p>
            <p className="text-center">
                <Link to="/password-reset" className="text-muted small">
                    Forgot password?
                </Link>
            </p>
        </div>
    );
}