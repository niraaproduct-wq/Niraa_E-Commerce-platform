import React from 'react';

export default function Button({
  children, onClick, type = 'button',
  variant = 'primary', size = 'md',
  disabled = false, fullWidth = false,
  style = {},
}) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontFamily: 'var(--font-body)', fontWeight: 600,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--radius-full)',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
  };
  const sizes = {
    sm: { padding: '8px 18px', fontSize: '0.82rem' },
    md: { padding: '12px 28px', fontSize: '0.92rem' },
    lg: { padding: '15px 36px', fontSize: '1rem' },
  };
  const variants = {
    primary:   { background: 'var(--teal)',      color: '#fff' },
    secondary: { background: 'var(--cream)',      color: 'var(--teal-dark)', border: '1.5px solid var(--teal)' },
    gold:      { background: 'var(--gold)',       color: '#fff' },
    danger:    { background: 'var(--red)',        color: '#fff' },
    ghost:     { background: 'transparent',       color: 'var(--teal)', border: '1.5px solid var(--teal)' },
    whatsapp:  { background: '#25D366',           color: '#fff' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
    >
      {children}
    </button>
  );
}