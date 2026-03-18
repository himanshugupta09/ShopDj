import { useState, useEffect, useRef } from 'react';
import { getProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function Profile() {
    const { user, refreshUser } = useAuth();  // ← add refreshUser
    const [profile, setProfile] = useState({ phone: '', address: '' });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [currentAvatar, setCurrentAvatar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const fileRef = useRef();

    useEffect(() => {
        getProfile().then(res => {
            setProfile({
                phone: res.data.profile?.phone || '',
                address: res.data.profile?.address || ''
            });
            setCurrentAvatar(res.data.profile?.avatar_url || null);
            setLoading(false);
        });
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('phone', profile.phone);
            formData.append('address', profile.address);
            if (avatar) {
                formData.append('avatar', avatar);
            }

            await API.put('/auth/profile/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // ← refresh user in context so navbar updates immediately
            await refreshUser();

            setMessage('Profile updated ✅');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Update failed ❌');
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
        </div>
    );

    return (
        <div className="container py-4" style={{ maxWidth: '600px' }}>

            {/* Profile Header */}
            <div className="card border-0 shadow-sm p-4 mb-4">
                <div className="d-flex align-items-center gap-3">

                    {/* Avatar display */}
                    <div style={{ position: 'relative', cursor: 'pointer' }}
                         onClick={() => fileRef.current.click()}>
                        {avatarPreview || currentAvatar ? (
                            <img
                                src={avatarPreview || currentAvatar}
                                style={{
                                    width: '80px', height: '80px',
                                    borderRadius: '50%', objectFit: 'cover',
                                    border: '3px solid #2874f0'
                                }}
                                alt="avatar"
                            />
                        ) : (
                            <div style={{
                                width: '80px', height: '80px',
                                borderRadius: '50%', background: '#2874f0',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span style={{
                                    color: 'white',
                                    fontSize: '28px',
                                    fontWeight: 'bold'
                                }}>
                                    {user?.first_name?.[0]?.toUpperCase()}
                                </span>
                            </div>
                        )}
                        {/* Camera icon overlay */}
                        <div style={{
                            position: 'absolute', bottom: '0', right: '0',
                            background: '#ffe500', borderRadius: '50%',
                            width: '24px', height: '24px',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '12px'
                        }}>
                            📷
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-0 fw-bold">
                            {user?.first_name} {user?.last_name}
                        </h4>
                        <p className="text-muted mb-0">{user?.email}</p>
                        <span className="badge bg-primary mt-1">
                            {user?.profile?.role}
                        </span>
                        <p className="text-muted small mt-1 mb-0">
                            Click photo to change avatar
                        </p>
                    </div>
                </div>

                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleAvatarChange}
                />
            </div>

            {/* Update Form */}
            <div className="card border-0 shadow-sm p-4">
                <h5 className="fw-bold mb-3">Update Profile</h5>

                {message && (
                    <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="fw-bold">Phone</label>
                        <input
                            type="text"
                            className="form-control mt-1"
                            placeholder="Phone number"
                            value={profile.phone}
                            onChange={(e) => setProfile({
                                ...profile, phone: e.target.value
                            })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="fw-bold">Delivery Address</label>
                        <textarea
                            className="form-control mt-1"
                            rows="3"
                            placeholder="Your delivery address"
                            value={profile.address}
                            onChange={(e) => setProfile({
                                ...profile, address: e.target.value
                            })}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary fw-bold w-100"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
