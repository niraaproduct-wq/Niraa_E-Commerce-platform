import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/constants';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [needsSignupDetails, setNeedsSignupDetails] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState({ street: '', city: 'Dharmapuri', pincode: '', lat: null, lng: null });
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setMounted(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setMounted(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    setMounted(false);
    setTimeout(() => {
      setStep(1); setPhone(''); setOtp(''); setNeedsSignupDetails(false);
      onClose();
    }, 260);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`${API_BASE_URL}/locations/reverse`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude }),
          });
          const data = await res.json();
          if (data?.address) {
            setAddress({ street: data.address.street || '', city: data.address.city || 'Dharmapuri', pincode: data.address.zipCode || '', lat: latitude, lng: longitude });
            toast.success('Location detected!');
          }
        } catch { toast.error('Location service busy. Please enter manually.'); }
        finally { setLocating(false); }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) toast.error('Permission denied.');
        else if (err.code === 3) toast.error('Request timed out.');
        else toast.error('Unable to retrieve location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return toast.error('Enter a valid phone number');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      toast.success('OTP Sent!');
      if (data.devOtp && import.meta.env.DEV) toast.success(`Dev OTP: ${data.devOtp}`);
      setStep(2);
    } catch (err) { toast.error(err.message); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name, address }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsSignupDetails) {
          setNeedsSignupDetails(true);
          return toast('Looks like you\'re new! Please fill in your name.', { icon: '👋' });
        }
        throw new Error(data.message || 'Verification failed');
      }
      login(data.user, data.token);
      toast.success(data.isNewUser ? 'Welcome to Niraa!' : 'Welcome back!');
      handleClose();
    } catch (err) { toast.error(err.message); }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes lmOverlayIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lmOverlayOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes lmModalIn    { from { opacity: 0; transform: scale(0.93) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes lmModalOut   { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.93) translateY(20px); } }
        @keyframes lmStepIn     { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .lm-field {
          width: 100%; border: 1.5px solid var(--gray-200); border-radius: 10px;
          padding: 11px 14px; font-size: 0.95rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          outline: none; box-sizing: border-box;
        }
        .lm-field:focus {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(42,125,114,0.15);
        }
        .lm-btn-primary {
          background: var(--teal); color: #fff; border: none;
          border-radius: 10px; padding: 12px; width: 100%;
          font-weight: 700; font-size: 0.95rem; cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
                      filter 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 6px 18px rgba(42,125,114,0.3);
        }
        .lm-btn-primary:hover {
          transform: translateY(-2px); filter: brightness(1.08);
          box-shadow: 0 10px 26px rgba(42,125,114,0.4);
        }
        .lm-btn-primary:active { transform: scale(0.97); }
        .lm-btn-ghost {
          background: transparent; border: 1.5px solid var(--teal);
          color: var(--teal); border-radius: 10px; padding: 10px; width: 100%;
          font-weight: 600; cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .lm-btn-ghost:hover { background: rgba(42,125,114,0.07); transform: translateY(-1px); }
        .lm-close {
          position: absolute; top: 14px; right: 14px;
          background: var(--gray-100); border: none; border-radius: 50%;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          font-size: 1rem; cursor: pointer; color: var(--gray-500);
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .lm-close:hover { background: var(--gray-200); transform: rotate(90deg) scale(1.1); }
      `}</style>

      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
          backdropFilter: 'blur(3px)',
          animation: `${mounted ? 'lmOverlayIn' : 'lmOverlayOut'} 0.25s ease forwards`,
        }}
      >
        {/* Modal */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 400, padding: 28,
            position: 'relative', backgroundColor: '#fff', borderRadius: 20,
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            animation: `${mounted ? 'lmModalIn' : 'lmModalOut'} 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards`,
          }}
        >
          <button onClick={handleClose} className="lm-close">✕</button>

          <h2 style={{ marginBottom: 6, color: 'var(--teal-dark)', fontSize: '1.3rem', fontWeight: 800 }}>
            {step === 1 ? 'Login / Sign Up' : 'Verify OTP'}
          </h2>
          <div style={{ width: 36, height: 3, background: 'var(--teal)', borderRadius: 2, marginBottom: 20 }} />

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={requestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'lmStepIn 0.25s ease' }}>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', margin: 0 }}>
                Enter your phone number. We'll send a 4-digit OTP.
              </p>
              <input type="tel" className="lm-field" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
              <button type="submit" className="lm-btn-primary">Get OTP →</button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={verifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'lmStepIn 0.25s ease' }}>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', margin: 0 }}>
                OTP sent to {phone}.{' '}
                <span style={{ color: 'var(--teal)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setStep(1)}>Change</span>
              </p>
              <input
                type="text" className="lm-field" placeholder="4-digit OTP"
                inputMode="numeric" maxLength={4}
                value={otp} onChange={e => setOtp(e.target.value)} required
              />

              {needsSignupDetails && (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 12,
                  padding: 14, background: 'var(--gray-50)',
                  borderRadius: 12, border: '1px solid var(--gray-200)',
                  animation: 'lmStepIn 0.2s ease',
                }}>
                  <h4 style={{ margin: 0, color: 'var(--teal-dark)', fontSize: '0.95rem' }}>Complete your profile</h4>
                  <input type="text" className="lm-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--gray-700)' }}>Delivery Location</label>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>Accuracy varies on laptops</span>
                    </div>
                    <button type="button" className="lm-btn-ghost" onClick={handleGetLocation} disabled={locating} style={{ marginBottom: 10 }}>
                      📍 {locating ? 'Locating…' : 'Use Current Location'}
                    </button>
                    <input type="text" className="lm-field" placeholder="Street Address" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} />
                  </div>
                </div>
              )}

              <button type="submit" className="lm-btn-primary" style={{ marginTop: 4 }}>
                Verify & Proceed →
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}