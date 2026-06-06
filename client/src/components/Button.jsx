import React, { useRef } from 'react';

export default function Button({
  children, onClick, type = 'button',
  variant = 'primary', size = 'md',
  disabled = false, fullWidth = false,
  style = {},
}) {
  const ref = useRef(null);

  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontFamily: 'var(--font-body)', fontWeight: 600,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--radius-full)',
    transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, filter 0.18s ease, opacity 0.18s ease',
    opacity: disabled ? 0.55 : 1,
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    overflow: 'hidden',
    letterSpacing: '0.01em',
  };

  const sizes = {
    sm: { padding: '8px 18px', fontSize: '0.82rem' },
    md: { padding: '12px 28px', fontSize: '0.92rem' },
    lg: { padding: '15px 36px', fontSize: '1rem' },
  };

  const variants = {
    primary: { background: 'var(--teal)', color: '#fff', boxShadow: '0 4px 14px rgba(42,125,114,0.35)' },
    secondary: { background: 'var(--cream)', color: 'var(--teal-dark)', border: '1.5px solid var(--teal)' },
    gold: { background: 'var(--gold)', color: '#fff', boxShadow: '0 4px 14px rgba(200,168,75,0.35)' },
    danger: { background: 'var(--red)', color: '#fff', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' },
    ghost: { background: 'transparent', color: 'var(--teal)', border: '1.5px solid var(--teal)' },
    whatsapp: { background: '#25D366', color: '#fff', boxShadow: '0 4px 14px rgba(37,211,102,0.35)' },
  };

  // Ripple effect on click
  const handleClick = (e) => {
    if (disabled) return;
    const btn = ref.current;
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const rect = btn.getBoundingClientRect();
    circle.style.cssText = `
      position:absolute; border-radius:50%; background:rgba(255,255,255,0.35);
      width:${diameter}px; height:${diameter}px;
      left:${e.clientX - rect.left - diameter / 2}px;
      top:${e.clientY - rect.top - diameter / 2}px;
      transform:scale(0); animation:btnRipple 0.5s linear;
      pointer-events:none;
    `;
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 500);
    onClick?.(e);
  };

  return (
    <>
      <style>{`
        @keyframes btnRipple { to { transform:scale(2.5); opacity:0; } }
      `}</style>
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        disabled={disabled}
        style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
        onMouseEnter={e => {
          if (disabled) return;
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.filter = 'brightness(1.08)';
          e.currentTarget.style.boxShadow = variants[variant].boxShadow
            ? variants[variant].boxShadow.replace(/[\d.]+\)$/, s => (parseFloat(s) + 0.15) + ')')
            : '0 6px 20px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.filter = 'brightness(1)';
          e.currentTarget.style.boxShadow = variants[variant].boxShadow || 'none';
        }}
        onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(0) scale(0.97)'; }}
        onMouseUp={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
      >
        {children}
      </button>
    </>
  );
}