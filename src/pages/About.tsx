import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserCheck, CarFront, Navigation, Phone, ArrowRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import bgImage from '@/assets/bg.png';
import aboutBg from '@/assets/about_bg.jpg';
import entireBg from '@/assets/entire_bg.jpg';
import styles from './About.module.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export const About: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredFleet, setHoveredFleet] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { theme } = useTheme();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fleetBrands = [
    { name: 'Mercedes-Benz', model: 'S-Class', category: 'Executive Sedan' },
    { name: 'BMW', model: '5 Series', category: 'Business Class' },
    { name: 'Toyota', model: 'Fortuner', category: 'Luxury SUV' },
    { name: 'Honda', model: 'City', category: 'Executive Sedan' },
    { name: 'Kia', model: 'Carens', category: 'Premium MPV' }
  ];

  const testimonials = [
    {
      text: "True luxury is never worrying about the journey.",
      author: "Rahul Mehta",
      role: "Corporate Executive",
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      text: "Flawless execution from booking to drop-off. The vehicles are pristine.",
      author: "Priya Sharma",
      role: "Event Organizer",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
      text: "True luxury is not having to worry about a single detail. They deliver exactly that.",
      author: "Amit Patel",
      role: "Business Traveler",
      avatar: "https://i.pravatar.cc/150?img=8"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className={`min-h-[100dvh] font-sans overflow-hidden selection:bg-[#D4AF37] selection:text-black ${styles.page}`}>

      {/* SECTION 1: HERO (Cinematic Opening) */}
      <section className="relative h-[92vh] w-full flex items-center overflow-hidden">
        {/* Background Car - Slow Zoom Animation */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-cover bg-[position:center] bg-no-repeat"
          style={{
            backgroundImage: `url(${aboutBg})`,
            filter: theme === 'light' ? 'none' : 'blur(0px)'
          }}
        />
        {/* Left-side text legibility gradient */}
        <div className={`absolute inset-0 w-full md:w-3/4 pointer-events-none ${styles.heroGradient}`} />
        {/* Bottom Fade Gradient to remove hard cut (shorter) */}
        <div className={`absolute inset-x-0 bottom-0 h-24 md:h-32 pointer-events-none ${styles.sectionBorder}`} style={{ background: 'linear-gradient(to top, var(--color-bg-page), transparent)' }} />

        {/* Subtle Gold Glow from Bottom-Right */}
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 container mx-auto px-6 mt-16 md:mt-24">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-start max-w-2xl">
            <motion.h1 variants={fadeInUp} className="font-heading text-[60px] md:text-[80px] lg:text-[100px] leading-[0.9] uppercase tracking-tighter font-light mb-8 md:mb-6 text-white/90">
              ABOUT
            </motion.h1>

            <motion.div variants={fadeInUp} className="mb-10 md:mb-8">
              <h2 className="text-[#D4AF37] text-xl md:text-2xl font-serif italic mb-1 tracking-wide">Driven by Trust.</h2>
              <h2 className="text-[#D4AF37] text-xl md:text-2xl font-serif italic tracking-wide">Powered by Luxury.</h2>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-white/70 text-sm md:text-base leading-[1.8] font-light mb-8 md:mb-6 max-w-[280px] md:max-w-md">
              Luxury transportation crafted for people who expect more than just a ride. Experience comfort, absolute discretion, and flawless punctuality.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3 text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-14 md:mb-12">
              <span className="flex items-center gap-1">★ 4.9 Rating</span>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span>5000+ Journeys</span>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span>Available 24/7</span>
            </motion.div>

            <motion.button
              variants={fadeInUp}
              onClick={() => navigate('/book')}
              className="group border border-white/30 text-white px-8 py-4 h-14 flex items-center gap-3 text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-500"
            >
              <span>Reserve Your Journey</span>
              <ArrowRight size={16} className="transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 text-white/40"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold mb-2">Scroll</span>
          <span className="text-[10px]">↓</span>
        </motion.div>
      </section>

      {/* SECTION 2: OUR STORY (Two Columns) */}
      <section className="py-16 px-6 bg-[#050505]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-8 font-bold">Our Story</h3>
              <h2 className="font-heading text-3xl md:text-5xl font-light leading-[1.3] text-white/90 mb-8">
                For over a decade, Vibe Travels has delivered premium chauffeur experiences.
              </h2>
              <p className={`text-base md:text-lg leading-relaxed font-light ${styles.bodyText}`}>
                Across airports, weddings, corporate travel and exclusive events, we have built a reputation for uncompromising excellence.
              </p>
              <p className="text-white/80 font-serif italic text-lg md:text-xl">
                Every vehicle. Every chauffeur. Every journey. Chosen to exceed expectations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="relative h-[500px] md:h-[600px] w-full mt-8 md:mt-0"
            >
              <img
                src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?ixlib=rb-4.1.0&q=100&w=1000&auto=format&fit=crop"
                alt="Chauffeur interior"
                className="w-full h-full object-cover filter contrast-125 brightness-75"
              />
              <div className="absolute inset-0 border border-[#D4AF37]/20 m-2 md:m-4" />
            </motion.div>

          </div>
        </div>
      </section>


      {/* COMBINED CINEMATIC SECTION (Our People, Fleet, Promise) */}
      <div 
        className="relative w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${entireBg})` }}
      >
        <div className="absolute inset-0 bg-black/75 z-0 pointer-events-none" />

        {/* SECTION 4: OUR PEOPLE (Left Aligned) */}
        <section className="relative w-full md:min-h-[70vh] flex items-center justify-start overflow-hidden bg-transparent py-20 md:py-24">
          <div className="relative z-10 container mx-auto px-6 text-left flex flex-col items-start justify-center h-full ml-0 lg:ml-24">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="max-w-2xl flex flex-col items-start mt-8 md:mt-0">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-6 font-bold">Our People</h3>
              <h2 className="font-heading text-[40px] md:text-6xl text-white mb-8 font-light leading-tight">Professional Chauffeurs</h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed mb-12 max-w-xl">
                Rigorously vetted, highly experienced, and impeccably groomed. Our chauffeurs are masters of discretion, trained to provide a seamless, secure, and world-class environment for every journey.
              </p>
              <button onClick={() => navigate('/services')} className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-[#D4AF37] text-white transition-colors pb-1 border-b border-transparent hover:border-[#D4AF37]">
                DISCOVER MORE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* SECTION 5: OUR FLEET (Center Aligned) */}
        <section className="relative w-full md:min-h-[70vh] flex items-center justify-center overflow-hidden bg-transparent py-20 md:py-24 border-t border-white/10">
          <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="max-w-3xl flex flex-col items-center">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-6 font-bold">The Collection</h3>
              <h2 className="font-heading text-4xl md:text-6xl text-white mb-8 font-light leading-tight">Uncompromised Luxury</h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed mb-12 max-w-xl">
                A meticulously curated selection of world-class vehicles. From elegant Mercedes sedans to commanding premium SUVs, every car in our fleet is maintained to pristine showroom perfection.
              </p>
              <button onClick={() => navigate('/cars')} className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-[#D4AF37] text-white transition-colors pb-1 border-b border-transparent hover:border-[#D4AF37]">
                EXPLORE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* SECTION 6: OUR PROMISE (Right Aligned) */}
        <section className="relative w-full md:min-h-[70vh] flex items-center justify-end overflow-hidden bg-transparent py-20 md:py-24 border-t border-white/10">
          <div className="relative z-10 container mx-auto px-6 text-right flex flex-col items-end mr-0 lg:mr-24">
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="max-w-2xl flex flex-col items-end">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-6 font-bold">Our Promise</h3>
              <h2 className="font-heading text-4xl md:text-6xl text-white mb-8 font-light leading-tight">Always On Time</h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed mb-12 max-w-xl">
                Whether it's a late-night airport pickup or an early morning executive transfer, our dispatch team is ready 24/7. Transparent pricing, flawless punctuality, and zero compromises.
              </p>
              <button onClick={() => navigate('/cars')} className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-[#D4AF37] text-white transition-colors pb-1 border-b border-transparent hover:border-[#D4AF37]">
                CONTINUE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>
      </div>



      {/* SECTION 6: PREMIUM FLEET SHOWCASE */}
      <section className="py-16 md:py-24 px-6 bg-[#050505] relative overflow-hidden">
        {/* Single Premium Background */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?ixlib=rb-4.1.0&q=100&w=2560&auto=format&fit=crop")',
            filter: theme === 'light' ? 'none' : 'contrast(1.1) brightness(0.25) saturate(0)' // Monochromatic base
          }}
        />

        {/* Dynamic color pop on hover */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-1000"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?ixlib=rb-4.1.0&q=100&w=2560&auto=format&fit=crop")',
            filter: theme === 'light' ? 'none' : 'contrast(1.1) brightness(0.4)',
            opacity: hoveredFleet !== null ? 1 : 0
          }}
        />

        <div className="relative z-10 container mx-auto flex flex-col items-center">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-16 font-bold">THE VIBE COLLECTION</h3>

          <div className="flex flex-col items-center w-full max-w-4xl">
            {fleetBrands.map((brand, i) => {
              const isHovered = hoveredFleet === i;
              return (
                <div
                  key={i}
                  className="w-full border-t border-white/10 hover:border-white/40 transition-colors duration-300 py-8 flex flex-col md:flex-row items-center justify-between cursor-pointer group gap-2 md:gap-0"
                  onMouseEnter={() => setHoveredFleet(i)}
                  onMouseLeave={() => setHoveredFleet(null)}
                  onClick={() => navigate('/cars')}
                >
                  <h2 className={`font-heading text-[32px] md:text-[60px] lg:text-[80px] leading-none uppercase tracking-tight transition-all duration-500 ${isHovered ? 'text-white' : 'text-white/60 md:text-white/20 group-hover:text-white/50'}`}>
                    {brand.name}
                  </h2>
                  <div className={`flex flex-col items-center md:items-end transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-60 md:opacity-0 md:group-hover:opacity-100'}`}>
                    <span className="text-white text-lg md:text-2xl font-light">{brand.model}</span>
                    <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold mt-1">{brand.category}</span>
                  </div>
                </div>
              );
            })}
            <div className="w-full border-t border-white/10" />
          </div>
        </div>
      </section>

      {/* SECTION 7: JOURNEY TIMELINE */}
      <section className={`py-32 relative ${styles.page}`}>
        <div className="container mx-auto">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-20 text-center font-bold">The Vibe Journey</h3>

          <div className="relative max-w-5xl mx-auto px-4 md:px-0">
            {/* Animated background line */}
            <div className={`absolute left-[7px] top-6 bottom-[-24px] w-[2px] ${styles.timelineConnector}`} />

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-[24px] left-0 h-[2px] bg-[#D4AF37]"
            />

            <div className="relative z-10 flex justify-between items-start w-full">
              {[
                { label: 'Book', icon: <CheckCircle2 size={20} /> },
                { label: 'Confirm', icon: <CheckCircle2 size={20} /> },
                { label: 'Chauffeur', icon: <UserCheck size={20} /> },
                { label: 'Pickup', icon: <CarFront size={20} /> },
                { label: 'Enjoy Journey', icon: <Navigation size={20} /> }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-6 bg-[#050505] px-2 md:px-6 relative group">
                  <div className={`absolute left-0 top-1 w-[16px] h-[16px] rounded-full mt-1.5 ${styles.timelineDot}`} />
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (i * 0.2), type: "spring" }}
                    className="w-12 h-12 rounded-full bg-[#050505] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-colors duration-300"
                  >
                    {step.icon}
                  </motion.div>
                  <span className="text-xs md:text-sm font-sans tracking-wide text-white/80 hidden md:block text-center">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: WHAT MAKES US DIFFERENT (Magazine Layout) */}
      <section className="py-16 px-6 bg-[#050505]">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-16 text-center">Why Choose Vibe</h3>

          <div className="flex flex-col gap-6">
            {[
              { title: "Professional Chauffeurs", desc: "Experienced licensed drivers." },
              { title: "Luxury Fleet", desc: "Premium maintained vehicles." },
              { title: "Airport Specialists", desc: "Always on time." },
              { title: "24/7 Support", desc: "Concierge level assistance." }
            ].map((feature, i) => (
              <div key={i} className="border-b border-white/10 pb-6 group cursor-default">
                <div className="flex items-center gap-4 mb-2">
                  <CheckCircle2 size={18} className="text-[#D4AF37]" />
                  <span className="font-heading text-2xl font-light text-white/90">
                    {feature.title}
                  </span>
                </div>
                <p className="text-white/50 text-sm ml-8">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: TESTIMONIALS (Slider with Photos) */}
      <section className={`py-32 ${styles.sectionAlt} ${styles.sectionBorder}`}>
        <div className="container mx-auto max-w-4xl text-center">

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center min-h-[300px]"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 mb-6">
                <img src={testimonials[activeTestimonial].avatar} alt="Client" className="w-full h-full object-cover grayscale opacity-80" />
              </div>

              <div className="text-[#D4AF37] mb-6 text-xl md:text-2xl tracking-[0.2em]">
                ★★★★★
              </div>

              <h3 className="font-heading text-2xl md:text-4xl font-light leading-relaxed text-white/90 mb-10 italic px-4">
                "{testimonials[activeTestimonial].text}"
              </h3>

              <div className="flex flex-col items-center gap-2">
                <p className={`text-sm uppercase tracking-widest font-bold mb-4 ${styles.teamRole}`}>— {testimonials[activeTestimonial].author}, {testimonials[activeTestimonial].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-[#D4AF37] w-8' : 'bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>

        </div>
      </section>



      {/* SECTION 11: CTA */}
      <section className={`py-24 relative z-10 ${styles.sectionAlt}`}>
        <div className="container mx-auto text-center flex flex-col items-center">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-8 font-bold">Ready For Your Next Journey?</h3>
          <h2 className="font-heading text-4xl md:text-6xl font-light leading-tight mb-16 text-white/90">
            Reserve your chauffeur today.
          </h2>

          <div className="flex flex-col sm:flex-row gap-6">
            <button
              onClick={() => navigate('/cars')}
              className="px-10 py-5 bg-white text-black text-[10px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-[#D4AF37] hover:scale-105 duration-300"
            >
              Reserve Journey
            </button>
            <a
              href="tel:+919876543210"
              className="px-10 py-5 bg-transparent border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-white/10 flex items-center justify-center gap-3"
            >
              <Phone size={14} />
              Call Now
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
