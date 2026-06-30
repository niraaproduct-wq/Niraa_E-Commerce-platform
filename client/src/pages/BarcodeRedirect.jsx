import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductByBarcode } from '../utils/productApi';
import Loader from '../components/Loader';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

export default function BarcodeRedirect() {
  const { barcode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barcode) {
      setError('No barcode provided');
      setLoading(false);
      return;
    }

    const lookupProduct = async () => {
      try {
        setLoading(true);
        const product = await getProductByBarcode(barcode);
        if (product && product.slug) {
          // If it is a combo, redirect to combos slug path
          if (product.productType === 'combo' || product.isCombo) {
            navigate(`/combos/${product.slug}`, { replace: true });
          } else {
            navigate(`/products/${product.slug}`, { replace: true });
          }
        } else {
          setError('Product found, but it has no web URL.');
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || 'Product not found.');
        setLoading(false);
      }
    };

    lookupProduct();
  }, [barcode, navigate]);

  if (loading) {
    return (
      <main className="container page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader text="Searching catalog for barcode/SKU..." size={60} />
      </main>
    );
  }

  return (
    <main className="container page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{
        textAlign: 'center',
        padding: '50px 30px',
        background: '#fff',
        borderRadius: 24,
        border: '1px solid rgba(42,125,114,0.1)',
        boxShadow: '0 8px 32px rgba(42,125,114,0.05)',
        maxWidth: 480,
        width: '100%',
      }}>
        <div style={{ color: '#dc2626', fontSize: '3rem', marginBottom: 20 }}>
          <FiAlertTriangle style={{ strokeWidth: 1.5 }} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '1.4rem',
          color: 'var(--gray-800)',
          marginBottom: 12
        }}>
          Look Up Failed
        </h1>
        <p style={{ color: 'var(--gray-500)', lineHeight: 1.6, fontSize: '0.92rem', marginBottom: 30 }}>
          {error || "We couldn't find a matching product in our catalog for barcode: "}
          <strong style={{ color: 'var(--teal)', fontFamily: 'monospace', display: 'block', marginTop: 8, fontSize: '1rem' }}>
            {barcode}
          </strong>
        </p>
        <Link to="/products" style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: '#fff',
          background: 'var(--teal)',
          padding: '12px 28px',
          borderRadius: 14,
          fontWeight: 800,
          textDecoration: 'none',
          fontSize: '0.9rem',
          transition: 'all 0.2s',
          boxShadow: '0 4px 14px rgba(29,158,117,0.25)'
        }}>
          <FiArrowLeft size={16} /> Browse All Products
        </Link>
      </div>
    </main>
  );
}
