import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, User, Phone, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Feedback/ToastContext';
import { api } from '../lib/api';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import carLottie from '../assets/Car moving.lottie?url';
import loginLightBg from '../assets/login_light.png';
import { useTheme } from '../context/ThemeContext';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode');

  const [isRegistering, setIsRegistering] = useState(mode === 'register');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, isLoggedIn, user } = useAuth();
  const { isDark } = useTheme();
  const { addToast } = useToast();
  const redirect = queryParams.get('redirect') || '/';

  React.useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role?.toUpperCase() === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirect, { replace: true });
      }
    }
  }, [isLoggedIn, user, navigate, redirect]);

  React.useEffect(() => {
    setIsRegistering(mode === 'register');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        if (!name || !email || !phone || !password || !confirmPassword) {
          throw new Error('Please fill in all fields');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          throw new Error('Please enter a valid email address');
        }
        if (phone.length < 10) {
          throw new Error('Please enter a valid phone number');
        }
        await api.register({ name, email, phone, password });
        addToast('success', 'Registration successful! Please log in.');
        setIsRegistering(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        if (!email || !password) {
          throw new Error('Please enter email and password');
        }
        const data = await api.login({ email, password });
        login(data.access_token, data.user);
        addToast('success', `Welcome back, ${data.user.name || 'User'}!`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setError(null);
  };

  const handleMockSocialLogin = (provider: string) => {
    addToast('info', `${provider} sign-in is not implemented in this demo.`);
  };

  return (
    <div 
      className={`${styles.page} ${!isDark ? 'flex-col items-center pt-24 justify-start' : ''}`}
    >
      
      {/* Light Mode Specific Image */}
      {!isDark && (
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          <img src={loginLightBg} alt="Login Banner" className="w-full h-full object-cover object-top" />
        </div>
      )}
      
      {/* Visuals / Animation (Only for Dark Mode Split Layout) */}
      {isDark && (
        <div className={styles.leftPane}>
          {/* The beautiful generated illustration */}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/auth_car_illustration.png)' }} />
          
          {/* Subtle overlay gradient to ensure text readability if needed */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Floating animated elements */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-12 left-12 right-12 text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
              <span>🚀</span> The Future of Car Trading
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold leading-tight mb-4 drop-shadow-lg">
              Find Your Dream Car Instantly
            </h1>
            <p className="text-white/80 max-w-sm drop-shadow-md">
              The intelligent marketplace for buying and selling cars with AI-powered transactions.
            </p>
            
            <div className="mt-8 flex gap-2">
              <div className="w-8 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Form Area */}
      <div className={`${styles.rightPane} ${!isDark ? 'w-full !flex-none justify-end pb-12 pt-12 bg-transparent z-10 relative mt-auto' : ''}`}>
        <div className={`${styles.formContainer} ${!isDark ? 'mx-auto w-full max-w-xs px-2' : ''}`}>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back to Home Link (Dark mode only) */}
            {isDark && (
              <Link to="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border hover:bg-muted transition-colors mb-8 text-muted-foreground hover:text-foreground">
                <ArrowRight size={18} className="rotate-180" />
              </Link>
            )}

            {isDark && (
              <div className="mb-8">
                <h2 className="text-3xl font-heading font-extrabold mb-2">
                  {isRegistering ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {isRegistering ? 'Create your account for daily updates.' : 'Sign in to continue to Auto market.'}
                </p>
              </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="popLayout">
                {isRegistering && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block ml-2">Full Name</label>
                    <div className={styles.inputWrapper}>
                      <User className={styles.inputIcon} size={18} />
                      <input 
                        type="text" 
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.input}
                        required={isRegistering}
                      />
                    </div>

                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block ml-2">Phone</label>
                    <div className={styles.inputWrapper}>
                      <Phone className={styles.inputIcon} size={18} />
                      <input 
                        type="tel" 
                        placeholder="Enter your phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={styles.input}
                        required={isRegistering}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block ml-2">Email</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block ml-2">Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.revealBtn}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <AnimatePresence mode="popLayout">
                {isRegistering && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block ml-2">Confirm Password</label>
                    <div className={styles.inputWrapper}>
                      <Lock className={styles.inputIcon} size={18} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.input}
                        required={isRegistering}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.revealBtn}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isRegistering && (
                <div className="flex items-center justify-between text-xs mb-6 px-2">
                  <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors font-medium">
                    <CheckCircle2 size={16} />
                    Forgot Password?
                  </label>
                  <a href="#" className="text-foreground font-bold hover:text-primary transition-colors">Forgot Password?</a>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground hover:bg-foreground/90 text-background transition-all duration-300 py-3.5 rounded-full font-bold shadow-lg disabled:opacity-50 mt-2"
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (isRegistering ? 'Create Account' : 'Log In')}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-muted-foreground font-medium">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={toggleMode} className="text-foreground font-bold hover:text-primary transition-colors">
                {isRegistering ? 'Log in' : 'Sign up'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
