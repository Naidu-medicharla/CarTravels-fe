import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, User, Phone, Loader2 } from 'lucide-react';
import { useToast } from '../components/Feedback/ToastContext';
import { api } from '../lib/api';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import carLottie from '../assets/Car moving.lottie?url';

export const Login: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode');

  const [isRegistering, setIsRegistering] = useState(mode === 'register');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const redirect = queryParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        if (!name || !email || !phone || !password) {
          throw new Error('Please fill in all fields');
        }
        await api.register({ name, email, phone, password });
        addToast('success', 'Registration successful! Please log in.');
        setIsRegistering(false);
        // Clear password for security
        setPassword('');
      } else {
        if (!email || !password) {
          throw new Error('Please enter email and password');
        }
        const data = await api.login({ email, password });
        login(data.access_token, data.user);
        addToast('success', `Welcome back, ${data.user.name || 'User'}!`);
        navigate(redirect);
      }
    } catch (err: any) {
      addToast('error', err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
      
      {/* Full Page Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <div className="w-64 h-32 relative flex items-center justify-center">
              <DotLottieReact src={carLottie} loop autoplay />
            </div>
            <p className="text-primary font-heading font-bold tracking-widest uppercase mt-8 animate-pulse text-sm">
              {isRegistering ? 'Creating Account...' : 'Authenticating...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-[#0B0B0C] to-[#0B0B0C] z-0 blur-[100px] opacity-30" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-white mb-2 tracking-wide">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isRegistering ? 'Join our premium luxury experience.' : 'Sign in to continue your premium journey.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
            <AnimatePresence>
              {isRegistering && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                      required={isRegistering}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input 
                      type="tel" 
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                      required={isRegistering}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="email" 
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          {!isRegistering && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                <input type="checkbox" className="rounded border-white/20 bg-black/50 text-primary focus:ring-primary" />
                Remember me
              </label>
              <a href="#" className="text-primary hover:text-white transition-colors">Forgot password?</a>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary/10 border border-primary/30 hover:bg-primary text-primary hover:text-black transition-all duration-300 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold tracking-widest uppercase overflow-hidden relative group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-2">
              {isRegistering ? 'Register' : 'Sign In'}
            </span>
            <ArrowRight size={18} className="transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 absolute right-[35%]" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={toggleMode} className="text-primary font-bold hover:text-white transition-colors">
            {isRegistering ? 'Sign in' : 'Register now'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
