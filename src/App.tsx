import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Feedback/ToastContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { ScrollToTop } from './components/ui/ScrollToTop';
import { Home } from './pages/Home';
import { BookingFlow } from './pages/BookingFlow';
import { CustomerProfile } from './pages/CustomerProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Services } from './pages/Services';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { BookingSuccess } from './pages/BookingSuccess';
import loadingVideo from './assets/landing_loading.mp4';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthProvider } from './context/AuthContext';
import { GlobalDataProvider, useGlobalData } from './context/GlobalDataContext';
import { FleetSection } from './components/Sections/FleetSection';
import { ProtectedRoute } from './components/ProtectedRoute';

// Dummy page components for routing
const Cars = () => <FleetSection />;
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role?.toUpperCase() === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};

const ConditionalNavbar = () => {
  const location = useLocation();
  if (location.pathname === '/admin') return null;
  return <Navbar />;
};

const ConditionalFooter = () => {
  const location = useLocation();
  // Don't show footer on specific app-like pages (e.g., admin dashboard, login)
  const noFooterRoutes = ['/admin', '/login', '/book', '/profile', '/cars', '/services', '/about'];
  if (noFooterRoutes.includes(location.pathname) || location.pathname.startsWith('/booking-success')) return null;
  return <Footer />;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 2.5; // Speed up playback significantly
    }
    // Fallback timeout in case video fails to play
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <GlobalDataProvider>
        <AnimatePresence>
          {showSplash && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
            >
              <div className="relative w-full max-w-lg px-4 flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={loadingVideo}
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => setShowSplash(false)}
                  className="w-full max-w-xs md:max-w-md rounded-lg shadow-2xl object-contain"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showSplash && (
          <Router>
            <ToastProvider>
              <div className="flex flex-col min-h-screen bg-background">
                <ConditionalNavbar />
                <ScrollToTop />

                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<CustomerRoute><Home /></CustomerRoute>} />
                    <Route path="/book" element={
                      <ProtectedRoute requiredRole="USER">
                        <BookingFlow />
                      </ProtectedRoute>
                    } />
                    <Route path="/booking-success/:bookingId" element={
                      <ProtectedRoute requiredRole="USER">
                        <BookingSuccess />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute requiredRole="USER">
                        <CustomerProfile />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/cars" element={<CustomerRoute><Cars /></CustomerRoute>} />
                    <Route path="/services" element={<CustomerRoute><Services /></CustomerRoute>} />
                    <Route path="/about" element={<CustomerRoute><About /></CustomerRoute>} />
                    <Route path="/contact" element={<CustomerRoute><Contact /></CustomerRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<CustomerRoute><Home /></CustomerRoute>} />
                  </Routes>
                </main>

                <ConditionalFooter />
              </div>
            </ToastProvider>
          </Router>
        )}
      </GlobalDataProvider>
    </AuthProvider>
  );
}

export default App;
