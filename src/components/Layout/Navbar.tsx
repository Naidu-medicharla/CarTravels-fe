import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Car, Menu, X, ChevronDown, User, History, Settings, LogOut } from 'lucide-react';
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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Cars', path: '/cars' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isSticky = scrolled || location.pathname !== '/';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isSticky ? 'bg-[#0a0a0a]/75 backdrop-blur-[20px] border-b border-white/5 shadow-2xl py-6' : 'bg-transparent py-10'}`}>
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
              <div className="absolute right-0 mt-1 w-56 py-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                <div className="px-4 py-2 border-b border-white/10 mb-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{user?.role === 'ADMIN' ? 'Admin' : 'Premium Member'}</p>
                  <p className="text-xs text-white truncate">{user?.email}</p>
                </div>
                <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                  <User size={16} className="text-primary" /> My Profile
                </Link>
                <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                  <History size={16} className="text-primary" /> Bookings
                </Link>
                <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                  <Settings size={16} className="text-primary" /> Settings
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
              <Link to="/login"><Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">Register</Button></Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={28} />
        </button>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[300px] bg-card z-[101] p-6 flex flex-col border-l border-white/5"
              >
                <div className="flex justify-between items-center mb-12">
                  <span className="font-heading font-medium text-2xl text-white">Vibe Travels</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-6 flex-grow">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="text-lg font-medium text-white hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col gap-4 mt-auto">
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center gap-3 mb-2 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{user?.name || 'Profile'}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full justify-center border-red-500/50 text-red-400 hover:bg-red-500/10">Logout</Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}><Button variant="ghost" className="w-full justify-center">Login</Button></Link>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full justify-center border-primary text-primary">Register</Button></Link>
                    </>
                  )}
                  {/* <Button 
                    onClick={() => { setMobileMenuOpen(false); isLoggedIn ? navigate('/book') : navigate('/login?redirect=/book'); }}
                    className="w-full justify-center bg-primary text-black"
                  >
                    Book Now
                  </Button> */}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
