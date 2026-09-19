import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { MobileNav } from './components/MobileNav';

// Pages
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { RequestProduct } from './pages/RequestProduct';
import { TrackOrder } from './pages/TrackOrder';
import { Account } from './pages/Account';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { About } from './pages/About';
import { Contact, HowItWorks, FAQ, Support } from './pages/Institutional';
import { PolicyPage } from './pages/PolicyPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-neutral-900 selection:bg-amber-400 selection:text-neutral-950 font-sans">
              {/* Main Sticky Navigation Header */}
              <Header />

              {/* Page Content Container with Mobile Bottom Nav Padding */}
              <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 w-full">
                <Routes>
                  {/* Storefront Home Route */}
                  <Route path="/" element={<Home />} />

                  {/* Legacy Catalog Routes - Redirect to Sourcing Portal */}
                  <Route path="/shop" element={<Navigate to="/request-product" replace />} />
                  <Route path="/shop/:platform" element={<Navigate to="/request-product" replace />} />
                  <Route path="/marketplace/:source" element={<Navigate to="/request-product" replace />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />

                  {/* Sourcing & Order Flow */}
                  <Route path="/request-product" element={<RequestProduct />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/track-order" element={<TrackOrder />} />

                  {/* Customer Account & Auth */}
                  <Route path="/account" element={<Account />} />
                  <Route path="/dashboard" element={<Account />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Admin Management */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Support, Institutional & Information */}
                  <Route path="/support" element={<Support />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/faq" element={<FAQ />} />

                  {/* Legal & Policies */}
                  <Route path="/privacy-policy" element={<PolicyPage />} />
                  <Route path="/terms-and-conditions" element={<PolicyPage />} />
                  <Route path="/shipping-policy" element={<PolicyPage />} />
                  <Route path="/refund-policy" element={<PolicyPage />} />
                  <Route path="/return-policy" element={<PolicyPage />} />
                  <Route path="/cancellation-policy" element={<PolicyPage />} />
                  <Route path="/product-request-policy" element={<PolicyPage />} />

                  {/* Fallback 404 */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>

              {/* Global Footer */}
              <Footer />

              {/* Back to Top Floating Action */}
              <BackToTop />

              {/* Bottom Navigation Bar for Mobile Viewports */}
              <MobileNav />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
