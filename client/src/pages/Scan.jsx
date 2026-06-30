import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { FiArrowLeft, FiCamera, FiAlertCircle, FiSearch, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Scan() {
  const navigate = useRef(useNavigate()).current; // Keep a stable ref for safety inside handlers
  const [hasPermission, setHasPermission] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Request camera permissions and get devices list
    Html5Qrcode.getCameras()
      .then((devices) => {
        setCameras(devices);
        setHasPermission(true);
        if (devices.length > 0) {
          // Default to the back camera if available, otherwise first camera
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.error('Camera access error:', err);
        setHasPermission(false);
      });

    return () => {
      // Clean up scanning on unmount
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.error('Error stopping scanner:', e));
      }
    };
  }, []);

  const startScanning = (cameraId) => {
    if (!cameraId) return;
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        initScanner(cameraId);
      }).catch(() => {
        initScanner(cameraId);
      });
    } else {
      initScanner(cameraId);
    }
  };

  const initScanner = (cameraId) => {
    const html5Qrcode = new Html5Qrcode('qr-reader-viewport');
    scannerRef.current = html5Qrcode;
    setIsScanning(true);

    html5Qrcode.start(
      cameraId,
      {
        fps: 10,
        qrbox: (width, height) => {
          const size = Math.min(width, height) * 0.7;
          return { width: size, height: size * 0.6 }; // Wider rectangular box perfect for barcodes
        }
      },
      (decodedText) => {
        // Scanned successfully!
        toast.success(`Scanned: ${decodedText}`);
        html5Qrcode.stop().then(() => {
          setIsScanning(false);
          // Route immediately to barcode redirect page
          navigate(`/barcode/${encodeURIComponent(decodedText.trim())}`);
        }).catch((err) => {
          console.error(err);
          navigate(`/barcode/${encodeURIComponent(decodedText.trim())}`);
        });
      },
      (errorMessage) => {
        // Verbose scanning loop logs, silent in production
      }
    ).catch((err) => {
      console.error('Start scanner error:', err);
      toast.error('Failed to start camera feed.');
      setIsScanning(false);
    });
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setIsScanning(false);
      }).catch(err => {
        console.error(err);
        setIsScanning(false);
      });
    }
  };

  useEffect(() => {
    if (hasPermission && selectedCameraId && !isScanning) {
      startScanning(selectedCameraId);
    }
  }, [hasPermission, selectedCameraId]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    navigate(`/barcode/${encodeURIComponent(manualInput.trim())}`);
  };

  return (
    <main className="container page" style={{ paddingTop: 20, paddingBottom: 60 }}>
      <style>{`
        .scan-container {
          max-width: 600px;
          margin: 0 auto;
          background: #fff;
          border-radius: 28px;
          border: 1px solid rgba(42,125,114,0.1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .scanner-header {
          padding: 24px 28px;
          border-bottom: 1.5px solid #f2f1ef;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .scanner-body {
          padding: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .camera-viewport-wrapper {
          position: relative;
          width: 100%;
          max-width: 440px;
          aspect-ratio: 4/3;
          border-radius: 20px;
          background: #0f172a;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(15,23,42,0.15);
          border: 3px solid var(--teal);
        }
        .scanning-laser-line {
          position: absolute;
          left: 10%;
          right: 10%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #c8a84b, #1d9e75, #c8a84b, transparent);
          box-shadow: 0 0 12px #1d9e75;
          animation: laserMove 2.5s infinite ease-in-out;
          z-index: 10;
          pointer-events: none;
        }
        @keyframes laserMove {
          0%, 100% { top: 15%; opacity: 0.3; }
          50% { top: 85%; opacity: 1; }
        }
        .scan-overlay-target {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .target-box {
          width: 70%;
          height: 42%;
          border: 2px dashed rgba(255, 255, 255, 0.65);
          border-radius: 12px;
          box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.45);
          position: relative;
        }
        .target-corner {
          position: absolute;
          width: 16px;
          height: 16px;
          border-color: #c8a84b;
          border-style: solid;
          border-width: 0;
        }
        .corner-tl { top: -2px; left: -2px; border-top-width: 4px; border-left-width: 4px; border-top-left-radius: 8px; }
        .corner-tr { top: -2px; right: -2px; border-top-width: 4px; border-right-width: 4px; border-top-right-radius: 8px; }
        .corner-bl { bottom: -2px; left: -2px; border-bottom-width: 4px; border-left-width: 4px; border-bottom-left-radius: 8px; }
        .corner-br { bottom: -2px; right: -2px; border-bottom-width: 4px; border-right-width: 4px; border-bottom-right-radius: 8px; }

        .select-input {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--gray-200, #E5E3DE);
          font-family: inherit;
          font-size: 0.88rem;
          color: var(--gray-700);
          background: #fff;
          cursor: pointer;
          width: 100%;
          max-width: 280px;
        }
        .select-input:focus { border-color: var(--teal); outline: none; }
      `}</style>

      <div className="scan-container">
        <div className="scanner-header">
          <Link to="/" style={{ color: 'var(--gray-600)', display: 'flex', alignItems: 'center' }}>
            <FiArrowLeft size={22} />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem', color: 'var(--gray-900)' }}>
              Scan Product Barcode
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              Hold product labels up to your camera to scan QR or barcodes.
            </p>
          </div>
        </div>

        <div className="scanner-body">
          {hasPermission === false && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 16,
              padding: 20, textAlign: 'center', width: '100%'
            }}>
              <FiAlertCircle size={32} color="#dc2626" style={{ marginBottom: 12 }} />
              <h3 style={{ margin: '0 0 6px', color: '#991b1b', fontSize: '1rem', fontWeight: 700 }}>Camera Permission Denied</h3>
              <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Please grant camera access in your browser settings to use the scanner, or type the barcode number manually below.
              </p>
            </div>
          )}

          {hasPermission === true && (
            <>
              {/* Selector for cameras */}
              {cameras.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' }}>
                  <FiCamera size={16} color="var(--gray-500)" />
                  <select
                    className="select-input"
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                  >
                    {cameras.map(cam => (
                      <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cameras.indexOf(cam) + 1}`}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Viewport */}
              <div className="camera-viewport-wrapper">
                <div id="qr-reader-viewport" style={{ width: '100%', height: '100%', objectFit: 'cover' }}></div>
                {isScanning && (
                  <>
                    <div className="scanning-laser-line" />
                    <div className="scan-overlay-target">
                      <div className="target-box">
                        <div className="target-corner corner-tl" />
                        <div className="target-corner corner-tr" />
                        <div className="target-corner corner-bl" />
                        <div className="target-corner corner-br" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 16, margin: '10px 0' }}>
            <div style={{ flex: 1, height: '1.5px', background: '#edeef1' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 800, textTransform: 'uppercase' }}>Or Enter Manually</span>
            <div style={{ flex: 1, height: '1.5px', background: '#edeef1' }} />
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 440 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Type Barcode or SKU..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 14,
                  border: '1.5px solid var(--gray-200)',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--teal)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
              />
            </div>
            <button
              type="submit"
              style={{
                background: 'var(--teal)',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                padding: '0 20px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(29,158,117,0.2)',
                transition: 'all 0.2s'
              }}
            >
              <FiSearch size={16} /> Search
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
