import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight, PhoneCall, Mail, CheckCircle2, Ticket, Clock, CheckCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, TicketOut } from '../lib/api';
import { useGlobalData } from '../context/GlobalDataContext';
import { useTheme } from '../context/ThemeContext';
import contactBg from '../assets/contact_section.jpg';
import styles from './Contact.module.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);

  // Form states
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  });
  const { customerTickets: myTickets, setCustomerTickets: setMyTickets, isDataLoading } = useGlobalData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    { q: "How early should I reserve?", a: "We recommend reserving at least 24 hours in advance for guaranteed availability, though we often accommodate short-notice requests." },
    { q: "Do you provide airport pickups?", a: "Yes, our chauffeurs will track your flight and wait at the arrivals hall with a personalized name board." },
    { q: "Can I hire for weddings?", a: "Absolutely. We offer tailored wedding packages featuring our finest luxury vehicles adorned to your specifications." },
    { q: "Do you support corporate billing?", a: "Yes, we provide consolidated monthly billing and dedicated account management for our corporate partners." },
    { q: "Do you travel outside the city?", a: "Yes, our outstation trips cover extensive routes with dedicated chauffeurs for multi-day itineraries." }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        full_name: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        subject: formData.subject,
        message: formData.message
      };
      const newTicket = await api.createTicket(token, payload);
      alert("Message sent! Our concierge will contact you shortly.");
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      if (token) {
        setMyTickets(prev => [newTicket, ...prev]);
      }
    } catch (e) {
      alert("Failed to send message: " + e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { theme } = useTheme();

  return (
    <div className="bg-background min-h-[100dvh] font-sans text-foreground overflow-hidden selection:bg-primary selection:text-black">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: theme === 'light' ? `url(${contactBg})` : `linear-gradient(rgba(8,8,8,.72), rgba(8,8,8,.72)), url(${contactBg})`
          }}
        />
        
        {/* Bottom Fade Gradient to blend into the next section */}
        <div className={`absolute inset-x-0 bottom-0 h-48 lg:h-64 z-[5] pointer-events-none ${styles.heroFadeBottom}`} />
        
        <div className="relative z-10 container mx-auto px-6 mt-12 mb-6 text-center flex flex-col items-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center max-w-4xl">
            <motion.h3 variants={fadeInUp} className="text-[10px] uppercase tracking-[0.4em] text-primary mb-12 md:mb-8 font-bold">
              CONCIERGE DESK
            </motion.h3>
            <motion.h1 variants={fadeInUp} className="font-heading text-4xl md:text-6xl lg:text-[72px] leading-tight font-light mb-12 md:mb-10 text-foreground dark:text-white/90">
              Luxury Begins<br/>With a<br/>Conversation.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted-foreground dark:text-white/60 text-base md:text-lg leading-relaxed mb-6 max-w-lg font-light">
              Speak to our dedicated concierge team. Whether you need immediate assistance, have a special request, or wish to explore corporate partnerships, we are at your service 24/7.
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 text-muted-foreground dark:text-white/40 cursor-pointer"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <div className="w-8 h-[1px] bg-border dark:bg-white/40 mb-3" />
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold mb-2">Scroll</span>
          <span className="text-[10px]">↓</span>
        </motion.div>
      </section>

      {/* 2. IMMEDIATE ASSISTANCE & CONTACT METHODS */}
      <section id="contact-methods" className={`py-16 md:py-24 px-6 ${styles.sectionDark}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            {/* Left Side: Immediate Assistance */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex flex-col h-full justify-center"
            >
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-primary mb-8 font-bold">IMMEDIATE ASSISTANCE</h3>
              <h2 className="font-heading text-4xl md:text-5xl font-light leading-[1.2] text-foreground dark:text-white/90 mb-10">
                Need to speak with us right away?
              </h2>
              <p className="text-muted-foreground dark:text-white/60 text-lg leading-relaxed font-light max-w-md mb-12">
                Our luxury concierge team is available 24 hours a day to handle urgent requests, modify existing reservations, and provide bespoke itinerary planning.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <a href="tel:+919876543210" className="flex items-center justify-center gap-3 bg-black dark:bg-white text-white dark:text-black px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-primary dark:hover:bg-[#D4AF37] transition-colors">
                  <PhoneCall size={16} /> Call Now
                </a>
                <a href="mailto:hello@vibetravels.com" className="flex items-center justify-center gap-3 border border-black/20 dark:border-white/20 px-8 py-4 text-xs uppercase tracking-widest font-bold hover:border-black dark:hover:border-white transition-colors text-foreground dark:text-white">
                  <Mail size={16} /> Email Us
                </a>
              </div>
            </motion.div>

            {/* Right Side: Editorial Contact Methods */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex flex-col w-full max-w-md mx-auto lg:mx-0"
            >
              <div className="w-full h-[1px] bg-border dark:bg-white/20 mb-10" />
              
              <div className="mb-10">
                <h4 className="font-heading text-2xl text-foreground dark:text-white font-light mb-4">24/7 Concierge</h4>
                <p className="text-primary text-lg font-light tracking-wide mb-2">+91 98765 43210</p>
                <p className="text-muted-foreground dark:text-white/40 text-sm uppercase tracking-widest">Available 24 Hours</p>
              </div>

              <div className="w-full h-[1px] bg-border dark:bg-white/20 mb-10" />
              
              <div className="mb-10">
                <h4 className="font-heading text-2xl text-foreground dark:text-white font-light mb-4">Email</h4>
                <p className="text-primary text-lg font-light tracking-wide mb-2">hello@vibetravels.com</p>
                <p className="text-muted-foreground dark:text-white/40 text-sm uppercase tracking-widest">Typical reply within 15 minutes</p>
              </div>

              <div className="w-full h-[1px] bg-border dark:bg-white/20 mb-10" />
              
              <div className="mb-10">
                <h4 className="font-heading text-2xl text-foreground dark:text-white font-light mb-4">Head Office</h4>
                <p className="text-primary text-lg font-light tracking-wide mb-2">Hyderabad, Telangana</p>
                <p className="text-muted-foreground dark:text-white/40 text-sm uppercase tracking-widest">Luxury Chauffeur Office</p>
              </div>

              <div className="w-full h-[1px] bg-border dark:bg-white/20" />
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* 3. SIMPLE CONCIERGE FORM */}
      <section className={`py-16 md:py-24 px-6 ${styles.sectionDark}`}>
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-primary mb-6 font-bold">INQUIRIES</h3>
            <h2 className="font-heading text-4xl md:text-5xl text-foreground dark:text-white font-light mb-12">Send a Message</h2>
            
            {/* Reassurance Strip */}
            <div className="flex flex-col items-center max-w-lg mx-auto">
              <div className="w-full h-[1px] bg-border dark:bg-white/[0.08] mb-6" />
              <div className="flex flex-col sm:flex-row justify-between w-full text-muted-foreground dark:text-white/50 text-xs md:text-sm font-light gap-4 sm:gap-0">
                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Replies within 15 mins</span>
                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Available 24 Hours</span>
                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Confidential</span>
              </div>
              <div className="w-full h-[1px] bg-border dark:bg-white/[0.08] mt-6" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className={`p-8 md:p-12 rounded-xl ${styles.formCard}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs text-muted-foreground dark:text-white/50 uppercase tracking-wider font-semibold">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className={styles.input} />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground dark:text-white/50 uppercase tracking-wider font-semibold">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className={styles.input} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground dark:text-white/50 uppercase tracking-wider font-semibold">Phone Number</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={styles.input} />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs text-muted-foreground dark:text-white/50 uppercase tracking-wider font-semibold">Subject</label>
                <select required name="subject" value={formData.subject} onChange={handleInputChange} className={styles.select}>
                  <option value="" disabled>Select a subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Booking Assistance">Booking Assistance</option>
                  <option value="Corporate Partnership">Corporate Partnership</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Billing">Billing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs text-muted-foreground dark:text-white/50 uppercase tracking-wider font-semibold">Message</label>
                <textarea required name="message" value={formData.message} onChange={handleInputChange} rows={5} className={styles.textarea} placeholder="Please describe your request in detail..." />
              </div>

            </div>

            <div className="mt-12 flex flex-col items-center">
              <button disabled={isSubmitting} type="submit" className="w-full md:w-auto bg-[#D4AF37] text-black h-14 px-12 flex items-center justify-center text-sm tracking-[0.2em] uppercase font-bold hover:bg-white transition-all duration-300 rounded-md shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] disabled:opacity-50">
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
              </button>
              <p className={`text-[11px] mt-4 text-center ${styles.submitHint}`}>We'll respond within 15 minutes during business hours.</p>
            </div>
          </form>

          {/* My Tickets Section */}
          {token && isDataLoading ? (
            <div className="flex justify-center items-center h-64 mt-24">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
                <p className="text-white font-heading font-medium">Loading History...</p>
              </div>
            </div>
          ) : token && myTickets.length > 0 ? (
            <div className="mt-24 max-w-3xl mx-auto">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-6 font-bold text-center">My Inquiry History</h3>
              <div className="relative">
                <div className={`p-10 rounded-lg relative overflow-hidden group ${styles.historyCard}`}>
                  
                  {/* Timeline Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-3 h-3 rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)] shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold block mb-1">Inquiry Submitted</span>
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <span>{new Date(myTickets[currentTicketIndex].created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{myTickets[currentTicketIndex].subject}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & ID */}
                  <div className={`flex justify-between items-center mb-8 px-4 py-3 ${styles.historyMeta}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">Status</span>
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        {myTickets[currentTicketIndex].status === 'RESOLVED' ? '🟢 Resolved' :
                         myTickets[currentTicketIndex].status === 'IN_PROGRESS' ? '🟡 In Progress' :
                         myTickets[currentTicketIndex].status === 'CLOSED' ? '🔴 Closed' :
                         '🔵 Awaiting Reply'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-white/50 uppercase tracking-widest font-semibold block mb-0.5">Ticket ID</span>
                      <span className="text-sm font-heading font-bold text-white">#VT-{myTickets[currentTicketIndex].ticket_id || Math.floor(Math.random()*9000+1000)}</span>
                    </div>
                  </div>
                  
                  {/* Original Message */}
                  <p className="text-sm text-white/70 leading-relaxed mb-8">{myTickets[currentTicketIndex].message}</p>
                  
                  {/* Concierge Reply section */}
                  {myTickets[currentTicketIndex].admin_reply && (
                    <div className="mt-8 pt-8 border-t border-white/10 relative">
                      <strong className="block text-[#D4AF37] text-xs uppercase mb-3 tracking-widest">Concierge Reply</strong>
                      <p className={`text-sm leading-relaxed font-light p-5 ${styles.replyBlock}`}>
                        {myTickets[currentTicketIndex].admin_reply}
                      </p>
                    </div>
                  )}
                  
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 blur-[60px] -z-10 rounded-full group-hover:bg-[#D4AF37]/10 transition-colors" />
                </div>
                
                {myTickets.length > 1 && (
                  <div className="flex justify-center items-center gap-6 mt-6">
                    <button 
                      onClick={() => setCurrentTicketIndex(prev => prev === 0 ? myTickets.length - 1 : prev - 1)}
                      className={styles.navBtn}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs text-white/40 tracking-widest font-bold">
                      {currentTicketIndex + 1} / {myTickets.length}
                    </span>
                    <button 
                      onClick={() => setCurrentTicketIndex(prev => prev === myTickets.length - 1 ? 0 : prev + 1)}
                      className={styles.navBtn}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

        </div>
      </section>


      {/* 5. FAQ */}
      <section className={`py-16 md:py-24 px-6 ${styles.sectionDark}`} style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <div className="container mx-auto max-w-3xl">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-primary mb-16 font-bold text-center">Frequently Asked Questions</h3>
          
          <div className="flex flex-col border-t border-border dark:border-white/10">
            {faqs.map((faq, i) => (
              <div key={i} className={styles.faqRow}>
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-10 flex justify-between items-center text-left group"
                >
                  <span className={`font-heading text-xl md:text-2xl font-light ${styles.faqQuestion}`}>{faq.q}</span>
                  <ChevronDown size={20} className={`text-muted-foreground dark:text-white/50 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className={`pb-8 font-light leading-relaxed ${styles.faqAnswer}`}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};
