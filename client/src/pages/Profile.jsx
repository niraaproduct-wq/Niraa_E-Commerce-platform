import React, { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../utils/constants.js';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address?.addressLine1 || user?.address?.street || '',
    city: user?.address?.city || '',
    pincode: user?.address?.pincode || ''
  });

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address?.addressLine1 || user?.address?.street || '',
      city: user?.address?.city || '',
      pincode: user?.address?.pincode || ''
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address?.addressLine1 || '',
      city: user?.address?.city || '',
      pincode: user?.address?.pincode || ''
    });
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('niraa_token');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          address: {
            addressLine1: formData.address,
            city: formData.city,
            pincode: formData.pincode
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        updateProfile(data.user);
        toast.success('Profile saved successfully!');
        setIsEditing(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 0', background: 'var(--gray-50)', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 700, 
            color: 'var(--gray-800)',
            marginBottom: 8
          }}>
            My Profile
          </h1>
          <p style={{ color: 'var(--gray-500)', margin: 0 }}>
            Manage your account details and delivery address
          </p>
        </div>

        {/* Profile Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: 'var(--shadow-md)',
          padding: 32,
          transition: 'all 0.3s ease'
        }}>
          {/* Avatar Header */}
          <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
            <div style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '2.75rem',
              fontWeight: 700,
              marginBottom: 20,
              boxShadow: '0 16px 40px rgba(42, 125, 114, 0.28)',
              border: '4px solid #fff'
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'var(--teal)',
                  color: '#fff',
                  border: 'none',
                  padding: '11px 18px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(42, 125, 114, 0.2)'
                }}
              >
                <FiEdit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleCancel}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '11px 18px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  transition: 'all 0.2s ease'
                }}
              >
                <FiX size={16} />
                Cancel
              </button>
            )}

            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--gray-800)' }}>{user?.name}</h2>
            <p style={{ color: 'var(--gray-500)', margin: '6px 0 0 0', fontSize: '1rem' }}>{user?.phone}</p>
            {user?.email && (
              <p style={{ color: 'var(--gray-400)', margin: 0, fontSize: '0.9rem' }}>{user?.email}</p>
            )}
          </div>

          {!isEditing ? (
            // VIEW MODE
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ 
                  padding: '16px 20px', 
                  background: 'var(--gray-50)', 
                  borderRadius: 14 
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: 4 }}>Full Name</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)' }}>{formData.name || 'Not set'}</div>
                </div>

                <div style={{ 
                  padding: '16px 20px', 
                  background: 'var(--gray-50)', 
                  borderRadius: 14 
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: 4 }}>Email Address</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)' }}>{formData.email || 'Not set'}</div>
                </div>
              </div>

              <div style={{ 
                padding: '16px 20px', 
                background: 'var(--gray-50)', 
                borderRadius: 14 
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: 4 }}>Phone Number</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)' }}>{formData.phone}</div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '8px 0' }} />

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>
                📍 Delivery Address
              </h3>

              <div style={{ 
                padding: '20px', 
                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)', 
                borderRadius: 16,
                border: '1px solid #a7f3d0'
              }}>
                {formData.address || formData.city || formData.pincode ? (
                  <>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 4 }}>{formData.address}</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--gray-600)' }}>
                      {formData.city} {formData.pincode && `- ${formData.pincode}`}
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>No delivery address saved yet</div>
                )}
              </div>
            </div>
          ) : (
            // EDIT MODE
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-700)' }}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      padding: '14px 16px',
                      border: '2px solid var(--gray-200)',
                      borderRadius: 12,
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--teal)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-700)' }}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      padding: '14px 16px',
                      border: '2px solid var(--gray-200)',
                      borderRadius: 12,
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--teal)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-700)' }}>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  disabled
                  style={{
                    padding: '14px 16px',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 12,
                    fontSize: '0.95rem',
                    background: 'var(--gray-50)',
                    color: 'var(--gray-500)'
                  }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Phone number cannot be changed</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '8px 0' }} />

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>
                📍 Delivery Address
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-700)' }}>Full Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  style={{
                    padding: '14px 16px',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 12,
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--teal)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
                  placeholder="House / Flat / Apartment"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-700)' }}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    style={{
                      padding: '14px 16px',
                      border: '2px solid var(--gray-200)',
                      borderRadius: 12,
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--teal)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
                    placeholder="Dharmapuri"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-700)' }}>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    style={{
                      padding: '14px 16px',
                      border: '2px solid var(--gray-200)',
                      borderRadius: 12,
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--teal)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
                    placeholder="636701"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  padding: '16px',
                  background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Saving Profile...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
