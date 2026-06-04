import React from 'react';

export default function Loader({ size = 50, text = 'Loading...' }) {
  return (
    <>
      <style>{`
        @keyframes loaderSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes loaderPulse {
          0%, 100% { opacity: 0.6; transform: scale(0.98); }
          50%       { opacity: 1;   transform: scale(1.02); }
        }
        @keyframes loaderDots {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40%           { transform: scale(1.1);   opacity: 1; }
        }
        .niraa-premium-spinner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .niraa-spinner-outer {
          position: absolute;
          border: 3px solid rgba(26,122,110,0.1);
          border-top-color: #1a7a6e;
          border-bottom-color: #1a7a6e;
          border-radius: 50%;
          animation: loaderSpin 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
        }
        .niraa-spinner-inner {
          position: absolute;
          border: 2px solid transparent;
          border-left-color: #c8a84b;
          border-right-color: #c8a84b;
          border-radius: 50%;
          animation: loaderSpin 0.8s linear infinite reverse;
        }
        .loader-dot {
          display: inline-block;
          border-radius: 50%;
          background: #c8a84b;
          width: 5px;
          height: 5px;
          margin: 0 4px;
        }
        .loader-dot:nth-child(1) { animation: loaderDots 1.2s 0s infinite ease-in-out; }
        .loader-dot:nth-child(2) { animation: loaderDots 1.2s 0.25s infinite ease-in-out; }
        .loader-dot:nth-child(3) { animation: loaderDots 1.2s 0.5s infinite ease-in-out; }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '50px 20px', gap: 24,
      }}>
        <div className="niraa-premium-spinner" style={{ width: size, height: size }}>
          <div className="niraa-spinner-outer" style={{ width: size, height: size }} />
          <div className="niraa-spinner-inner" style={{ width: size - 12, height: size - 12 }} />
        </div>

        {text && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <p style={{
              color: 'var(--stone, #6b8480)',
              fontSize: '0.88rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              margin: 0,
              fontFamily: `'Outfit', 'DM Sans', sans-serif`,
              animation: 'loaderPulse 2s ease infinite',
              textAlign: 'center'
            }}>
              {text}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span className="loader-dot" />
              <span className="loader-dot" />
              <span className="loader-dot" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}