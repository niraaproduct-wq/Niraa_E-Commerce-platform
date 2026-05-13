import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAdmin } from '../context/AdminContext';
import { FaEdit, FaEye, FaPlus, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

/* ─── Ripple Hook ──────────────────────────────────────────────────── */
const useRipple = () => {
  const [ripples, setRipples] = useState([]);
  const trigger = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
  }, []);
  return { ripples, trigger };
};

/* ─── Ripple Button ────────────────────────────────────────────────── */
const RippleButton = ({ onClick, className, style, children, variant = 'ghost', disabled }) => {
  const { ripples, trigger } = useRipple();
  const handleClick = useCallback(
    (e) => {
      trigger(e);
      onClick && onClick(e);
    },
    [trigger, onClick]
  );

  return (
    <button
      className={`atb-btn atb-btn--${variant} ${className || ''}`}
      style={style}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
      {ripples.map(({ id, x, y }) => (
        <span
          key={id}
          className="atb-ripple"
          style={{ left: x, top: y }}
        />
      ))}
    </button>
  );
};

/* ─── Tooltip ──────────────────────────────────────────────────────── */
const Tooltip = ({ label, children }) => (
  <div className="atb-tooltip-wrap">
    {children}
    <span className="atb-tooltip">{label}</span>
  </div>
);

/* ─── Main Component ───────────────────────────────────────────────── */
const AdminToolbar = () => {
  const {
    isAdminMode,
    isEditing,
    editingItem,
    isAdmin,
    toggleAdminMode,
    stopEditing,
    saveChanges,
    addItem,
  } = useAdmin();

  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSave = async () => {
    if (!editingItem || saving) return;
    setSaving(true);
    try {
      const success = await saveChanges(editingItem);
      if (success) toast.success('Changes saved!');
      else toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return null;

  /* Derived state for toolbar phase */
  const phase = !isAdminMode ? 'view' : isEditing ? 'editing' : 'admin';

  return (
    <>
      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        /* ── Variables ── */
        :root {
          --atb-gold:        #c8a84b;
          --atb-gold-light:  #e8c96a;
          --atb-gold-dim:    #8a7033;
          --atb-green:       #22c55e;
          --atb-red:         #ef4444;
          --atb-ink:         #080f0e;
          --atb-surface:     rgba(10, 20, 18, 0.85);
          --atb-border:      rgba(200, 168, 75, 0.25);
          --atb-border-edit: rgba(34, 197, 94, 0.4);
          --atb-text:        #f0ece0;
          --atb-sub:         rgba(240, 236, 224, 0.55);
          --atb-font-head:   'Syne', sans-serif;
          --atb-font-body:   'DM Sans', sans-serif;
        }

        /* ── Toolbar Shell ── */
        .atb-shell {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%) translateY(${mounted ? '0' : '80px'});
          opacity: ${mounted ? 1 : 0};
          z-index: 9999;
          transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
                      opacity 0.4s ease;
          font-family: var(--atb-font-body);
          filter: drop-shadow(0 16px 48px rgba(0,0,0,0.55));
        }

        /* ── Inner Pill ── */
        .atb-pill {
          display: flex;
          align-items: center;
          gap: 0;
          background: var(--atb-surface);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1.5px solid ${phase === 'editing' ? 'var(--atb-border-edit)' : 'var(--atb-border)'};
          border-radius: 9999px;
          padding: 7px 8px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            ${phase === 'editing'
          ? '0 0 28px rgba(34,197,94,0.18)'
          : '0 0 28px rgba(200,168,75,0.12)'};
        }

        /* ── Noise texture overlay ── */
        .atb-pill::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
          border-radius: inherit;
        }

        /* ── Animated shimmer line at top of pill ── */
        .atb-pill::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--atb-gold), transparent);
          animation: atb-shimmer 3.5s ease-in-out infinite;
        }
        @keyframes atb-shimmer {
          0%   { left: -60%; opacity: 0; }
          30%  { opacity: 1; }
          100% { left: 160%; opacity: 0; }
        }

        /* ── Status Badge ── */
        .atb-status {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 14px 0 10px;
          min-width: 0;
        }
        .atb-dot-wrap {
          position: relative;
          width: 10px; height: 10px;
          flex-shrink: 0;
        }
        .atb-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: ${phase === 'editing' ? 'var(--atb-green)' : phase === 'admin' ? 'var(--atb-gold)' : '#fbbf24'};
          position: relative;
          z-index: 1;
          transition: background 0.35s ease;
        }
        .atb-dot-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: ${phase === 'editing' ? 'var(--atb-green)' : phase === 'admin' ? 'var(--atb-gold)' : '#fbbf24'};
          opacity: 0;
          animation: atb-ping 2s ease-out infinite;
          transition: background 0.35s ease;
        }
        @keyframes atb-ping {
          0%   { transform: scale(0.8); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .atb-label {
          font-family: var(--atb-font-head);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--atb-text);
          white-space: nowrap;
          text-transform: uppercase;
        }
        .atb-sublabel {
          font-size: 0.62rem;
          color: var(--atb-sub);
          letter-spacing: 0.06em;
          margin-top: 1px;
          white-space: nowrap;
          text-transform: uppercase;
        }

        /* ── Divider ── */
        .atb-div {
          width: 1px;
          height: 28px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent);
          margin: 0 4px;
          flex-shrink: 0;
        }

        /* ── Buttons ── */
        .atb-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          padding: 9px 18px;
          font-family: var(--atb-font-head);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #fff;
          transition:
            transform 0.18s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow 0.25s ease,
            opacity 0.2s ease,
            background 0.25s ease;
          white-space: nowrap;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .atb-btn:active { transform: scale(0.94); }
        .atb-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .atb-btn:hover:not(:disabled) { transform: scale(1.05); }

        .atb-btn--ghost {
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.1) inset;
        }
        .atb-btn--ghost:hover:not(:disabled) {
          background: rgba(255,255,255,0.14);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.18) inset,
                      0 4px 16px rgba(0,0,0,0.25);
        }

        .atb-btn--primary {
          background: linear-gradient(135deg, var(--atb-gold) 0%, #a87d28 100%);
          box-shadow: 0 4px 16px rgba(200,168,75,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset;
          color: #0d1210;
        }
        .atb-btn--primary:hover:not(:disabled) {
          box-shadow: 0 6px 24px rgba(200,168,75,0.5), 0 0 0 1px rgba(255,255,255,0.15) inset;
        }

        .atb-btn--danger {
          background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);
          box-shadow: 0 4px 16px rgba(239,68,68,0.35);
        }
        .atb-btn--danger:hover:not(:disabled) {
          box-shadow: 0 6px 24px rgba(239,68,68,0.5);
        }

        .atb-btn--success {
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          box-shadow: 0 4px 16px rgba(34,197,94,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset;
        }
        .atb-btn--success:hover:not(:disabled) {
          box-shadow: 0 6px 24px rgba(34,197,94,0.5);
        }

        .atb-btn--add {
          background: linear-gradient(135deg, rgba(200,168,75,0.18) 0%, rgba(200,168,75,0.08) 100%);
          box-shadow: 0 0 0 1.5px var(--atb-border) inset;
          color: var(--atb-gold-light);
        }
        .atb-btn--add:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(200,168,75,0.3) 0%, rgba(200,168,75,0.14) 100%);
          box-shadow: 0 0 0 1.5px rgba(200,168,75,0.5) inset, 0 4px 20px rgba(200,168,75,0.2);
        }

        /* Ripple effect */
        .atb-ripple {
          position: absolute;
          border-radius: 50%;
          width: 6px; height: 6px;
          margin-left: -3px; margin-top: -3px;
          background: rgba(255,255,255,0.45);
          transform: scale(0);
          animation: atb-ripple-anim 0.6s linear;
          pointer-events: none;
        }
        @keyframes atb-ripple-anim {
          to { transform: scale(40); opacity: 0; }
        }

        /* Icon spin on save loading */
        .atb-spin { animation: atb-spin 0.8s linear infinite; }
        @keyframes atb-spin { to { transform: rotate(360deg); } }

        /* ── Tooltip ── */
        .atb-tooltip-wrap {
          position: relative;
          display: inline-flex;
        }
        .atb-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          background: rgba(10,20,18,0.95);
          border: 1px solid var(--atb-border);
          color: var(--atb-text);
          font-family: var(--atb-font-body);
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          padding: 5px 10px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        .atb-tooltip-wrap:hover .atb-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* ── Editing mode glow border animation ── */
        @keyframes atb-border-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.15); }
          50%       { box-shadow: 0 0 36px rgba(34,197,94,0.3); }
        }
        .atb-pill--editing {
          animation: atb-border-glow 2.5s ease-in-out infinite;
        }

        /* ── Slide-in for action groups ── */
        .atb-actions-enter {
          animation: atb-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes atb-slide-in {
          from { opacity: 0; transform: translateX(16px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }

        /* ── Saving pulse on button ── */
        @keyframes atb-save-pulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(34,197,94,0.35); }
          50%       { box-shadow: 0 4px 32px rgba(34,197,94,0.7); }
        }
        .atb-btn--saving {
          animation: atb-save-pulse 0.8s ease-in-out infinite;
        }
      `}</style>

      {/* ── Toolbar DOM ── */}
      <div className="atb-shell" role="toolbar" aria-label="Admin Toolbar">
        <div className={`atb-pill${phase === 'editing' ? ' atb-pill--editing' : ''}`}>

          {/* Status Badge */}
          <div className="atb-status">
            <div className="atb-dot-wrap">
              <div className="atb-dot-ring" />
              <div className="atb-dot" />
            </div>
            <div>
              <div className="atb-label">
                {phase === 'editing' ? 'Editing' : phase === 'admin' ? 'Admin Mode' : 'View Mode'}
              </div>
              <div className="atb-sublabel">
                {phase === 'editing'
                  ? 'unsaved changes'
                  : phase === 'admin'
                    ? 'live editing on'
                    : 'read only'}
              </div>
            </div>
          </div>

          <div className="atb-div" />

          {/* Toggle Admin / View */}
          <Tooltip label={isAdminMode ? 'Return to public view' : 'Enter admin editing mode'}>
            <RippleButton
              variant={isAdminMode ? 'ghost' : 'primary'}
              onClick={toggleAdminMode}
            >
              {isAdminMode ? (
                <><FaEye size={13} /> Exit Admin</>
              ) : (
                <><FaEdit size={13} /> Edit Site</>
              )}
            </RippleButton>
          </Tooltip>

          {/* Editing Controls */}
          {isAdminMode && isEditing && (
            <div className="atb-actions-enter" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div className="atb-div" style={{ marginLeft: 8 }} />

              <div style={{ display: 'flex', gap: 6, marginLeft: 4 }}>
                <Tooltip label="Discard changes">
                  <RippleButton variant="danger" onClick={stopEditing}>
                    <FaTimes size={12} /> Cancel
                  </RippleButton>
                </Tooltip>

                <Tooltip label="Persist changes to database">
                  <RippleButton
                    variant="success"
                    onClick={handleSave}
                    disabled={saving}
                    className={saving ? 'atb-btn--saving' : ''}
                  >
                    {saving ? (
                      <>
                        <svg
                          width="13" height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          className="atb-spin"
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Saving…
                      </>
                    ) : (
                      <><FaSave size={12} /> Save Changes</>
                    )}
                  </RippleButton>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Add New — only in admin idle state */}
          {isAdminMode && !isEditing && (
            <div className="atb-actions-enter" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div className="atb-div" style={{ marginLeft: 8 }} />
              <div style={{ marginLeft: 4 }}>
                <Tooltip label="Open page builder">
                  <RippleButton
                    variant="add"
                    onClick={() => { window.location.href = '/builder'; }}
                  >
                    <FaPlus size={12} /> Add New
                  </RippleButton>
                </Tooltip>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AdminToolbar;