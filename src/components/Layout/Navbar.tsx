import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Car, Menu, X, ChevronDown, User, History, Settings, LogOut, ChevronRight, LayoutDashboard, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '@/components/NotificationBell';
import { useNotifications } from '@/lib/useNotifications';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  // Notification hook — only runs when user is logged in and not admin
  const userToken = (isLoggedIn && user?.role !== 'ADMIN') ? (localStorage.getItem('auth_token') || null) : null;
  const notifs = useNotifications(userToken);

  // Navigate to the right page when a notification is clicked
  const handleNavbarNotificationAction = async (notification: any) => {
    await notifs.markRead(notification.id);
    notifs.closePanel();
    const TYPE_TO_PATH: Record<string, string> = {
      DRIVER_ASSIGNED:       '/profile#bookings',
      CANCELLATION_APPROVED: '/profile#bookings',
      CANCELLATION_REJECTED: '/profile#bookings',
      TICKET_REPLY:          '/profile#support',
      TIER_UPGRADE:          '/profile',
    };
    const path = TYPE_TO_PATH[notification.type];
    if (path) {
      if (notification.reference_id) {
        const [base, hash] = path.split('#');
        navigate(`${base}?ref=${notification.reference_id}${hash ? '#' + hash : ''}`);
      } else {
        navigate(path);
      }
    }
  };

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

  const isSticky = scrolled;

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[900] transition-all duration-300 ${isSticky ? 'backdrop-blur-[18px] shadow-2xl py-6' : 'bg-transparent py-10'}`}
        style={isSticky ? { background: 'var(--navbar-bg)', borderBottom: '1px solid var(--navbar-border)' } : {}}
      >
        <div className="container px-6 md:px-8 flex justify-between items-center">
          {/* Logo (Only visible on Home, but takes up space everywhere) */}
          <Link 
            to="/" 
            className={`flex items-center gap-4 transition group ${location.pathname === '/' ? 'hover:opacity-80' : 'opacity-0 pointer-events-none select-none'}`}
          >
            <div className="w-10 h-10 rounded-full border-[1.5px] border-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="font-heading font-medium text-lg text-primary tracking-widest leading-none pt-0.5">VT</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="font-heading font-medium text-3xl text-primary leading-none tracking-wide">Vibe</span>
                <span className="font-heading font-light text-3xl text-foreground tracking-widest leading-none">Travels</span>
              </div>
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
            <ThemeToggle />
            {isLoggedIn ? (
              <>
                {/* Notification Bell — only for regular users (not admin) */}
                {user?.role?.toUpperCase() !== 'ADMIN' && (
                  <NotificationBell
                    unreadCount={notifs.unreadCount}
                    notifications={notifs.notifications}
                    panelOpen={notifs.panelOpen}
                    onOpen={notifs.openPanel}
                    onClose={notifs.closePanel}
                    onAction={handleNavbarNotificationAction}
                    onMarkAllRead={notifs.markAllRead}
                  />
                )}

                <div className="relative group">
                  <button className="flex items-center gap-2 text-white hover:text-primary transition-colors py-2">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium">{user?.name || 'Profile'}</span>
                    <ChevronDown size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-1 w-56 py-2 backdrop-blur-xl rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 z-[999]" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                    <div className="px-4 py-2 border-b border-white/10 mb-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{user?.role === 'ADMIN' ? 'System Admin' : 'Premium Member'}</p>
                      <p className="text-xs text-white truncate">{user?.email}</p>
                    </div>
                    {user?.role?.toUpperCase() === 'ADMIN' ? (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-[#D4AF37] hover:text-[#e8cd6e] hover:bg-white/10 transition-colors font-bold">
                        <LayoutDashboard size={16} /> Admin Panel
                      </Link>
                    ) : (
                      <>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                          <User size={16} className="text-primary" /> My Profile
                        </Link>
                        <Link to="/profile#bookings" className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                          <History size={16} className="text-primary" /> Bookings
                        </Link>
                      </>
                    )}
                    <div className="h-px bg-white/10 my-2" />
                    <button onClick={() => { logout(); navigate('/login', { replace: true }); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" replace={location.pathname === '/login'}><Button variant="ghost" className="text-white hover:text-primary hover:bg-white/5">Login</Button></Link>
                <Link to="/login?mode=register" replace={location.pathname === '/login'}><Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">Register</Button></Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden text-white p-1 hover:text-[#D4AF37] transition-colors" onClick={() => setMobileMenuOpen(true)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="8" x2="20" y2="8"></line>
              <line x1="4" y1="16" x2="20" y2="16"></line>
            </svg>
          </button>
        </div>
      </nav>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 h-[100dvh] w-screen bg-black/40 backdrop-blur-md z-[1000] flex justify-end"
          >
            {/* Slide-in Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-[85vw] max-w-[400px] h-full shadow-2xl flex flex-col" style={{ background: 'var(--color-bg-card)', borderLeft: '1px solid var(--color-border)' }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                {/* Logo matches homepage */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-primary flex items-center justify-center">
                    <span className="font-heading font-medium text-sm text-primary tracking-widest leading-none pt-0.5">VT</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1 pt-1">
                      <span className="font-heading font-medium text-xl text-primary leading-none tracking-wide">Vibe</span>
                      <span className="font-heading font-light text-xl text-foreground tracking-widest leading-none">Travels</span>
                    </div>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setMobileMenuOpen(false)} 
                  className="text-white hover:text-primary transition-colors p-1"
                >
                  <X size={28} strokeWidth={1.5} />
                </motion.button>
              </div>

              {/* Links List */}
              <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, i) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 + 0.1, duration: 0.4 }}
                        className="border-b border-[#D4AF37]/10 last:border-0"
                      >
                        <Link
                          to={link.path}
                          className="flex items-center gap-6 py-3 group"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="font-heading font-light text-[11px] text-white/20 w-4">0{i + 1}</span>
                          <span className={`font-heading font-normal text-[36px] leading-[1.15] tracking-[0.05em] transition-colors ${isActive ? 'text-[#D4AF37]' : 'text-white group-hover:text-[#D4AF37]'}`}>
                            {link.name}
                          </span>
                          {isActive && <span className="ml-auto text-[#D4AF37]">│</span>}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (navLinks.length * 0.08) + 0.1, duration: 0.4 }}
                className="p-6 border-t border-white/5 bg-black/20"
              >
                {/* Profile Card */}
                {isLoggedIn ? (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white leading-tight">{user?.name || 'Welcome'}</p>
                          <p className="text-[11px] text-white/50">{user?.role === 'ADMIN' ? 'Admin' : 'Premium Member'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {user?.role?.toUpperCase() === 'ADMIN' ? (
                        <Link to="/admin" className="flex justify-between items-center text-sm text-[#D4AF37] hover:text-[#e8cd6e] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                          <span>Admin Panel</span>
                          <ChevronRight size={16} />
                        </Link>
                      ) : (
                        <Link to="/profile" className="flex justify-between items-center text-sm text-white/80 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                          <span>View Profile</span>
                          <ChevronRight size={16} />
                        </Link>
                      )}
                      <button onClick={() => { logout(); navigate('/login', { replace: true }); setMobileMenuOpen(false); }} className="flex justify-between items-center text-sm text-red-400 hover:text-red-300 transition-colors py-2 border-t border-white/5">
                        <span>Logout</span>
                        <LogOut size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 mb-6">
                    <Link to="/login" replace={location.pathname === '/login'} className="flex-1 py-3 text-center rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                    <Link to="/login?mode=register" replace={location.pathname === '/login'} className="flex-1 py-3 text-center rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </div>
                )}

                {/* Social Icons */}
                <div className="flex items-center justify-between px-2 gap-8">
                  <a href="#" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="#" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                  <a href="#" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </a>
                  <a href="#" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors"><Phone size={18} strokeWidth={1.5} /></a>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
