import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../utils/constants.js';
import toast from 'react-hot-toast';

/* ─── Design Tokens ─────────────────────────────────── */
const T = {
  emerald: '#059669',
  emeraldMid: '#047857',
  emeraldDark: '#064e3b',
  emeraldGlow: 'rgba(5,150,105,0.15)',
  emeraldGlow2: 'rgba(5,150,105,0.08)',
  gold: '#d97706',
  goldLight: '#fef3c7',
  surface: '#ffffff',
  surfaceAlt: '#f8faf9',
  border: '#e4e9e7',
  borderFocus: '#059669',
  text: '#0f1a16',
  textSub: '#3d5249',
  textMuted: '#6b7f76',
  textFaint: '#9db0a8',
  red: '#dc2626',
  redLight: '#fef2f2',
  font: `'Outfit', 'DM Sans', system-ui, sans-serif`,
  fontDisplay: `'Playfair Display', Georgia, serif`,
};

const GLOBAL_CSS = `
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.93); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5,150,105,0.4); }
    70%  { transform: scale(1);    box-shadow: 0 0 0 10px rgba(5,150,105,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5,150,105,0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .profile-root {
    font-family: ${T.font};
    background: ${T.surfaceAlt};
    min-height: 100vh;
    padding: 48px 20px 80px;
    color: ${T.text};
  }

  .profile-wrap {
    max-width: 660px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* ── Page header ── */
  .ph-header {
    animation: fadeUp 0.5s ease both;
  }
  .ph-breadcrumb {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: ${T.emerald};
    margin-bottom: 8px;
  }
  .ph-breadcrumb-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: ${T.emerald};
  }
  .ph-title {
    font-family: ${T.fontDisplay};
    font-size: 2.1rem;
    font-weight: 900;
    color: ${T.text};
    letter-spacing: -.03em;
    line-height: 1;
    margin-bottom: 6px;
  }
  .ph-sub {
    font-size: 14px;
    color: ${T.textMuted};
    font-weight: 500;
  }

  /* ── Cards ── */
  .card {
    background: ${T.surface};
    border: 1.5px solid ${T.border};
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    transition: box-shadow 0.25s;
    animation: fadeUp 0.45s ease both;
  }
  .card:hover {
    box-shadow: 0 6px 28px rgba(0,0,0,0.07);
  }

  /* ── Avatar band ── */
  .avatar-band {
    background: linear-gradient(135deg, ${T.emeraldDark} 0%, #0a5940 50%, #06403a 100%);
    padding: 28px 28px 24px;
    position: relative;
    overflow: hidden;
  }
  .avatar-band::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }
  .avatar-band::after {
    content: '';
    position: absolute;
    bottom: -40px; left: 30%;
    width: 140px; height: 140px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
    pointer-events: none;
  }
  .avatar-inner {
    display: flex;
    align-items: center;
    gap: 18px;
    position: relative;
    z-index: 1;
  }
  .avatar-circle {
    width: 80px; height: 80px;
    border-radius: 22px;
    background: linear-gradient(135deg, ${T.emerald}, ${T.emeraldMid});
    display: flex; align-items: center; justify-content: center;
    font-family: ${T.fontDisplay};
    font-size: 2rem;
    font-weight: 900;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .avatar-circle:hover {
    transform: scale(1.04) rotate(-2deg);
    box-shadow: 0 12px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .avatar-name {
    font-family: ${T.fontDisplay};
    font-size: 1.45rem;
    font-weight: 900;
    color: #fff;
    letter-spacing: -.02em;
    line-height: 1.1;
    margin-bottom: 4px;
  }
  .avatar-phone {
    font-size: 13px;
    color: rgba(255,255,255,0.65);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .avatar-email {
    font-size: 12px;
    color: rgba(255,255,255,0.45);
    margin-top: 2px;
  }
  .avatar-edit-btn {
    margin-left: auto;
    padding: 9px 18px;
    border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.1);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    font-family: ${T.font};
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
    flex-shrink: 0;
    white-space: nowrap;
  }
  .avatar-edit-btn:hover {
    background: rgba(255,255,255,0.18);
    border-color: rgba(255,255,255,0.4);
    transform: translateY(-1px);
  }
  .avatar-cancel-btn {
    background: rgba(220,38,38,0.15);
    border-color: rgba(220,38,38,0.35);
    color: #fca5a5;
  }
  .avatar-cancel-btn:hover {
    background: rgba(220,38,38,0.25);
    border-color: rgba(220,38,38,0.5);
  }

  /* ── Card body ── */
  .card-body {
    padding: 24px 28px 28px;
  }

  /* ── View mode info blocks ── */
  .info-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }
  .info-block {
    padding: 14px 16px;
    background: ${T.surfaceAlt};
    border: 1.5px solid ${T.border};
    border-radius: 14px;
    transition: border-color 0.2s, background 0.2s, transform 0.2s;
    cursor: default;
  }
  .info-block:hover {
    border-color: ${T.emeraldGlow.replace('0.15', '0.35')};
    background: #f0faf6;
    transform: translateY(-1px);
  }
  .info-label {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: ${T.textFaint};
    margin-bottom: 5px;
  }
  .info-value {
    font-size: 14px;
    font-weight: 700;
    color: ${T.text};
    word-break: break-all;
  }
  .info-block.address-block {
    background: linear-gradient(135deg, #f0faf6, #e8f7f0);
    border-color: rgba(5,150,105,0.2);
  }
  .info-block.address-block .info-label {
    color: ${T.emeraldMid};
  }
  .info-block.address-block .info-value {
    color: ${T.text};
  }

  /* ── Edit form ── */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .field-label {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: ${T.textMuted};
  }
  .field-input {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid ${T.border};
    border-radius: 14px;
    font-size: 14px;
    font-family: ${T.font};
    font-weight: 600;
    color: ${T.text};
    background: ${T.surface};
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
  }
  .field-input:focus {
    border-color: ${T.emerald};
    box-shadow: 0 0 0 4px ${T.emeraldGlow2};
    background: #fcfffe;
  }
  .field-input:disabled {
    background: ${T.surfaceAlt};
    color: ${T.textFaint};
    cursor: not-allowed;
  }
  .field-input::placeholder { color: ${T.textFaint}; font-weight: 400; }
  
  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .form-grid-21 {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 14px;
  }
  .form-section {
    border-top: 1.5px solid ${T.border};
    padding-top: 18px;
    margin-top: 4px;
  }
  .form-section-label {
    font-size: 13px;
    font-weight: 800;
    color: ${T.text};
    margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }

  /* ── Save button ── */
  .save-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, ${T.emerald}, ${T.emeraldMid});
    color: #fff;
    border: none;
    border-radius: 16px;
    font-size: 15px;
    font-weight: 800;
    font-family: ${T.font};
    cursor: pointer;
    margin-top: 6px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px ${T.emeraldGlow};
    transition: all 0.2s;
    letter-spacing: .02em;
  }
  .save-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px ${T.emeraldGlow};
  }
  .save-btn:hover:not(:disabled)::before {
    opacity: 1;
    animation: shimmer 1.2s infinite;
  }
  .save-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  .save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .save-btn-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.7s linear infinite;
    vertical-align: -3px;
    margin-right: 8px;
  }

  /* ── Security card ── */
  .security-card {
    animation-delay: 0.1s;
  }
  .security-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 28px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .security-icon-wrap {
    width: 48px; height: 48px;
    border-radius: 14px;
    background: ${T.surfaceAlt};
    border: 1.5px solid ${T.border};
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    transition: transform 0.2s;
  }
  .security-icon-wrap:hover {
    transform: rotate(-8deg) scale(1.1);
  }
  .security-title {
    font-size: 15px;
    font-weight: 800;
    color: ${T.text};
  }
  .security-sub {
    font-size: 12px;
    color: ${T.textMuted};
    font-weight: 500;
    margin-top: 2px;
  }
  .change-pwd-btn {
    padding: 10px 20px;
    background: ${T.surface};
    border: 1.5px solid ${T.border};
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    color: ${T.textSub};
    cursor: pointer;
    font-family: ${T.font};
    display: flex; align-items: center; gap: 7px;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .change-pwd-btn:hover {
    border-color: ${T.emerald};
    color: ${T.emerald};
    background: ${T.emeraldGlow2};
    transform: translateY(-1px);
  }
  
  .pwd-panel {
    border-top: 1.5px solid ${T.border};
    padding: 24px 28px;
    animation: slideDown 0.3s ease;
  }
  .pwd-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
  }
  .pwd-panel-title {
    font-size: 16px;
    font-weight: 800;
    color: ${T.text};
  }
  .pwd-close-btn {
    width: 32px; height: 32px;
    border-radius: 8px;
    border: 1.5px solid ${T.border};
    background: ${T.surface};
    color: ${T.textMuted};
    font-size: 18px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    line-height: 1;
    font-family: ${T.font};
  }
  .pwd-close-btn:hover {
    background: ${T.surfaceAlt};
    color: ${T.text};
    border-color: ${T.textFaint};
  }

  /* ── OTP step ── */
  .step-icon-wrap {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: ${T.emeraldGlow2};
    border: 2px solid rgba(5,150,105,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    margin: 0 auto 18px;
    animation: pulse-ring 2s infinite;
  }
  .step-desc {
    font-size: 14px;
    color: ${T.textSub};
    line-height: 1.65;
    text-align: center;
    margin-bottom: 22px;
    max-width: 340px;
    margin-left: auto;
    margin-right: auto;
  }
  .step-desc strong {
    color: ${T.emerald};
    font-weight: 700;
  }
  .otp-input {
    text-align: center;
    letter-spacing: 14px;
    font-size: 28px;
    font-weight: 900;
    font-family: ${T.fontDisplay};
    color: ${T.text};
    padding-left: 22px !important;
  }
  .resend-btn {
    background: none;
    border: none;
    color: ${T.emerald};
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: ${T.font};
    text-align: center;
    width: 100%;
    padding: 8px;
    border-radius: 10px;
    transition: background 0.2s;
  }
  .resend-btn:hover {
    background: ${T.emeraldGlow2};
  }

  /* ── Password strength ── */
  .pwd-strength-bar {
    height: 3px;
    border-radius: 99px;
    background: ${T.border};
    margin-top: 8px;
    overflow: hidden;
  }
  .pwd-strength-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.4s, background 0.4s;
  }

  /* ── Responsive ── */
  @media (max-width: 500px) {
    .info-grid-2, .form-grid-2, .form-grid-21 { grid-template-columns: 1fr; }
    .avatar-band { padding: 20px 18px 18px; }
    .card-body { padding: 18px 18px 22px; }
    .security-header { padding: 18px; }
    .pwd-panel { padding: 18px; }
    .avatar-edit-btn { padding: 8px 14px; font-size: 12px; }
    .ph-title { font-size: 1.7rem; }
  }
`;

/* ── Password strength helper ── */
const pwdStrength = pwd => {
  if (!pwd) return { score: 0, label: '', color: T.border };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: 'Too weak', color: '#ef4444' },
    { label: 'Weak', color: '#f97316' },
    { label: 'Fair', color: '#eab308' },
    { label: 'Good', color: '#3b82f6' },
    { label: 'Strong', color: '#10b981' },
    { label: 'Very strong', color: '#059669' },
  ];
  return { score, ...map[score] };
};

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
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
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

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
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          address: { addressLine1: formData.address, city: formData.city, pincode: formData.pincode }
        })
      });
      if (res.ok) {
        const data = await res.json();
        updateProfile(data.user);
        toast.success('Profile saved successfully');
        setIsEditing(false);
      } else if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Failed to save');
      }
    } catch { toast.error('Server error. Try again.'); }
    finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, email: user.email })
      });
      if (res.ok) { toast.success('Code sent to your email'); setPasswordStep('otp'); }
      else { const d = await res.json(); toast.error(d.message || 'Failed to send code'); }
    } catch { toast.error('Error sending code'); }
    finally { setOtpLoading(false); }
  };

  const handleResetPassword = async e => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error('Passwords do not match');
    if (passwordForm.newPassword.length < 6)
      return toast.error('Minimum 6 characters required');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password-with-otp`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: passwordForm.otp, newPassword: passwordForm.newPassword })
      });
      if (res.ok) {
        toast.success('Password updated successfully');
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
  const strength = pwdStrength(passwordForm.newPassword);

  return (
    <div className="profile-root">
      <style>{GLOBAL_CSS}</style>
      <div className="profile-wrap">

        {/* ── Page Header ── */}
        <div className="ph-header">
          <div className="ph-breadcrumb">
            <span className="ph-breadcrumb-dot" />
            Account
          </div>
          <h1 className="ph-title">My Profile</h1>
          <p className="ph-sub">Manage your details and delivery address</p>
        </div>

        {/* ── Profile Card ── */}
        <div className="card" style={{ animationDelay: '0.05s' }}>
          {/* Avatar Band */}
          <div className="avatar-band">
            <div className="avatar-inner">
              <div className="avatar-circle">{initials}</div>
              <div>
                <div className="avatar-name">{user?.name || 'User'}</div>
                <div className="avatar-phone">📱 {user?.phone}</div>
                {user?.email && <div className="avatar-email">{user.email}</div>}
              </div>
              {!isEditing ? (
                <button className="avatar-edit-btn" onClick={() => setIsEditing(true)}>
                  ✏️ Edit Profile
                </button>
              ) : (
                <button className="avatar-edit-btn avatar-cancel-btn" onClick={() => setIsEditing(false)}>
                  ✕ Cancel
                </button>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="card-body">
            {!isEditing ? (
              /* ── View Mode ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.3s ease' }}>
                <div className="info-grid-2">
                  <div className="info-block">
                    <div className="info-label">Full Name</div>
                    <div className="info-value">{formData.name || '—'}</div>
                  </div>
                  <div className="info-block">
                    <div className="info-label">Email Address</div>
                    <div className="info-value" style={{ fontSize: 13 }}>{formData.email || '—'}</div>
                  </div>
                </div>
                <div className="info-block">
                  <div className="info-label">📱 Phone Number</div>
                  <div className="info-value">{formData.phone || '—'}</div>
                </div>
                <div className="info-block address-block">
                  <div className="info-label">📍 Delivery Address</div>
                  {formData.address || formData.city ? (
                    <div>
                      <div className="info-value">{formData.address}</div>
                      <div style={{ fontSize: 13, color: T.emeraldMid, marginTop: 3, fontWeight: 600 }}>
                        {formData.city}{formData.pincode ? ` – ${formData.pincode}` : ''}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: T.textFaint }}>No delivery address saved yet</div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Edit Mode ── */
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeIn 0.3s ease' }}>
                <div className="form-grid-2">
                  <div className="field-group">
                    <label className="field-label">Full Name</label>
                    <input
                      type="text"
                      className="field-input"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Email Address</label>
                    <input
                      type="email"
                      className="field-input"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Phone (cannot change)</label>
                  <input type="text" className="field-input" value={formData.phone} disabled />
                </div>

                <div className="form-section">
                  <div className="form-section-label">📍 Delivery Address</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="field-group">
                      <label className="field-label">Street / Flat / Landmark</label>
                      <textarea
                        className="field-input"
                        rows={2}
                        value={formData.address}
                        onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                        placeholder="House No., Street, Landmark"
                        style={{ resize: 'vertical', lineHeight: 1.6 }}
                      />
                    </div>
                    <div className="form-grid-21">
                      <div className="field-group">
                        <label className="field-label">City</label>
                        <input
                          type="text"
                          className="field-input"
                          value={formData.city}
                          onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                          placeholder="City"
                        />
                      </div>
                      <div className="field-group">
                        <label className="field-label">Pincode</label>
                        <input
                          type="text"
                          className="field-input"
                          value={formData.pincode}
                          onChange={e => setFormData(p => ({ ...p, pincode: e.target.value }))}
                          placeholder="6XXXXX"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="save-btn">
                  {loading ? <><span className="save-btn-spinner" /> Saving…</> : '✓ Save Changes'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Security Card ── */}
        <div className="card security-card" style={{ animationDelay: '0.12s' }}>
          {!showPasswordSection ? (
            <div className="security-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="security-icon-wrap">🔒</div>
                <div>
                  <div className="security-title">Security</div>
                  <div className="security-sub">Update your account password via email OTP</div>
                </div>
              </div>
              <button className="change-pwd-btn" onClick={() => setShowPasswordSection(true)}>
                Change Password →
              </button>
            </div>
          ) : (
            <div>
              <div className="security-header" style={{ paddingBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="security-icon-wrap">🔒</div>
                  <div>
                    <div className="security-title">Change Password</div>
                    <div className="security-sub">
                      {passwordStep === 'initial' && 'Verify your identity first'}
                      {passwordStep === 'otp' && `Code sent to ${user?.email}`}
                      {passwordStep === 'new-password' && 'Set a strong new password'}
                    </div>
                  </div>
                </div>
                <button
                  className="pwd-close-btn"
                  onClick={() => { setShowPasswordSection(false); setPasswordStep('initial'); setPasswordForm({ otp: '', newPassword: '', confirmPassword: '' }); }}
                >×</button>
              </div>

              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 28px 20px' }}>
                {['Verify Email', 'Enter Code', 'New Password'].map((s, i) => {
                  const stepIdx = { initial: 0, otp: 1, 'new-password': 2 }[passwordStep];
                  const done = i < stepIdx;
                  const active = i === stepIdx;
                  return (
                    <React.Fragment key={s}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: done ? T.emerald : active ? T.emeraldGlow : T.border,
                          border: `2px solid ${done || active ? T.emerald : T.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 900,
                          color: done ? '#fff' : active ? T.emerald : T.textFaint,
                          transition: 'all 0.3s',
                          boxShadow: active ? `0 0 0 4px ${T.emeraldGlow2}` : 'none',
                        }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: active ? T.emerald : done ? T.textSub : T.textFaint, whiteSpace: 'nowrap' }}>{s}</div>
                      </div>
                      {i < 2 && (
                        <div style={{ flex: 1, height: 2, background: done ? T.emerald : T.border, margin: '0 6px', marginBottom: 18, transition: 'background 0.4s', minWidth: 20 }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="pwd-panel" style={{ borderTop: `1.5px solid ${T.border}` }}>

                {passwordStep === 'initial' && (
                  <div style={{ textAlign: 'center', animation: 'scaleIn 0.3s ease' }}>
                    <div className="step-icon-wrap">🛡️</div>
                    <p className="step-desc">
                      We'll send a 4-digit verification code to <strong>{user?.email}</strong> to confirm your identity before changing your password.
                    </p>
                    <button onClick={handleSendOtp} disabled={otpLoading} className="save-btn" style={{ maxWidth: 320 }}>
                      {otpLoading ? <><span className="save-btn-spinner" /> Sending…</> : '📲 Send Verification Code'}
                    </button>
                  </div>
                )}

                {passwordStep === 'otp' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'scaleIn 0.3s ease' }}>
                    <div className="field-group">
                      <label className="field-label" style={{ textAlign: 'center', marginBottom: 10 }}>Enter the 4-digit code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="• • • •"
                        value={passwordForm.otp}
                        onChange={e => setPasswordForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, '') }))}
                        className="field-input otp-input"
                      />
                    </div>
                    <button
                      onClick={() => setPasswordStep('new-password')}
                      disabled={passwordForm.otp.length < 4}
                      className="save-btn"
                    >
                      Verify Code →
                    </button>
                    <button className="resend-btn" onClick={handleSendOtp}>Resend Code</button>
                  </div>
                )}

                {passwordStep === 'new-password' && (
                  <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'scaleIn 0.3s ease' }}>
                    <div className="field-group">
                      <label className="field-label">New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPwd ? 'text' : 'password'}
                          className="field-input"
                          placeholder="Min. 6 characters"
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                          style={{ paddingRight: 48 }}
                        />
                        <button type="button" onClick={() => setShowNewPwd(v => !v)}
                          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: T.textMuted }}>
                          {showNewPwd ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {passwordForm.newPassword && (
                        <div>
                          <div className="pwd-strength-bar">
                            <div className="pwd-strength-fill" style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }} />
                          </div>
                          <div style={{ fontSize: 11, color: strength.color, fontWeight: 700, marginTop: 4 }}>{strength.label}</div>
                        </div>
                      )}
                    </div>
                    <div className="field-group">
                      <label className="field-label">Confirm Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPwd ? 'text' : 'password'}
                          className="field-input"
                          placeholder="Repeat new password"
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                          style={{ paddingRight: 48, borderColor: passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword ? T.red : undefined }}
                        />
                        <button type="button" onClick={() => setShowConfirmPwd(v => !v)}
                          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: T.textMuted }}>
                          {showConfirmPwd ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                        <div style={{ fontSize: 11, color: T.red, fontWeight: 700, marginTop: 4 }}>Passwords do not match</div>
                      )}
                    </div>
                    <button type="submit" disabled={loading} className="save-btn" style={{ marginTop: 4 }}>
                      {loading ? <><span className="save-btn-spinner" /> Updating…</> : '🔒 Update Password'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;