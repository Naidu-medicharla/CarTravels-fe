import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Phone, Mail, ChevronDown, FileText, CarFront } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);

const FooterAccordion = ({ title, children, defaultOpen = false }: { title: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10 md:border-none md:pb-0">
      <button 
        className="w-full flex justify-between items-center py-4 md:py-0 md:mb-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="font-heading font-bold text-white text-left">{title}</h4>
        <ChevronDown size={20} className={`md:hidden text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {(isOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:!h-auto md:!opacity-100 overflow-hidden"
          >
            <div className="pb-6 md:pb-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#0A0A0A] to-[#121212] text-muted-foreground pt-16 md:pt-20 pb-8 border-t border-white/5 relative z-10">
      <div className="container px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 md:gap-12 mb-12 md:mb-16">
          {/* Column 1: Logo & Desc */}
          <div className="lg:col-span-2 mb-8 md:mb-0 pb-8 md:pb-0 border-b border-white/10 md:border-none">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition group mb-6">
              <Car size={32} className="text-primary group-hover:scale-105 transition-transform" />
              <div className="flex items-baseline gap-1.5 ml-1 pt-1">
                <span className="font-heading font-bold text-3xl text-primary leading-none tracking-wide">Vibe</span>
                <span className="font-heading font-normal text-2xl text-white tracking-widest leading-none">Travels</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-8 max-w-sm">
              Your Journey, Our Responsibility. Experience the pinnacle of automotive luxury with our premium fleet and professional chauffeurs across the state.
            </p>
            <div className="flex gap-4">
              {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon].map((Icon, i) => (
                <motion.a 
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  key={i} 
                  href="#" 
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors text-white"
                >
                  <Icon />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-1">
            <FooterAccordion 
              title={
                <span className="flex items-center gap-2">
                  <FileText size={18} className="text-primary" /> Quick Links
                </span>
              }
            >
              <ul className="space-y-4 text-sm">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/cars" className="hover:text-primary transition-colors">Our Fleet</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
              </ul>
            </FooterAccordion>
          </div>

          {/* Column 3: Services */}
          <div className="lg:col-span-1">
            <FooterAccordion 
              title={
                <span className="flex items-center gap-2">
                  <CarFront size={18} className="text-primary" /> Services
                </span>
              }
            >
              <ul className="space-y-4 text-sm">
                <li><Link to="/services/airport" className="hover:text-primary transition-colors">Airport Transfers</Link></li>
                <li><Link to="/services/corporate" className="hover:text-primary transition-colors">Corporate Travel</Link></li>
                <li><Link to="/services/wedding" className="hover:text-primary transition-colors">Wedding Chauffeurs</Link></li>
                <li><Link to="/services/outstation" className="hover:text-primary transition-colors">Outstation Trips</Link></li>
                <li><Link to="/services/temple" className="hover:text-primary transition-colors">Temple Visits</Link></li>
              </ul>
            </FooterAccordion>
          </div>

          {/* Column 4: Contact */}
          <div className="lg:col-span-1">
            <FooterAccordion 
              title={
                <span className="flex items-center gap-2">
                  <Phone size={18} className="text-primary" /> Contact
                </span>
              }
            >
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <MapPin size={18} className="text-primary shrink-0" />
                  <span>Hyderabad</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-primary shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-primary shrink-0" />
                  <span>concierge@vibetravels.com</span>
                </li>
              </ul>
            </FooterAccordion>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-center md:text-left gap-4 md:gap-0">
          <p>&copy; {new Date().getFullYear()} Vibe Travels. All rights reserved.</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/refund" className="hover:text-primary transition-colors">Refund Policy</Link>
            <Link to="/cancellation" className="hover:text-primary transition-colors">Cancellation Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
