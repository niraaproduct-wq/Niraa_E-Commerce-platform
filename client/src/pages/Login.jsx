import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/constants';
import toast from 'react-hot-toast';

const T = {
  teal: '#1D9E75', tealDark: '#0F6E56', tealLight: '#E8F8F1',
  gray50: '#F9F9F8', gray100: '#F2F1EF', gray200: '#E5E3DE',
  gray300: '#C9C6BF', gray400: '#A8A59D', gray500: '#87847C',
  gray600: '#6B6862', gray700: '#4A4845', gray800: '#2E2D2A', gray900: '#1A1917',
  white: '#FFFFFF',
  font: `'DM Sans', system-ui, sans-serif`,
  fontDisplay: `'Fraunces', Georgia, serif`,
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  .login-page * { box-sizing: border-box; }

  .login-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 24px; font-family: ${T.font};
    position: relative; overflow: hidden;
  }
  .login-bg::before {
    content: ''; position: absolute;
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(29,158,117,0.08) 0%, transparent 70%);
    top: -200px; right: -200px;
  }
  .login-bg::after {
    content: ''; position: absolute;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(29,158,117,0.06) 0%, transparent 70%);
    bottom: -100px; left: -100px;
  }

  .login-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 480px;
    background: ${T.white};
    border-radius: 28px;
    padding: 40px 36px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 24px 64px rgba(0,0,0,0.10);
    border: 1px solid rgba(255,255,255,0.8);
  }
  @media (max-width: 480px) {
    .login-card { padding: 28px 20px; border-radius: 20px; }
  }

  .login-logo {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 28px;
    text-decoration: none;
  }

  .step-indicator {
    display: flex; align-items: center; gap: 8px; margin-bottom: 28px;
  }
  .step-dot {
    width: 8px; height: 8px; border-radius: 50%;
    transition: all 0.3s;
  }
  .step-dot.active { width: 24px; background: ${T.teal}; border-radius: 4px; }
  .step-dot.done { background: ${T.teal}; }
  .step-dot.pending { background: ${T.gray200}; }

  .field-label {
    display: block; font-size: 11px; font-weight: 700;
    letter-spacing: .07em; text-transform: uppercase;
    color: ${T.gray500}; margin-bottom: 6px;
  }
  .field-input {
    width: 100%; padding: 14px 16px;
    border: 1.5px solid ${T.gray200}; border-radius: 12px;
    font-size: 15px; font-family: ${T.font}; color: ${T.gray800};
    background: ${T.white}; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .field-input:focus {
    border-color: ${T.teal};
    box-shadow: 0 0 0 3px rgba(29,158,117,0.12);
  }
  .field-input:disabled {
    background: ${T.gray50}; color: ${T.gray400};
  }
  .field-input.otp-style {
    text-align: center; letter-spacing: 8px; font-size: 24px;
    font-weight: 800; font-family: ${T.fontDisplay};
  }

  .primary-btn {
    width: 100%; padding: 15px;
    background: ${T.teal}; color: #fff;
    border: none; border-radius: 12px;
    font-weight: 800; font-size: 15px; cursor: pointer;
    font-family: ${T.font};
    box-shadow: 0 4px 16px rgba(29,158,117,0.35);
    transition: all 0.2s;
  }
  .primary-btn:hover:not(:disabled) {
    background: ${T.tealDark};
    box-shadow: 0 8px 24px rgba(29,158,117,0.45);
    transform: translateY(-1px);
  }
  .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .ghost-btn {
    width: 100%; padding: 13px;
    background: ${T.gray50}; color: ${T.gray700};
    border: 1.5px solid ${T.gray200}; border-radius: 12px;
    font-weight: 700; font-size: 14px; cursor: pointer;
    font-family: ${T.font}; transition: all 0.2s;
  }
  .ghost-btn:hover { border-color: ${T.teal}; color: ${T.teal}; background: ${T.tealLight}; }

  .method-toggle {
    display: grid; grid-template-columns: 1fr 1fr;
    background: ${T.gray100}; border-radius: 12px; padding: 4px; gap: 4px;
    margin-bottom: 20px;
  }
  .method-btn {
    padding: 10px; border-radius: 10px; border: none;
    font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: ${T.font}; transition: all 0.2s;
    background: transparent; color: ${T.gray500};
  }
  .method-btn.active {
    background: ${T.white}; color: ${T.tealDark};
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .phone-info-bar {
    display: flex; justify-content: space-between; align-items: center;
    background: ${T.gray50}; border: 1px solid ${T.gray200};
    border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;
  }

  .trust-badges {
    display: flex; gap: 8px; flex-wrap: wrap;
    justify-content: center; margin-top: 24px;
  }
  .trust-badge {
    font-size: 11px; color: ${T.gray400}; font-weight: 600;
    display: flex; align-items: center; gap: 4px;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .slide-in { animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

  .locating-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 9px 14px;
    background: ${T.tealLight}; border: 1px solid rgba(29,158,117,0.3);
    border-radius: 8px; color: ${T.tealDark}; font-size: 12px; font-weight: 700;
    cursor: pointer; font-family: ${T.font}; transition: all 0.2s;
    white-space: nowrap;
  }
  .locating-btn:hover { background: rgba(29,158,117,0.2); }

  .address-section {
    background: ${T.gray50}; border-radius: 14px;
    padding: 18px; margin-top: 4px;
    border: 1px solid ${T.gray200};
  }
`;

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(1);
  const [isExistingUser, setIsExistingUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState('otp');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  const [address, setAddress] = useState({ street: '', city: 'Dharmapuri', pincode: '' });

  const sendOtpToPhone = async (phoneNumber) => {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneNumber })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data?.address) {
            setAddress(prev => ({
              ...prev,
              street: data.address.road || data.display_name?.split(',')[0] || '',
              city: data.address.city || data.address.town || 'Dharmapuri',
              pincode: data.address.postcode || '',
            }));
            toast.success('📍 Location detected!');
          }
        } catch { toast.success('Coordinates captured! Enter address manually.'); }
        finally { setLocating(false); }
      },
      () => { setLocating(false); toast.error('Could not get location. Enter manually.'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhoneSubmit = async e => {
    e.preventDefault();
    if (phone.length < 10) return toast.error('Enter a valid 10-digit number');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/check-phone`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      setIsExistingUser(data.exists);
      if (mode === 'login') {
        if (data.exists) {
          const result = await sendOtpToPhone(phone);
          setStep(3);
          toast.success(`OTP sent to ${phone}`);
          if (result.devOtp) toast.success(`Dev OTP: ${result.devOtp}`, { duration: 5000 });
        } else {
          toast.error('Number not registered. Create an account.');
        }
      } else {
        if (data.exists) { toast.error('Number already registered. Please login.'); }
        else { setStep(2); }
      }
    } catch { toast.error('Failed to check number'); }
    finally { setLoading(false); }
  };

  const handleDetailsSubmit = async e => {
    e.preventDefault();
    if (!profile.firstName.trim()) return toast.error('First name required');
    if (!address.pincode) return toast.error('Pincode required');
    setLoading(true);
    try {
      await sendOtpToPhone(phone);
      setStep(3);
      toast.success('OTP sent!');
    } catch { toast.error('Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async e => {
    e.preventDefault();
    if (otp.length < 4) return toast.error('Enter valid OTP');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, ...profile, address, email: profile.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      login(data.user, data.token);
      toast.success(data.isNewUser ? '🌿 Welcome to NIRAA!' : '👋 Welcome back!');
      navigate(from, { replace: true });
    } catch (err) { toast.error(err.message || 'Verification failed'); }
    finally { setLoading(false); }
  };

  const handlePasswordLogin = async e => {
    e.preventDefault();
    if (!loginPassword.trim()) return toast.error('Enter your password');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data.user, data.token);
      toast.success('👋 Welcome back!');
      navigate(from, { replace: true });
    } catch (err) { toast.error(err.message || 'Incorrect credentials'); }
    finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try { await sendOtpToPhone(phone); toast.success('New OTP sent!'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const totalSteps = mode === 'signup' ? 3 : 2;
  const currentStepNum = step;

  return (
    <div className="login-page">
      <style>{css}</style>
      <div className="login-bg">
        <div className="login-card">
          {/* Logo */}
          <Link to="/" className="login-logo">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: T.fontDisplay }}>N</div>
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 20, color: T.gray900 }}>NIRAA</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.teal, letterSpacing: '.05em', textTransform: 'uppercase', marginLeft: 2 }}>Products</span>
          </Link>

          {/* Step indicator */}
          <div className="step-indicator">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`step-dot ${i + 1 === currentStepNum ? 'active' : i + 1 < currentStepNum ? 'done' : 'pending'}`} />
            ))}
            <span style={{ marginLeft: 8, fontSize: 12, color: T.gray400, fontWeight: 600 }}>
              Step {currentStepNum} of {totalSteps}
            </span>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: '1.7rem', fontWeight: 900, color: T.gray900, margin: '0 0 6px', letterSpacing: '-.02em' }}>
              {step === 1 ? (mode === 'login' ? 'Welcome back' : 'Create account') : step === 2 ? 'Your details' : isExistingUser ? 'Verify identity' : 'Verify phone'}
            </h1>
            <p style={{ margin: 0, color: T.gray400, fontSize: 14 }}>
              {step === 1 ? (mode === 'login' ? 'Enter your phone to continue' : 'Sign up with your phone number') :
                step === 2 ? 'A few details to complete your profile' :
                  `OTP sent to +91 ${phone}`}
            </p>
          </div>

          {/* Step 1: Phone */}
          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="field-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: T.gray500, fontWeight: 700 }}>+91</span>
                  <input
                    type="tel" placeholder="Enter 10-digit number"
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="field-input" style={{ paddingLeft: 52 }} required />
                </div>
              </div>
              <button type="submit" disabled={loading || phone.length < 10} className="primary-btn">
                {loading ? 'Checking…' : mode === 'login' ? 'Continue →' : 'Sign Up →'}
              </button>
              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setPhone(''); }}
                  style={{ background: 'none', border: 'none', color: T.teal, fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                  {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Profile (new user) */}
          {step === 2 && (
            <form onSubmit={handleDetailsSubmit} className="slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="field-label">First Name *</label>
                  <input type="text" placeholder="First name" value={profile.firstName}
                    onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                    className="field-input" required />
                </div>
                <div>
                  <label className="field-label">Last Name</label>
                  <input type="text" placeholder="Last name" value={profile.lastName}
                    onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                    className="field-input" />
                </div>
              </div>
              <div>
                <label className="field-label">Email (optional)</label>
                <input type="email" placeholder="your@email.com" value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="field-input" />
              </div>
              <div className="address-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: T.tealDark }}>📍 Delivery Address</div>
                  <button type="button" onClick={handleGetLocation} disabled={locating} className="locating-btn">
                    {locating ? '⏳ Locating…' : '📍 Use my location'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label className="field-label">Street</label>
                    <input type="text" placeholder="House/Flat, Street, Landmark" value={address.street}
                      onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} className="field-input" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label className="field-label">City</label>
                      <input type="text" value={address.city}
                        onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">Pincode *</label>
                      <input type="text" placeholder="636xxx" value={address.pincode}
                        onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))} className="field-input" required />
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading} className="primary-btn">
                {loading ? 'Processing…' : 'Send OTP →'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="ghost-btn">← Back</button>
            </form>
          )}

          {/* Step 3: OTP / Password */}
          {step === 3 && (
            <form onSubmit={isExistingUser && loginMethod === 'password' ? handlePasswordLogin : handleVerifyOtp}
              className="slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div className="phone-info-bar">
                <span style={{ fontSize: 14, color: T.gray700, fontWeight: 600 }}>📱 +91 {phone}</span>
                <button type="button" onClick={() => { setStep(1); setOtp(''); setLoginPassword(''); }}
                  style={{ background: 'none', border: 'none', color: T.teal, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Change
                </button>
              </div>

              {isExistingUser && (
                <div className="method-toggle">
                  <button type="button" onClick={() => setLoginMethod('otp')} className={`method-btn ${loginMethod === 'otp' ? 'active' : ''}`}>
                    📲 OTP
                  </button>
                  <button type="button" onClick={() => setLoginMethod('password')} className={`method-btn ${loginMethod === 'password' ? 'active' : ''}`}>
                    🔒 Password
                  </button>
                </div>
              )}

              {(!isExistingUser || loginMethod === 'otp') ? (
                <div>
                  <label className="field-label">Enter OTP</label>
                  <input type="text" placeholder="• • • •" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="field-input otp-style" required />
                  <div style={{ textAlign: 'center', marginTop: 10 }}>
                    <button type="button" onClick={handleResendOtp} disabled={loading}
                      style={{ background: 'none', border: 'none', color: T.teal, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Resend OTP
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="field-label">Password</label>
                  <input type="password" placeholder="Your password" value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)} className="field-input" required />
                </div>
              )}

              <button type="submit" disabled={loading || (loginMethod === 'otp' && otp.length < 4)} className="primary-btn">
                {loading ? 'Verifying…' : '✓ Verify & Login'}
              </button>
            </form>
          )}

          {/* Trust Badges */}
          <div className="trust-badges">
            {['🔒 Secure login', '🌿 Eco brand', '⚡ Fast checkout'].map(t => (
              <span key={t} className="trust-badge">{t}</span>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.gray100}`, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 12, color: T.gray400 }}>
              By continuing, you agree to our{' '}
              <a href="/terms" style={{ color: T.teal, textDecoration: 'none', fontWeight: 600 }}>Terms</a>
              {' & '}
              <a href="/privacy" style={{ color: T.teal, textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;