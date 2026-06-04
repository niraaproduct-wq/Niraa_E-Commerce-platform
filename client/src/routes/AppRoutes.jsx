import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar        from '../components/Navbar.jsx';
import Footer        from '../components/Footer.jsx';
import Home          from '../pages/Home.jsx';
import Products      from '../pages/Products.jsx';
import ProductDetails from '../pages/ProductDetails.jsx';
import Cart          from '../pages/Cart.jsx';
import Checkout      from '../pages/Checkout.jsx';
import About         from '../pages/About.jsx';
import Contact       from '../pages/Contact.jsx';
import ComboDetails  from '../pages/ComboDetails.jsx';
import Loyalty       from '../pages/Loyalty.jsx';
import Login         from '../pages/Login.jsx';
import ProtectedRoute from './Protectedroute.jsx';
import ScrollToTop    from '../components/ScrollToTop.jsx';
import FloatingWhatsApp from '../components/FloatingWhatsApp.jsx';
import Profile        from '../pages/Profile.jsx';
import ProfileOrders  from '../pages/ProfileOrders.jsx';

const AdminRedirect = () => {
  React.useEffect(() => {
    // In development, redirect to the admin port (5174)
    // In production, redirect to the admin custom domain
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.location.href = window.location.protocol + '//' + window.location.hostname + ':5174';
    } else {
      window.location.href = 'https://admin.niraacare.com';
    }
  }, []);
  return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>Redirecting to Admin Panel...</div>;
};

export default function AppRoutes() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    setProgress(15);
    
    const timer1 = setTimeout(() => setProgress(45), 80);
    const timer2 = setTimeout(() => setProgress(80), 200);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 150);
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      {active && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '3px',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #c8a84b, #1a7a6e)',
          zIndex: 999999,
          transition: 'width 0.15s ease, opacity 0.15s ease',
          opacity: progress === 100 ? 0 : 1,
          boxShadow: '0 0 8px rgba(200,168,75,0.6)'
        }} />
      )}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/products" element={<><Navbar /><Products /><Footer /></>} />
        <Route path="/products/:slug" element={<><Navbar /><ProductDetails /><Footer /></>} />
        <Route path="/combos/:slug" element={<><Navbar /><ComboDetails /><Footer /></>} />
        <Route path="/cart" element={<><Navbar /><Cart /><Footer /></>} />
        <Route path="/checkout" element={<><Navbar /><Checkout /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />

        <Route path="/loyalty" element={<><Navbar /><Loyalty /><Footer /></>} />
        <Route path="/login" element={<Login />} />

        {/* Protected User Routes */}
        <Route path="/profile" element={<ProtectedRoute><><Navbar /><Profile /><Footer /></></ProtectedRoute>} />
        <Route path="/profile/orders" element={<ProtectedRoute><><Navbar /><ProfileOrders /><Footer /></></ProtectedRoute>} />

        {/* Redirect to Admin Panel */}
        <Route path="/admin" element={<AdminRedirect />} />
      </Routes>
      <FloatingWhatsApp />
    </>
  );
}
