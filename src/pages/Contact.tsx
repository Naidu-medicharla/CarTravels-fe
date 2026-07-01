import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight, PhoneCall, Mail, CheckCircle2 } from 'lucide-react';

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

  // Form states
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending message
    alert("Message sent! Our concierge will contact you shortly.");
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="bg-[#090909] min-h-screen font-sans text-white overflow-hidden selection:bg-[#D4AF37] selection:text-black pt-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.1.0&q=100&w=2560&auto=format&fit=crop")',
            filter: 'brightness(0.35)'
          }}
        />
        
        <div className="relative z-10 container mx-auto px-6 mt-16 text-center flex flex-col items-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center max-w-4xl">
            <motion.h3 variants={fadeInUp} className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] mb-8 font-bold">
              CONCIERGE DESK
            </motion.h3>
            <motion.h1 variants={fadeInUp} className="font-heading text-4xl md:text-6xl lg:text-[72px] leading-tight font-light mb-10 text-white/90">
              Luxury Begins<br/>With a<br/>Conversation.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-white/60 text-base md:text-lg leading-relaxed mb-12 max-w-2xl font-light">
              Speak to our dedicated concierge team. Whether you need immediate assistance, have a special request, or wish to explore corporate partnerships, we are at your service 24/7.
            </motion.p>
            <motion.button
              variants={fadeInUp}
              onClick={() => document.getElementById('contact-methods')?.scrollIntoView({ behavior: 'smooth' })}
              className="group border border-[#D4AF37]/50 bg-[#D4AF37]/5 h-14 md:h-16 px-10 flex items-center justify-center text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#D4AF37] hover:text-black transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            >
              Get In Touch
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 text-white/40 cursor-pointer"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold mb-2">Scroll</span>
          <span className="text-[10px]">↓</span>
        </motion.div>
      </section>

      {/* 2. IMMEDIATE ASSISTANCE & CONTACT METHODS */}
      <section id="contact-methods" className="py-16 md:py-24 px-6 bg-[#090909]">
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
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-8 font-bold">IMMEDIATE ASSISTANCE</h3>
              <h2 className="font-heading text-4xl md:text-5xl font-light leading-[1.2] text-white/90 mb-10">
                Need to speak with us right away?
              </h2>
              <p className="text-white/60 text-lg leading-relaxed font-light max-w-md mb-12">
                Our luxury concierge team is available 24 hours a day to handle urgent requests, modify existing reservations, and provide bespoke itinerary planning.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <a href="tel:+919876543210" className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-[#D4AF37] transition-colors">
                  <PhoneCall size={16} /> Call Now
                </a>
                <a href="mailto:hello@vibetravels.com" className="flex items-center justify-center gap-3 border border-white/20 px-8 py-4 text-xs uppercase tracking-widest font-bold hover:border-white transition-colors">
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
              <div className="w-full h-[1px] bg-white/20 mb-10" />
              
              <div className="mb-10">
                <h4 className="font-heading text-2xl text-white font-light mb-4">Concierge Hotline</h4>
                <p className="text-[#D4AF37] text-lg font-light tracking-wide mb-2">+91 98765 43210</p>
                <p className="text-white/40 text-sm uppercase tracking-widest">Available 24 Hours</p>
              </div>

              <div className="w-full h-[1px] bg-white/20 mb-10" />
              
              <div className="mb-10">
                <h4 className="font-heading text-2xl text-white font-light mb-4">Email</h4>
                <p className="text-[#D4AF37] text-lg font-light tracking-wide mb-2">hello@vibetravels.com</p>
                <p className="text-white/40 text-sm uppercase tracking-widest">Typical reply within 15 minutes</p>
              </div>

              <div className="w-full h-[1px] bg-white/20 mb-10" />
              
              <div className="mb-10">
                <h4 className="font-heading text-2xl text-white font-light mb-4">Visit</h4>
                <p className="text-[#D4AF37] text-lg font-light tracking-wide mb-2">Hyderabad, Telangana</p>
                <p className="text-white/40 text-sm uppercase tracking-widest">Luxury Chauffeur Office</p>
              </div>

              <div className="w-full h-[1px] bg-white/20" />
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* 3. SIMPLE CONCIERGE FORM */}
      <section className="py-16 md:py-24 px-6 bg-[#050505] border-y border-white/[0.05]">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-6 font-bold">INQUIRIES</h3>
            <h2 className="font-heading text-4xl md:text-5xl text-white font-light mb-12">Send a Message</h2>
            
            {/* Reassurance Strip */}
            <div className="flex flex-col items-center max-w-lg mx-auto">
              <div className="w-full h-[1px] bg-white/[0.08] mb-6" />
              <div className="flex flex-col sm:flex-row justify-between w-full text-white/50 text-xs md:text-sm font-light gap-4 sm:gap-0">
                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-[#D4AF37]" /> Replies within 15 mins</span>
                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-[#D4AF37]" /> Available 24 Hours</span>
                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-[#D4AF37]" /> Confidential</span>
              </div>
              <div className="w-full h-[1px] bg-white/[0.08] mt-6" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/[0.08] p-8 md:p-12 rounded-xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full h-14 bg-[#090909] border border-white/[0.08] rounded-md px-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors font-light" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full h-14 bg-[#090909] border border-white/[0.08] rounded-md px-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors font-light" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Phone Number</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full h-14 bg-[#090909] border border-white/[0.08] rounded-md px-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors font-light" />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Subject</label>
                <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="e.g., Corporate Partnership, Feedback, Special Event" className="w-full h-14 bg-[#090909] border border-white/[0.08] rounded-md px-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors font-light" />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Message</label>
                <textarea required name="message" value={formData.message} onChange={handleInputChange} rows={5} className="w-full bg-[#090909] border border-white/[0.08] rounded-md px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors font-light resize-none" placeholder="How can we assist you today?" />
              </div>

            </div>

            <div className="mt-12 flex justify-center">
              <button type="submit" className="w-full md:w-auto bg-[#D4AF37] text-black h-14 px-12 flex items-center justify-center text-sm tracking-[0.2em] uppercase font-bold hover:bg-white transition-all duration-300 rounded-md shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                Contact Concierge
              </button>
            </div>
          </form>
        </div>
      </section>


      {/* 5. FAQ */}
      <section className="py-16 md:py-24 px-6 bg-[#050505] border-t border-white/[0.05]">
        <div className="container mx-auto max-w-3xl">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-16 font-bold text-center">Frequently Asked Questions</h3>
          
          <div className="flex flex-col border-t border-white/10">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-white/10">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-8 flex justify-between items-center text-left group"
                >
                  <span className="font-heading text-xl md:text-2xl font-light text-white/90 group-hover:text-[#D4AF37] transition-colors">{faq.q}</span>
                  <ChevronDown size={20} className={`text-white/50 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-[#D4AF37]' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-8 text-white/60 font-light leading-relaxed">
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
