import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({
        username: '', email: '', password: '',
        first_name: '', last_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await registerUser(form);
            login(res.data, res.data.user);
            navigate('/');
        } catch (err) {
            const errors = err.response?.data;
            setError(typeof errors === 'object'
                ? Object.values(errors)[0]
                : 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '480px', margin: '40px auto' }}
             className="bg-white p-4 rounded shadow-sm">
            <h2 className="fw-bold mb-4 text-center">📝 Create Account</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                {[
                    { name: 'first_name', label: 'First Name', type: 'text' },
                    { name: 'last_name', label: 'Last Name', type: 'text' },
                    { name: 'username', label: 'Username', type: 'text' },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'password', label: 'Password', type: 'password' },
                ].map(field => (
                    <div className="mb-3" key={field.name}>
                        <label className="fw-bold">{field.label}</label>
                        <input
                            type={field.type}
                            name={field.name}
                            className="form-control mt-1"
                            placeholder={field.label}
                            value={form[field.name]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}
                <button type="submit" className="btn btn-primary w-100 fw-bold"
                        disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <p className="text-center mt-3">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
}