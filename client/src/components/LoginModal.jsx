import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/constants';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP (if new, also Name & Location)
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  const [needsSignupDetails, setNeedsSignupDetails] = useState(false);
  const [name, setName] = useState('');
  
  const [address, setAddress] = useState({
    street: '',
    city: 'Dharmapuri',
    pincode: '',
    lat: null,
    lng: null
  });
  const [locating, setLocating] = useState(false);

  const handleClose = () => {
    // Reset state
    setStep(1);
    setPhone('');
    setOtp('');
    setNeedsSignupDetails(false);
    onClose();
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Fallback to OSM Nominatim for out of the box geocoding without api keys
          // If the user has a Google Maps API Key, they can replace this endpoint.
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            setAddress({
              street: data.address.road || data.display_name.split(',')[0],
              city: data.address.city || data.address.town || data.address.village || 'Dharmapuri',
              pincode: data.address.postcode || '',
              lat: latitude,
              lng: longitude
            });
            toast.success('Location successfully detected!');
          }
        } catch (err) {
          setAddress(prev => ({ ...prev, lat: latitude, lng: longitude }));
          toast.success('Coordinates pinned!');
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        toast.error('Unable to retrieve your location. Please check browser permissions.');
      }
    );
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return toast.error('Please enter a valid phone number');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      toast.success(`OTP Sent! (Dev: ${data.devOtp})`);
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name, address })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.needsSignupDetails) {
          setNeedsSignupDetails(true);
          return toast('Looks like you are new! Please fill in your name to continue.', { icon: '👋' });
        }
        throw new Error(data.message || 'Verification failed');
      }

      login(data); // Save user to context & local storage
      toast.success(data.isNewUser ? 'Welcome to Niraa!' : 'Welcome back!');
      handleClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div className="card" style={modalStyle}>
        <button onClick={handleClose} style={closeBtnStyle}>✕</button>
        <h2 style={{ marginBottom: 15, color: 'var(--teal-dark)' }}>
          {step === 1 ? 'Login / Sign Up' : 'Verify OTP'}
        </h2>
        
        {step === 1 && (
          <form onSubmit={requestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: 5 }}>
              Enter your phone number to proceed. We will send you a 4-digit OTP.
            </p>
            <input 
              type="tel" 
              className="field" 
              placeholder="Enter Phone Number" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              required
            />
            <button type="submit" className="btn btn--primary">Get OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
              OTP sent to {phone}. <span style={{ color: 'var(--teal-base)', cursor: 'pointer' }} onClick={() => setStep(1)}>Change</span>
            </p>
            <input 
              type="text" 
              className="field" 
              placeholder="Enter 4-digit OTP" 
              value={otp} 
              onChange={e => setOtp(e.target.value)} 
              required
            />

            {needsSignupDetails && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10, padding: 12, background: 'var(--gray-100)', borderRadius: 8 }}>
                <h4 style={{ margin: 0, color: 'var(--teal-dark)' }}>Complete your profile</h4>
                <input 
                  type="text" 
                  className="field" 
                  placeholder="Full Name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                />
                
                <div style={{ marginTop: 5 }}>
                  <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', fontWeight: 600 }}>Delivery Location</label>
                  <button type="button" className="btn btn--ghost" onClick={handleGetLocation} disabled={locating} style={{ width: '100%', marginBottom: 10 }}>
                     📍 {locating ? 'Locating...' : 'Use Current Location'}
                  </button>
                  <input type="text" className="field" placeholder="Street Address" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                </div>
              </div>
            )}
            
            <button type="submit" className="btn btn--primary" style={{ marginTop: 10 }}>
              Verify & Proceed
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20
};

const modalStyle = {
  width: '100%',
  maxWidth: 400,
  padding: 24,
  position: 'relative',
  backgroundColor: '#fff',
  borderRadius: 16
};

const closeBtnStyle = {
  position: 'absolute',
  top: 15, right: 15,
  background: 'transparent',
  border: 'none',
  fontSize: '1.2rem',
  cursor: 'pointer',
  color: 'var(--gray-500)'
};
