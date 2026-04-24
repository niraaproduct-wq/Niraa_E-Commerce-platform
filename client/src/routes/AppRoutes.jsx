import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar        from '../components/Navbar.jsx';
import Footer        from '../components/Footer.jsx';
import Home          from '../pages/Home.jsx';
import Products      from '../pages/Products.jsx';
import ProductDetails from '../pages/ProductDetails.jsx';
import Cart          from '../pages/Cart.jsx';
import Checkout      from '../pages/Checkout.jsx';
import About         from '../pages/About.jsx';
import Contact       from '../pages/Contact.jsx';
import Loyalty       from '../pages/Loyalty.jsx';
import Login         from '../pages/Login.jsx';
import ProtectedRoute from './Protectedroute.jsx';
import ScrollToTop    from '../components/ScrollToTop.jsx';
import FloatingWhatsApp from '../components/FloatingWhatsApp.jsx';
import Profile        from '../pages/Profile.jsx';
import ProfileOrders  from '../pages/ProfileOrders.jsx';

const AdminRedirect = () => {
  React.useEffect(() => {
    // Redirect to the admin port (5174)
    window.location.href = window.location.protocol + '//' + window.location.hostname + ':5174';
  }, []);
  return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>Redirecting to Admin Panel...</div>;
};

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/products" element={<><Navbar /><Products /><Footer /></>} />
        <Route path="/products/:slug" element={<><Navbar /><ProductDetails /><Footer /></>} />
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
