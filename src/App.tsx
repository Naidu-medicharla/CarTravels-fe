import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Feedback/ToastContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { ScrollToTop } from './components/UI/ScrollToTop';
import { Home } from './pages/Home';
import { BookingFlow } from './pages/BookingFlow';
import { CustomerProfile } from './pages/CustomerProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import loadingVideo from './assets/landing_loading.mp4';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthProvider } from './context/AuthContext';
import { FleetSection } from './components/Sections/FleetSection';

// Dummy page components for routing
const Cars = () => <FleetSection />;
const About = () => <div className="container min-h-[60vh] pt-32 text-center"><h2 className="text-4xl text-white font-heading">About Us</h2></div>;
const Contact = () => <div className="container min-h-[60vh] pt-32 text-center"><h2 className="text-4xl text-white font-heading">Contact Us</h2></div>;

import { useLocation } from 'react-router-dom';

const ConditionalFooter = () => {
  const location = useLocation();
  if (location.pathname !== '/') return null;
  return <Footer />;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.6; // Slows down playback to increase animation time
    }
    // Fallback timeout in case video fails to play
    const timer = setTimeout(() => setShowSplash(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
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
              <Navbar />
              <ScrollToTop />
              
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/book" element={<BookingFlow />} />
                  <Route path="/profile" element={<CustomerProfile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/cars" element={<Cars />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>
              
              <ConditionalFooter />
            </div>
          </ToastProvider>
        </Router>
      )}
    </AuthProvider>
  );
}

export default App;
