import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const T = {
  teal: '#1D9E75', tealDark: '#0F6E56', tealLight: '#E8F8F1', tealDeep: '#072E22',
  gold: '#C8A84B', goldLight: '#FDF6E3', goldDark: '#9A6A00',
  wa: '#25D366',
  gray50: '#F9F9F8', gray100: '#F2F1EF', gray200: '#E5E3DE',
  gray400: '#A8A59D', gray500: '#87847C', gray600: '#6B6862',
  gray700: '#4A4845', gray800: '#2E2D2A', gray900: '#1A1917', white: '#FFFFFF',
  green: '#16a34a', greenLight: '#DCFCE7',
  font: `'DM Sans', system-ui, sans-serif`,
  fontDisplay: `'Fraunces', Georgia, serif`,
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  .loyalty-page * { box-sizing: border-box; }

  .loyalty-top { display: grid; gap: 16px; }
  @media (min-width: 768px) { .loyalty-top { grid-template-columns: 1fr 1fr; } }

  .progress-bar {
    height: 10px; background: ${T.gray100}; border-radius: 999; overflow: hidden;
  }
  .progress-fill {
    height: 100%; border-radius: 999;
    background: linear-gradient(90deg, ${T.teal}, ${T.tealDark});
    transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .earn-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 14px; border-radius: 10px;
    background: rgba(29,158,117,0.08);
    margin-bottom: 8px;
  }

  .reward-tier {
    border-radius: 16px; padding: 16px;
    border: 1.5px solid transparent;
    transition: all 0.2s;
    cursor: default;
  }
  .reward-tier.active {
    border-color: ${T.gold};
    background: ${T.goldLight};
    box-shadow: 0 4px 16px rgba(200,168,75,0.2);
  }

  .ref-link-box {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 14px; padding: 16px;
    margin-bottom: 12px;
  }

  .activity-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 0;
  }
  .activity-item + .activity-item { border-top: 1px solid ${T.gray100}; }

  .redeem-btn {
    width: 100%; padding: 14px; border: none; border-radius: 12px;
    font-weight: 800; font-size: 14px; cursor: pointer;
    font-family: ${T.font}; transition: all 0.2s;
    background: ${T.teal}; color: #fff;
    box-shadow: 0 4px 16px rgba(29,158,117,0.3);
  }
  .redeem-btn:hover { background: ${T.tealDark}; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(29,158,117,0.4); }

  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .count-animate { animation: countUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

  .badge-shine {
    position: relative; overflow: hidden;
  }
  .badge-shine::after {
    content: ''; position: absolute; top: -50%; left: -60%;
    width: 30%; height: 200%; background: rgba(255,255,255,0.15);
    transform: skewX(-20deg);
    animation: shine 4s ease infinite;
  }
  @keyframes shine {
    0% { left: -60%; }
    30%, 100% { left: 120%; }
  }
`;

const POINTS = 120;
const GOAL = 200;
const pct = Math.round((POINTS / GOAL) * 100);

const TIERS = [
  { name: 'Starter', icon: '🌱', min: 0, max: 100, color: '#64748b', benefit: 'Free Shipping' },
  { name: 'Green', icon: '🌿', min: 100, max: 300, color: T.teal, benefit: '5% off all orders' },
  { name: 'Gold', icon: '⭐', min: 300, max: 600, color: T.gold, benefit: '10% off + priority' },
  { name: 'Platinum', icon: '💎', min: 600, max: Infinity, color: '#7c3aed', benefit: '15% off + gifts' },
];

const ACTIVITIES = [
  { label: 'Earned from Purchase', sub: 'Order #1024 (Combo Pack)', pts: '+50', positive: true, date: '24 Apr' },
  { label: 'Referral Bonus (Karthik)', sub: 'Karthik completed first order', pts: '+50', positive: true, date: '18 Apr' },
  { label: 'Earned from Purchase', sub: 'Order #0981', pts: '+20', positive: true, date: '10 Apr' },
];

const currentTier = TIERS.find(t => POINTS >= t.min && POINTS < t.max) || TIERS[0];
const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];

const Loyalty = () => {
  const [points] = useState(POINTS);
  const [animatePct, setAnimatePct] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatePct(pct), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://niraa.in/ref/rajesh12');
    toast.success('🔗 Referral link copied!');
  };

  return (
    <main className="loyalty-page" style={{ background: T.gray50, minHeight: '100vh', fontFamily: T.font }}>
      <style>{css}</style>
      <div className="container" style={{ padding: '32px 16px 80px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ─── Page Header ─── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.gold }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.gold }}>Rewards Program</span>
          </div>
          <h1 style={{ margin: '0 0 8px', fontFamily: T.fontDisplay, fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 900, color: T.gray900, letterSpacing: '-.03em' }}>
            Loyalty & Rewards
          </h1>
          <p style={{ margin: 0, color: T.gray400, fontSize: 15, lineHeight: 1.6 }}>
            Earn points on every order. Refer friends. Get free products. 🎁
          </p>
        </div>

        <div className="loyalty-top" style={{ marginBottom: 16 }}>

          {/* ─── Points Card ─── */}
          <div style={{ background: T.white, border: `1.5px solid ${T.gray200}`, borderRadius: 24, padding: 28, boxShadow: T.shadow }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: T.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🏆</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: T.gray400, marginBottom: 4 }}>NIRAA Points</div>
                <div className="count-animate" style={{ fontFamily: T.fontDisplay, fontSize: 40, fontWeight: 900, color: T.tealDark, lineHeight: 1 }}>{points}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div className="badge-shine" style={{ background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}dd)`, color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 800 }}>
                  {currentTier.icon} {currentTier.name}
                </div>
              </div>
            </div>

            {/* Progress */}
            {nextTier && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.gray500, marginBottom: 8, fontWeight: 600 }}>
                  <span>{points} pts</span>
                  <span>Next: {nextTier.name} at {nextTier.min} pts</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${animatePct}%` }} />
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: T.gray500, fontWeight: 600 }}>
                  {nextTier.min - points} points to unlock{' '}
                  <span style={{ color: T.tealDark, fontWeight: 800 }}>{nextTier.benefit}</span>
                </div>
              </div>
            )}

            {/* Redeem */}
            <button className="redeem-btn" onClick={() => toast.success('🎉 Discount code NIRAA50 generated! Use at checkout.')}>
              🎁 Redeem Points for Discount
            </button>

            {/* How to earn */}
            <div style={{ marginTop: 20, padding: '16px', background: T.tealLight, borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: T.tealDark, marginBottom: 12 }}>How to Earn Points</div>
              {[
                ['🛒', 'Every purchase', '1 pt per ₹2 spent'],
                ['👥', 'Refer a friend', '50 pts when they order'],
                ['⭐', 'Leave a review', '10 pts per review'],
                ['📅', 'Monthly shopper', '20 bonus pts'],
              ].map(([icon, label, val]) => (
                <div key={label} className="earn-item">
                  <span style={{ fontSize: 13, color: T.tealDark, fontWeight: 600 }}>{icon} {label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.tealDark }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Referral Card ─── */}
          <div style={{ background: `linear-gradient(145deg, ${T.tealDeep}, #124d44)`, borderRadius: 24, padding: 28, color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#4ade80', marginBottom: 10 }}>Referral Program</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(1.4rem,3vw,1.8rem)', fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>
              Refer a Friend,<br />Both Get ₹50 Off 🎉
            </div>
            <div style={{ fontSize: 13, color: '#aadecd', marginBottom: 24, lineHeight: 1.7 }}>
              Share NIRAA with your neighbours in Dharmapuri. When they place their first order, you both get ₹50 off!
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[['3', 'Friends', 'Referred'], ['₹150', 'Total', 'Earned'], ['2', 'Pending', 'Rewards']].map(([val, l1, l2]) => (
                <div key={l1} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#4ade80', marginBottom: 2 }}>{val}</div>
                  <div style={{ fontSize: 10, color: '#aadecd', fontWeight: 600, lineHeight: 1.3 }}>{l1}<br />{l2}</div>
                </div>
              ))}
            </div>

            {/* Ref link */}
            <div className="ref-link-box">
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#aadecd', marginBottom: 8 }}>Your Referral Link</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <code style={{ fontSize: 13, fontWeight: 700, color: '#e6fff7', letterSpacing: '.5px' }}>niraa.in/ref/rajesh12</code>
                <button onClick={handleCopyLink} style={{ padding: '8px 14px', background: T.gold, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: 'pointer', flexShrink: 0, fontFamily: T.font, transition: 'all 0.2s' }}>
                  Copy 📋
                </button>
              </div>
            </div>

            <a
              href={`https://wa.me/?text=${encodeURIComponent('Hey! I use Niraa Eco-Friendly cleaners for my home. Use my link to get ₹50 off your first combo pack: https://niraa.in/ref/rajesh12')}`}
              target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: '#25D366', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 14, boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              Share via WhatsApp
            </a>
          </div>
        </div>

        {/* ─── Reward Tiers ─── */}
        <div style={{ background: T.white, border: `1.5px solid ${T.gray200}`, borderRadius: 20, padding: 24, boxShadow: T.shadow, marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: T.gray900, marginBottom: 4 }}>Reward Tiers</div>
          <div style={{ fontSize: 13, color: T.gray400, marginBottom: 20 }}>You're on the <strong style={{ color: currentTier.color }}>{currentTier.name}</strong> tier. Keep earning to unlock more!</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
            {TIERS.map(tier => (
              <div key={tier.name} className={`reward-tier ${tier.name === currentTier.name ? 'active' : ''}`}
                style={{ background: tier.name === currentTier.name ? T.goldLight : T.gray50 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{tier.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: tier.name === currentTier.name ? T.goldDark : T.gray700, marginBottom: 4 }}>{tier.name}</div>
                <div style={{ fontSize: 11, color: T.gray400, fontWeight: 600, marginBottom: 6 }}>{tier.min}{tier.max === Infinity ? '+ pts' : `–${tier.max} pts`}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: tier.name === currentTier.name ? T.goldDark : T.tealDark }}>✓ {tier.benefit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Activity ─── */}
        <div style={{ background: T.white, border: `1.5px solid ${T.gray200}`, borderRadius: 20, padding: 24, boxShadow: T.shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: T.gray900 }}>Rewards Activity</div>
              <div style={{ fontSize: 12, color: T.gray400, marginTop: 2 }}>Your recent points history</div>
            </div>
            <Link to="/products" style={{ fontSize: 13, color: T.teal, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Earn more →
            </Link>
          </div>
          <div>
            {ACTIVITIES.map((a, i) => (
              <div key={i} className="activity-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📈</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.gray900 }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: T.gray400, marginTop: 2 }}>{a.sub}</div>
                    <div style={{ fontSize: 11, color: T.gray300, marginTop: 2, fontWeight: 600 }}>{a.date}</div>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: T.green, flexShrink: 0 }}>{a.pts} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Loyalty;