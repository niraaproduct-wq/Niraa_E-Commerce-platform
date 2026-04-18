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
import { AdminRoutes } from '../pages/admin/AdminPages.jsx';
import ProtectedRoute from './Protectedroute.jsx';
import ScrollToTop    from '../components/ScrollToTop.jsx';
import FloatingWhatsApp from '../components/FloatingWhatsApp.jsx';

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

        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
      <FloatingWhatsApp />
    </>
  );
}