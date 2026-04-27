import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../utils/constants.js';
import toast from 'react-hot-toast';

const T = {
  teal: '#1D9E75', tealDark: '#0F6E56', tealLight: '#E8F8F1',
  gray50: '#F9F9F8', gray100: '#F2F1EF', gray200: '#E5E3DE',
  gray300: '#C9C6BF', gray400: '#A8A59D', gray500: '#87847C',
  gray600: '#6B6862', gray700: '#4A4845', gray800: '#2E2D2A', gray900: '#1A1917',
  white: '#FFFFFF',
  font: `'DM Sans', system-ui, sans-serif`,
  fontDisplay: `'Fraunces', Georgia, serif`,
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  .profile-page * { box-sizing: border-box; }

  .profile-card {
    background: ${T.white}; border: 1.5px solid ${T.gray200};
    border-radius: 24px; padding: 32px;
    box-shadow: ${T.shadow};
    transition: all 0.3s;
  }

  .field-label {
    display: block; font-size: 11px; font-weight: 700;
    letter-spacing: .07em; text-transform: uppercase;
    color: ${T.gray500}; margin-bottom: 6px;
  }
  .field-input {
    width: 100%; padding: 13px 16px;
    border: 1.5px solid ${T.gray200}; border-radius: 12px;
    font-size: 14px; font-family: ${T.font}; color: ${T.gray800};
    background: ${T.white}; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .field-input:focus {
    border-color: ${T.teal};
    box-shadow: 0 0 0 3px rgba(29,158,117,0.12);
  }
  .field-input:disabled {
    background: ${T.gray50}; color: ${T.gray400}; cursor: not-allowed;
  }

  .info-block {
    padding: 14px 16px; background: ${T.gray50};
    border-radius: 12px; border: 1px solid ${T.gray200};
    transition: all 0.2s;
  }
  .info-block:hover { border-color: rgba(29,158,117,0.3); }

  .primary-btn {
    width: 100%; padding: 14px; background: ${T.teal}; color: #fff;
    border: none; border-radius: 12px; font-weight: 800; font-size: 15px;
    cursor: pointer; font-family: ${T.font};
    box-shadow: 0 4px 16px rgba(29,158,117,0.3);
    transition: all 0.2s;
  }
  .primary-btn:hover:not(:disabled) { background: ${T.tealDark}; transform: translateY(-1px); }
  .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .ghost-btn {
    padding: 11px 18px; background: ${T.white}; color: ${T.gray700};
    border: 1.5px solid ${T.gray200}; border-radius: 12px;
    font-weight: 700; font-size: 13px; cursor: pointer;
    font-family: ${T.font}; display: flex; align-items: center; gap: 7px;
    transition: all 0.2s;
  }
  .ghost-btn:hover { border-color: ${T.teal}; color: ${T.teal}; background: ${T.tealLight}; }
  .ghost-btn.danger { color: #dc2626; border-color: #fecaca; }
  .ghost-btn.danger:hover { background: #fef2f2; border-color: #dc2626; }

  .edit-btn {
    padding: 11px 20px; background: ${T.teal}; color: #fff;
    border: none; border-radius: 12px; font-weight: 700; font-size: 13px;
    cursor: pointer; font-family: ${T.font};
    display: flex; align-items: center; gap: 7px;
    box-shadow: 0 4px 12px rgba(29,158,117,0.3);
    transition: all 0.2s;
  }
  .edit-btn:hover { background: ${T.tealDark}; transform: translateY(-1px); }

  .avatar {
    width: 96px; height: 96px; border-radius: 24px;
    background: linear-gradient(135deg, ${T.teal} 0%, ${T.tealDark} 100%);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 2.2rem; font-weight: 900;
    font-family: ${T.fontDisplay};
    box-shadow: 0 8px 24px rgba(29,158,117,0.3);
  }

  .security-card {
    background: ${T.white}; border: 1.5px solid ${T.gray200};
    border-radius: 20px; padding: 24px; margin-top: 16px;
    box-shadow: ${T.shadow};
  }

  .otp-input {
    text-align: center; letter-spacing: 8px; font-size: 26px;
    font-weight: 900; font-family: ${T.fontDisplay};
  }

  .stats-row {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 10px;
    margin-bottom: 24px;
  }
  .stat-card {
    background: ${T.tealLight}; border-radius: 14px; padding: 14px;
    text-align: center;
  }
`;

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
    pincode: user?.address?.pincode || '',
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordStep, setPasswordStep] = useState('initial');
  const [passwordForm, setPasswordForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address?.addressLine1 || user?.address?.street || '',
      city: user?.address?.city || '',
      pincode: user?.address?.pincode || '',
    });
  }, [user]);

  const handleSave = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('niraa_token');
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name, email: formData.email, address: { addressLine1: formData.address, city: formData.city, pincode: formData.pincode } })
      });
      if (res.ok) {
        const data = await res.json();
        updateProfile(data.user);
        toast.success('✓ Profile saved!');
        setIsEditing(false);
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to save');
      }
    } catch { toast.error('Server error. Try again.'); }
    finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone })
      });
      if (res.ok) { toast.success('OTP sent to your phone'); setPasswordStep('otp'); }
      else { const d = await res.json(); toast.error(d.message || 'Failed to send OTP'); }
    } catch { toast.error('Error sending OTP'); }
    finally { setOtpLoading(false); }
  };

  const handleResetPassword = async e => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    if (passwordForm.newPassword.length < 6) return toast.error('Min 6 characters');
    setLoading(true);
    try {
      const token = localStorage.getItem('niraa_token');
      const res = await fetch(`${API_BASE_URL}/auth/reset-password-with-otp`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ otp: passwordForm.otp, newPassword: passwordForm.newPassword })
      });
      if (res.ok) {
        toast.success('🔒 Password updated!');
        setShowPasswordSection(false);
        setPasswordStep('initial');
        setPasswordForm({ otp: '', newPassword: '', confirmPassword: '' });
      } else {
        const d = await res.json();
        toast.error(d.message || 'Failed to update');
      }
    } catch { toast.error('Error updating password'); }
    finally { setLoading(false); }
  };

  const initials = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="profile-page" style={{ padding: '40px 0 80px', background: T.gray50, minHeight: '80vh', fontFamily: T.font }}>
      <style>{css}</style>
      <div className="container" style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.teal }}>Account</span>
          </div>
          <h1 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', fontWeight: 900, color: T.gray900, margin: '0 0 4px', letterSpacing: '-.02em' }}>My Profile</h1>
          <p style={{ color: T.gray400, margin: 0, fontSize: 14 }}>Manage your account details and delivery address</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* Avatar + name row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="avatar">{initials}</div>
              <div>
                <div style={{ fontFamily: T.fontDisplay, fontSize: '1.4rem', fontWeight: 900, color: T.gray900 }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: 14, color: T.gray500, marginTop: 2 }}>📱 {user?.phone}</div>
                {user?.email && <div style={{ fontSize: 13, color: T.gray400, marginTop: 2 }}>{user.email}</div>}
              </div>
            </div>
            <div>
              {!isEditing ? (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  ✏️ Edit Profile
                </button>
              ) : (
                <button className="ghost-btn danger" onClick={() => { setIsEditing(false); }}>
                  ✕ Cancel
                </button>
              )}
            </div>
          </div>

          {/* Quick stats */}
          {!isEditing && (
            <div className="stats-row">
              {[['🛒', '8', 'Orders'], ['⭐', '4.8', 'Rating'], ['🌿', '120', 'Points']].map(([icon, val, label]) => (
                <div key={label} className="stat-card">
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 18, color: T.tealDark }}>{val}</div>
                  <div style={{ fontSize: 11, color: T.teal, fontWeight: 700 }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {!isEditing ? (
            /* ─── View Mode ─── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="info-block">
                  <div style={{ fontSize: 11, color: T.gray400, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Full Name</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.gray800 }}>{formData.name || '—'}</div>
                </div>
                <div className="info-block">
                  <div style={{ fontSize: 11, color: T.gray400, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Email</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.gray800 }}>{formData.email || '—'}</div>
                </div>
              </div>
              <div className="info-block">
                <div style={{ fontSize: 11, color: T.gray400, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Phone</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.gray800 }}>{formData.phone}</div>
              </div>
              <div className="info-block" style={{ background: T.tealLight, borderColor: 'rgba(29,158,117,0.2)' }}>
                <div style={{ fontSize: 11, color: T.tealDark, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>📍 Delivery Address</div>
                {formData.address || formData.city ? (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.gray800 }}>{formData.address}</div>
                    <div style={{ fontSize: 13, color: T.tealDark, marginTop: 2 }}>{formData.city}{formData.pincode ? ` – ${formData.pincode}` : ''}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: T.gray500 }}>No delivery address saved yet</div>
                )}
              </div>
            </div>
          ) : (
            /* ─── Edit Mode ─── */
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="field-label">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="field-input" placeholder="Your full name" />
                </div>
                <div>
                  <label className="field-label">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="field-input" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="field-label">Phone (cannot change)</label>
                <input type="text" value={formData.phone} disabled className="field-input" />
              </div>
              <div style={{ paddingTop: 8, borderTop: `1px solid ${T.gray100}` }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: T.gray800, marginBottom: 12 }}>📍 Delivery Address</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label className="field-label">Street Address</label>
                    <textarea value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} rows={2} className="field-input" placeholder="House/Flat, Street, Landmark" style={{ resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                    <div>
                      <label className="field-label">City</label>
                      <input type="text" value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} className="field-input" placeholder="Dharmapuri" />
                    </div>
                    <div>
                      <label className="field-label">Pincode</label>
                      <input type="text" value={formData.pincode} onChange={e => setFormData(p => ({ ...p, pincode: e.target.value }))} className="field-input" placeholder="636xxx" />
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading} className="primary-btn" style={{ marginTop: 8 }}>
                {loading ? '⏳ Saving…' : '✓ Save Changes'}
              </button>
            </form>
          )}
        </div>

        {/* ─── Security Card ─── */}
        <div className="security-card">
          {!showPasswordSection ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: T.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔒</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: T.gray900 }}>Security</div>
                  <div style={{ fontSize: 13, color: T.gray400 }}>Update your account password</div>
                </div>
              </div>
              <button className="ghost-btn" onClick={() => setShowPasswordSection(true)}>
                Change Password →
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: T.gray900 }}>Change Password</div>
                <button onClick={() => { setShowPasswordSection(false); setPasswordStep('initial'); }} style={{ background: 'none', border: 'none', fontSize: 20, color: T.gray400, cursor: 'pointer' }}>×</button>
              </div>

              {passwordStep === 'initial' && (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>🛡️</div>
                  <p style={{ fontSize: 14, color: T.gray600, marginBottom: 20, lineHeight: 1.6 }}>
                    We'll send a verification code to <strong>{user?.phone}</strong> before changing your password.
                  </p>
                  <button onClick={handleSendOtp} disabled={otpLoading} className="primary-btn">
                    {otpLoading ? 'Sending…' : '📲 Send Verification Code'}
                  </button>
                </div>
              )}

              {passwordStep === 'otp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="field-label">Enter OTP</label>
                    <input type="text" placeholder="• • • •" value={passwordForm.otp} onChange={e => setPasswordForm(p => ({ ...p, otp: e.target.value }))} className={`field-input otp-input`} style={{ textAlign: 'center', letterSpacing: 8, fontSize: 24, fontWeight: 900, fontFamily: T.fontDisplay }} />
                  </div>
                  <button onClick={() => setPasswordStep('new-password')} disabled={passwordForm.otp.length < 4} className="primary-btn">
                    Verify OTP →
                  </button>
                  <button onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: T.teal, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Resend Code</button>
                </div>
              )}

              {passwordStep === 'new-password' && (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label className="field-label">New Password</label>
                    <input type="password" placeholder="Min. 6 characters" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">Confirm Password</label>
                    <input type="password" placeholder="Repeat new password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} className="field-input" />
                  </div>
                  <button type="submit" disabled={loading} className="primary-btn" style={{ marginTop: 4 }}>
                    {loading ? 'Updating…' : '🔒 Update Password'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;