import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { API_BASE_URL } from '../../utils/constants.js';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) return alert(data.message || 'Login failed');
        // store user with token
        login(data.user, data.token);
        navigate('/admin');
      } catch (err) {
        alert('Login error');
      }
    })();
  };

  return (
    <div className="admin-login container" style={{ padding: 18 }}>
      <h2>Admin Login</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" style={{ background: 'var(--teal)', color: '#fff', padding: '8px 12px', borderRadius: 8 }}>Login</button>
      </form>
    </div>
  );
}
