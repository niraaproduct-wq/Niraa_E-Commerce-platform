import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Loyalty = () => {
  const [points, setPoints] = useState(120);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://niraa.in/ref/rajesh12');
    toast.success('Referral link copied!');
  };

  return (
    <main className="container page" style={{ paddingTop: 18 }}>
      <header className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-header__badge">Growth System</div>
        <div className="page-title">Loyalty & Rewards</div>
        <div className="page-subtitle">Earn points on every clean home. Refer friends to get ₹50 off.</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <style>{`
          .loyalty-grid { display: grid; gap: 20px; }
          @media (min-width: 768px) { .loyalty-grid { grid-template-columns: 1fr 1fr; } }
        `}</style>
        
        <div className="loyalty-grid">
          {/* Points Section */}
          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 20, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#fdf6e3', padding: 12, borderRadius: '50%', color: 'var(--gold)', fontSize: '1.5rem' }}>🏆</div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--gray-800)' }}>Your Niraa Points</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal-dark)', lineHeight: 1.1 }}>{points}</div>
              </div>
            </div>
            
            <div style={{ marginTop: 20, height: 6, background: 'var(--gray-200)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: 'var(--teal)' }} />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 8 }}>
              80 points away from your next Free Refill Pack!
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn btn--primary" style={{ width: '100%', padding: '10px' }} onClick={() => toast.success('Discount code generated!')}>Redeem Points</button>
            </div>
          </div>

          {/* Referral Section */}
          <div style={{ background: 'var(--teal-dark)', border: '1px solid var(--teal-dark)', borderRadius: 20, padding: 24, color: '#fff' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>Refer a friend, Get ₹50</div>
            <div style={{ fontSize: '0.9rem', color: '#c5e8e5', marginTop: 6 }}>
              Share Niraa with your neighbors in Dharmapuri. When they place their first order, you both get ₹50 off!
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 14, borderRadius: 12, marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}>niraa.in/ref/rajesh12</div>
              <button 
                onClick={handleCopyLink}
                style={{ background: 'var(--gold)', border: 'none', padding: '6px 12px', borderRadius: 8, color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                Copy
              </button>
            </div>
            
            <div style={{ marginTop: 16 }}>
              <a href={`https://wa.me/?text=${encodeURIComponent('Hey! I use Niraa Eco-Friendly cleaners for my home. Use my link to get ₹50 off your first combo pack: https://niraa.in/ref/rajesh12')}`} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', background: '#25D366', color: '#fff', padding: '10px', borderRadius: 10, textDecoration: 'none', fontWeight: 900 }}>
                Share on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 20, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--teal-dark)', marginTop: 0 }}>Recent Rewards Activity</h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginTop: 14 }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <div>
                <div style={{ fontWeight: 700 }}>Earned from Purchase</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Order #1024 (Combo Pack)</div>
              </div>
              <div style={{ fontWeight: 900, color: 'var(--green)' }}>+50 pts</div>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <div>
                <div style={{ fontWeight: 700 }}>Referral Bonus (Karthik)</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Karthik completed first order</div>
              </div>
              <div style={{ fontWeight: 900, color: 'var(--green)' }}>+50 pts</div>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <div>
                <div style={{ fontWeight: 700 }}>Earned from Purchase</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Order #0981</div>
              </div>
              <div style={{ fontWeight: 900, color: 'var(--green)' }}>+20 pts</div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default Loyalty;
