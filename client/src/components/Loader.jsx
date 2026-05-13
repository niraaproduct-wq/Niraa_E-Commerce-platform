import React from 'react';

export default function Loader({ size = 40, text = 'Loading...' }) {
  return (
    <>
      <style>{`
        @keyframes loaderSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes loaderPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50%       { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes loaderDots {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%           { transform: scale(1);   opacity: 1; }
        }
        .loader-dot { display: inline-block; border-radius: 50%; background: var(--teal); width: 6px; height: 6px; margin: 0 3px; }
        .loader-dot:nth-child(1) { animation: loaderDots 1.2s 0s infinite ease-in-out; }
        .loader-dot:nth-child(2) { animation: loaderDots 1.2s 0.2s infinite ease-in-out; }
        .loader-dot:nth-child(3) { animation: loaderDots 1.2s 0.4s infinite ease-in-out; }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 20px', gap: 20,
      }}>
        {/* Dual-ring spinner */}
        <div style={{ position: 'relative', width: size, height: size }}>
          <div style={{
            position: 'absolute', inset: 0,
            border: `3px solid var(--gray-200)`,
            borderTopColor: 'var(--teal)',
            borderRadius: '50%',
            animation: 'loaderSpin 0.75s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 6,
            border: `2px solid transparent`,
            borderBottomColor: 'var(--teal)',
            borderRadius: '50%',
            opacity: 0.6,
            animation: 'loaderSpin 0.5s linear infinite reverse',
          }} />
        </div>

        {text && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', animation: 'loaderPulse 1.5s ease infinite' }}>
              {text}
            </p>
            <div>
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