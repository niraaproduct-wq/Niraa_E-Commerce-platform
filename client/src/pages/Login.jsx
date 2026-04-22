import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/constants';
import toast from 'react-hot-toast';
import { FaPhone, FaLock, FaUser, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [isExistingUser, setIsExistingUser] = useState(null);
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  
  // Step tracking
  const [step, setStep] = useState(1); // 1: Phone, 2: Profile (new), 3: OTP+, 4: Create Password (new)
  
  // Form states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loginPassword, setLoginPassword] = useState(''); // for existing user step 3
  const [devOtp, setDevOtp] = useState('');
  
  // Profile fields (for new users)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Address fields
  const [address, setAddress] = useState({
    street: '',
    city: 'Dharmapuri',
    pincode: '',
    state: 'Tamil Nadu',
    landmark: '',
    lat: null,
    lng: null,
    locationName: ''
  });
  
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
          // For production with Google Maps, replace with Google Geocoding API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          
          if (data && data.address) {
            setAddress({
              ...address,
              street: data.address.road || data.display_name?.split(',')[0] || '',
              city: data.address.city || data.address.town || data.address.village || 'Dharmapuri',
              pincode: data.address.postcode || '',
              lat: latitude,
              lng: longitude,
              locationName: data.address.neighbourhood || data.address.suburb || ''
            });
            toast.success('Location detected successfully!');
          } else {
            setAddress({
              ...address,
              lat: latitude,
              lng: longitude
            });
            toast.success('Coordinates captured! Please enter address manually.');
          }
        } catch (err) {
          setAddress({
            ...address,
            lat: latitude,
            lng: longitude
          });
          toast.success('Coordinates captured! Please enter address manually.');
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        toast.error('Unable to get your location. Please allow location access or enter manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Step 1: Check phone and proceed
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return toast.error('Please enter a valid 10-digit phone number');
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
          // Send OTP immediately for existing user
          const resOtp = await fetch(`${API_BASE_URL}/auth/send-otp`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
          });
          const otpData = await resOtp.json();
          setDevOtp(otpData.devOtp);
          setStep(3); 
          toast.success(`OTP sent to ${phone}! (Dev: ${otpData.devOtp})`);
        } else {
          toast.error('This number is not registered. Please create a new account.');
        }
      } else {
        if (data.exists) {
          toast.error('This number is already registered. Please login instead.');
        } else {
          // New user goes to profile details first
          setStep(2);
        }
      }
    } catch (err) {
      toast.error('Failed to check number');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit profile details (New User)
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) return toast.error('First name is required');
    if (!address.pincode) return toast.error('Pincode is required');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const otpData = await res.json();
      setDevOtp(otpData.devOtp);
      setStep(3);
      toast.success(`OTP sent! (Dev: ${otpData.devOtp})`);
    } catch (err) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP (and Login Password for existing users)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 4) return toast.error('Please enter a valid OTP');
    if (isExistingUser && !loginPassword.trim()) return toast.error('Please enter your password');

    setLoading(true);
    try {
      const payload = { phone, otp };
      if (isExistingUser) {
        payload.loginPassword = loginPassword;
      } else {
        payload.firstName = firstName;
        payload.lastName = lastName;
        payload.address = address;
        payload.email = email;
      }

      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      
      login(data.user);
      localStorage.setItem('niraa_token', data.token);
      
      if (isExistingUser) {
        toast.success('Welcome back! 🌿');
        navigate('/');
      } else {
        setStep(4);
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Create Password (New Users)
  const handleCreatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    
    setLoading(true);
    try {
      const token = localStorage.getItem('niraa_token');
      const res = await fetch(`${API_BASE_URL}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newPassword: password })
      });
      if (!res.ok) throw new Error('Failed to save password');
      toast.success('Account created successfully! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');
      setDevOtp(data.devOtp);
      toast.success(`New OTP sent! (Dev: ${data.devOtp})`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Go back to phone
  const handleChangePhone = () => {
    setStep(1);
    setOtp('');
    setLoginPassword('');
    setIsExistingUser(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            {step === 1 ? (mode === 'login' ? 'Welcome Back' : 'Create Account') : isExistingUser ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={styles.subtitle}>
            {step === 1 ? (mode === 'login' ? 'Login to your account' : 'Sign up to get started') : isExistingUser ? 'Login to continue shopping' : 'Sign up to start shopping'}
          </p>
        </div>

        {/* Step 1: Phone Input */}
        {step === 1 && (
          <form onSubmit={handlePhoneSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.inputWrapper}>
                <FaPhone style={styles.inputIcon} />
                <input
                  type="tel"
                  className="field"
                  placeholder="Enter your 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn--primary"
              disabled={loading || phone.length < 10}
              style={styles.button}
            >
              {loading ? 'Checking...' : (mode === 'login' ? 'Login' : 'Sign Up')}
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerText}>OR</span>
            </div>

            <button 
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setPhone('');
              }}
              style={styles.toggleBtn}
            >
              {mode === 'login' 
                ? 'New customer? Create an account' 
                : 'Already have an account? Login'}
            </button>
          </form>
        )}

        {/* Step 2: New User Profile Details */}
        {step === 2 && (
          <form onSubmit={handleDetailsSubmit} style={styles.form}>
            <div style={styles.profileSection}>
              <h3 style={styles.sectionTitle}>Profile Details</h3>
              <p style={styles.sectionDesc}>Please provide your details.</p>
            </div>

            <div style={styles.nameRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>First Name *</label>
                <div style={styles.inputWrapper}>
                  <FaUser style={styles.inputIcon} />
                  <input
                    type="text"
                    className="field"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Last Name</label>
                <div style={styles.inputWrapper}>
                  <FaUser style={styles.inputIcon} />
                  <input
                    type="text"
                    className="field"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <FaEnvelope style={styles.inputIcon} />
                <input
                  type="email"
                  className="field"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.addressSection}>
              <div style={styles.addressHeader}>
                <FaMapMarkerAlt style={{ marginRight: 8 }} />
                <span>Delivery Address</span>
                <button type="button" onClick={handleGetLocation} disabled={locating} style={styles.locateBtn}>
                  {locating ? 'Locating...' : '📍 Use Current Location'}
                </button>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Street Address</label>
                <input
                  type="text"
                  className="field"
                  placeholder="House/Flat No, Building, Street"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.nameRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>City</label>
                  <input
                    type="text"
                    className="field"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Pincode *</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="636xxx"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn--primary" disabled={loading} style={styles.button}>
              {loading ? 'Processing...' : 'Next'}
            </button>
          </form>
        )}

        {/* Step 3: OTP Verification (+ Password for Existing Users) */}
        {step === 3 && (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <div style={styles.otpInfo}>
              <p style={styles.otpText}>
                OTP sent to <strong>{phone}</strong>
              </p>
              <button type="button" onClick={handleChangePhone} style={styles.changePhoneBtn}>
                Change
              </button>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Enter OTP</label>
              <input
                type="text"
                className="field"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                style={styles.input}
                required
              />
              {devOtp && <p style={styles.devOtp}>Dev OTP: {devOtp}</p>}
            </div>

            {isExistingUser && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <FaLock style={styles.inputIcon} />
                  <input
                    type="password"
                    className="field"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn--primary" disabled={loading || otp.length < 4} style={styles.button}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div style={styles.resendSection}>
              <span style={styles.resendText}>Didn't receive OTP? </span>
              <button type="button" onClick={handleResendOtp} style={styles.resendBtn} disabled={loading}>
                Resend
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Create Password (New Users Only) */}
        {step === 4 && (
          <form onSubmit={handleCreatePassword} style={styles.form}>
            <div style={styles.passwordSection}>
              <h4 style={styles.passwordTitle}>Set Your Password</h4>
              <p style={styles.passwordDesc}>Create a secure password for your account.</p>

              <div style={styles.nameRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <div style={styles.inputWrapper}>
                    <FaLock style={styles.inputIcon} />
                    <input
                      type="password"
                      className="field"
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <div style={styles.inputWrapper}>
                    <FaLock style={styles.inputIcon} />
                    <input
                      type="password"
                      className="field"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn--primary" disabled={loading} style={styles.button}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            By continuing, you agree to our <a href="/terms" style={styles.link}>Terms of Service</a> and <a href="/privacy" style={styles.link}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    margin: '0 0 8px',
    color: 'var(--teal-dark)',
    fontSize: '1.75rem',
    fontWeight: '700'
  },
  subtitle: {
    margin: 0,
    color: 'var(--gray-600)',
    fontSize: '0.95rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--gray-700)'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--gray-500)',
    fontSize: '0.9rem'
  },
  input: {
    paddingLeft: '40px'
  },
  button: {
    marginTop: '8px',
    padding: '14px',
    fontSize: '1rem',
    fontWeight: '600'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '8px 0'
  },
  dividerText: {
    flex: 1,
    textAlign: 'center',
    color: 'var(--gray-500)',
    fontSize: '0.875rem',
    position: 'relative'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--teal-base)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '8px',
    textDecoration: 'underline'
  },
  otpInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--gray-100)',
    padding: '12px 16px',
    borderRadius: '8px'
  },
  otpText: {
    margin: 0,
    color: 'var(--gray-700)',
    fontSize: '0.9rem'
  },
  changePhoneBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--teal-base)',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  devOtp: {
    margin: '4px 0 0',
    fontSize: '0.8rem',
    color: 'var(--teal-base)',
    background: '#e6f4f2',
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'inline-block'
  },
  resendSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
    marginTop: '8px'
  },
  resendText: {
    fontSize: '0.875rem',
    color: 'var(--gray-600)'
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--teal-base)',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  profileSection: {
    marginBottom: '16px'
  },
  sectionTitle: {
    margin: '0 0 4px',
    color: 'var(--teal-dark)',
    fontSize: '1.1rem',
    fontWeight: '600'
  },
  sectionDesc: {
    margin: 0,
    color: 'var(--gray-600)',
    fontSize: '0.875rem'
  },
  nameRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  addressSection: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '12px',
    marginTop: '8px'
  },
  addressHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    fontWeight: '600',
    color: 'var(--teal-dark)'
  },
  locateBtn: {
    marginLeft: 'auto',
    background: 'var(--teal-light)',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--teal-dark)',
    cursor: 'pointer'
  },
  passwordSection: {
    marginTop: '8px'
  },
  passwordTitle: {
    margin: '0 0 4px',
    color: 'var(--gray-800)',
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  passwordDesc: {
    margin: '0 0 12px',
    color: 'var(--gray-600)',
    fontSize: '0.8rem'
  },
  footer: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid var(--gray-200)',
    textAlign: 'center'
  },
  footerText: {
    margin: 0,
    fontSize: '0.8rem',
    color: 'var(--gray-500)'
  },
  link: {
    color: 'var(--teal-base)',
    textDecoration: 'none'
  }
};

export default Login;