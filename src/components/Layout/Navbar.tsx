import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Car, Menu, X, ChevronDown, User, History, Settings, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Cars', path: '/cars' },
    { name: 'Experiences', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isSticky = scrolled || location.pathname !== '/';

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[900] transition-all duration-300 ${isSticky ? 'bg-[#0a0a0a]/75 backdrop-blur-[20px] border-b border-white/5 shadow-2xl py-6' : 'bg-transparent py-10'}`}>
        <div className="container px-6 md:px-8 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition group">
            <Car size={38} className="text-primary group-hover:scale-105 transition-transform" />
            <div className="flex items-baseline gap-1.5 ml-1 pt-1">
              <span className="font-heading font-bold text-4xl text-primary leading-none tracking-wide">Vibe</span>
              <span className="font-heading font-normal text-3xl text-white tracking-widest leading-none">Travels</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors relative group py-2 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
                >
                  {link.name}
                  <div className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-white hover:text-primary transition-colors py-2">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium">{user?.name || 'Profile'}</span>
                  <ChevronDown size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-1 w-56 py-2 bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 z-[999]">
                  <div className="px-4 py-2 border-b border-white/10 mb-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{user?.role === 'ADMIN' ? 'System Admin' : 'Premium Member'}</p>
                    <p className="text-xs text-white truncate">{user?.email}</p>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-[#D4AF37] hover:text-[#e8cd6e] hover:bg-white/10 transition-colors font-bold">
                      <LayoutDashboard size={16} /> Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    <User size={16} className="text-primary" /> My Profile
                  </Link>
                  <Link to="/profile#bookings" className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    <History size={16} className="text-primary" /> Bookings
                  </Link>
                  <div className="h-px bg-white/10 my-2" />
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" className="text-white hover:text-primary hover:bg-white/5">Login</Button></Link>
                <Link to="/login?mode=register"><Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">Register</Button></Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 h-screen w-screen bg-[#050505] z-[1000] flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 md:p-8">
              <span className="font-heading font-bold text-3xl text-primary tracking-wide uppercase">VIBE</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-primary transition-colors">
                <X size={32} strokeWidth={1.5} />
              </button>
            </div>

            {/* Links Centered */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-[min-content] py-12">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.1, duration: 0.4 }}
                >
                  <Link
                    to={link.path}
                    className="font-heading text-4xl text-white hover:text-[#D4AF37] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.05 + 0.1, duration: 0.4 }}
              >
                <Link
                  to="/book"
                  className="font-heading text-4xl text-white hover:text-[#D4AF37] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Reserve Journey
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (navLinks.length + 1) * 0.05 + 0.1, duration: 0.4 }}
                className="mt-8"
              >
                {isLoggedIn ? (
                  <div className="flex flex-col items-center gap-6">
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin" className="text-2xl font-heading text-[#D4AF37] hover:text-[#e8cd6e] transition-colors" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                    )}
                    <Link to="/profile" className="text-xl text-white/80 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-xl text-red-400 hover:text-red-300 transition-colors">Logout</button>
                  </div>
                ) : (
                  <Link to="/login" className="text-xl text-white/80 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
