import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, CheckCircle2, ArrowRight, ChevronDown, Star, CarFront, BadgeCheck, Headset, IndianRupee, Car, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

import bgImage from '@/assets/bg.jpg';
import lightBgImage from '@/assets/light_bg.jpg';
import starImage from '@/assets/star.png';
import styles from './Home.module.css';
import { useTheme } from '@/context/ThemeContext';



const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonials = [
    { text: "Excellent service. Driver was punctual and the car was immaculate.", author: "Rahul, Hyderabad", rating: 5 },
    { text: "A truly luxury experience. Will definitely book again for my next business trip.", author: "Priya, Bangalore", rating: 5 },
    { text: "Transparent pricing and premium fleet. The best travel service I've used.", author: "Amit, Mumbai", rating: 5 }
  ];

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center pt-20 md:pt-24 pb-12 overflow-hidden">
        {/* Cinematic Background Image & Gradient */}
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-center dark:bg-[position:30%_center] dark:md:bg-[position:calc(130%_+_60px)_center]"
          style={{
            backgroundImage: `url(${theme === 'light' ? lightBgImage : bgImage})`,
            filter: theme === 'light' ? 'none' : 'brightness(0.8)'
          }}
        />

        {/* Warm Overlays */}
        <div className={`absolute left-0 top-0 bottom-0 w-full md:w-[60%] lg:w-[55%] z-0 pointer-events-none ${styles.heroGradientOverlay}`} />

        <div className="container px-6 md:px-8 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className={`lg:col-span-7 max-w-2xl lg:ml-12 ${styles.heroGlassPanel}`}
          >
            <motion.div variants={fadeInUp} className={`relative inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 ${styles.heroBadge}`}>
              <span className="text-[10px] font-medium text-foreground tracking-[0.25em] uppercase">EST. 2026 | Luxury Chauffeur Service</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className={`font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.25] md:leading-[1.2] mb-6 md:mb-8 ${styles.heroTextShadow}`}>
              <span className="text-foreground font-light tracking-wide">Premium Travel,</span><br />
              <span className="font-light text-primary italic">Perfectly Timed.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-base md:text-lg text-foreground dark:text-muted-foreground leading-[1.9] mb-10 max-w-[320px] md:max-w-md font-medium md:font-semibold dark:font-light dark:md:font-light">
              Experience seamless airport transfers, outstation journeys, corporate travel, and premium chauffeur services with Vibe Travels. Every ride is designed for comfort, reliability, and elegance.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center max-w-[320px] sm:max-w-none">
              <Button onClick={() => navigate('/cars')} size="lg" className="bg-primary text-black hover:bg-primary/90 font-medium px-8 h-14 w-[260px] sm:w-auto rounded-full transition-all duration-300 group">
                Reserve Journey <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => navigate('/cars')} size="lg" variant="ghost" className={`h-14 px-6 w-[260px] sm:w-auto rounded-full font-light transition-colors ${styles.heroGhostBtn}`}>
                View Fleet
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className={`mt-12 pt-8 flex flex-col items-start gap-4 ${styles.heroSeparator}`}>
              <div className="flex items-center text-primary mb-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                <span className="text-foreground dark:text-white font-bold dark:font-medium text-sm ml-3">4.9</span>
                <span className="text-foreground dark:text-muted-foreground font-semibold dark:font-normal text-sm ml-2">| 12,000+ Satisfied Travelers</span>
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-foreground dark:text-muted-foreground font-bold dark:font-normal flex flex-wrap gap-x-4 gap-y-2">
                <span>Corporate</span>
                <span className="opacity-30 dark:opacity-100 dark:text-white/20">|</span>
                <span>Airport</span>
                <span className="opacity-30 dark:opacity-100 dark:text-white/20">|</span>
                <span>Wedding</span>
                <span className="opacity-30 dark:opacity-100 dark:text-white/20">|</span>
                <span>Executive</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating Stats - Desktop Only */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="hidden lg:flex lg:col-span-5 flex-col gap-4 items-end justify-center pr-12"
          >
            {[
              { value: "150+", label: "Luxury Vehicles" },
              { value: "24/7", label: "Availability" },
              { value: "10+", label: "Cities" }
            ].map((stat, i) => (
              <div key={i} className="px-8 py-5 w-[220px] text-right">
                <div className="text-2xl font-heading text-primary font-bold dark:font-normal mb-1">{stat.value}</div>
                <div className="text-[11px] dark:text-[10px] uppercase tracking-widest text-foreground dark:text-muted-foreground font-bold dark:font-normal">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-foreground/80 dark:text-white/40 hover:text-primary transition-colors cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-xs uppercase tracking-[0.2em] mb-2 font-bold dark:font-medium">Discover</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>

        {/* Seamless Bottom Gradient Blend */}
        <div className={`absolute bottom-0 left-0 right-0 h-48 z-0 pointer-events-none ${styles.heroFadeBottom}`} />
      </section>


      {/* Immersive Video Section (Luxury Difference & Booking Journey) */}
      <section className={`relative w-full ${styles.videoSection}`}>
        {/* Seamless Top Gradient Blend */}
        <div className={`absolute top-0 left-0 right-0 h-48 z-10 pointer-events-none ${styles.videoFadeTop}`} />
        
        {/* Persistent Background Video (Scrolling with content) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-top filter brightness-[0.20] scale-105"
          >
            <source src="/luxury.mp4?v=1" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Subtle gradient overlay to blend edges if needed */}
          <div className={`absolute inset-0 ${styles.videoOverlay}`} />
        </div>
        
        {/* Content Layers (scrolling normally) */}
        <div className="relative z-10">
          {/* The Luxury Difference Content */}
          <div className="w-full min-h-[60vh] md:min-h-[100dvh] flex items-center justify-center py-20 md:py-32">
            <div className="container px-6 md:px-8 text-center max-w-4xl mx-auto mt-12 md:mt-0">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
                <h2 className="font-heading font-medium text-4xl md:text-6xl text-white mb-6 md:mb-8 drop-shadow-lg">The <span className="text-primary">Luxury Difference</span></h2>
                <p className="text-white/90 text-base md:text-2xl leading-relaxed mb-8 md:mb-12 font-light drop-shadow-md">
                  Experience seamless airport transfers, outstation journeys, corporate travel, and premium chauffeur services. Every ride is designed for comfort, reliability, and elegance, ensuring your journey is as exceptional as your destination.
                </p>
                <Button onClick={() => navigate('/cars')} className="bg-primary text-black hover:bg-primary/90 hover:scale-105 font-bold tracking-widest uppercase h-14 px-12 rounded-none transition-all duration-300">
                  Explore Fleet
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Booking Journey Timeline Content - Minimal Editorial Luxury */}
          <div className="w-full min-h-[100dvh] flex items-center justify-center py-24 md:py-40">
            <div className="container px-4 md:px-8 w-full max-w-4xl mx-auto flex flex-col items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20 md:mb-32">
                <h2 className="font-heading font-medium text-4xl md:text-5xl lg:text-[64px] text-[#F5F5F5] tracking-tight drop-shadow-lg leading-tight mx-auto max-w-none">Your <span className="text-[#C9A227]">Journey</span> Starts Here</h2>
              </motion.div>
          
              <div className="relative w-full flex flex-col items-center">
                {/* Center Gold Line */}
                <motion.div 
                  initial={{ height: 0 }} whileInView={{ height: '100%' }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-0 w-px bg-[#C9A227]/50 z-0 origin-top"
                />

                {[
                  { icon: <Car size={26} strokeWidth={1.5} />, title: "Select Vehicle", desc: "Choose from our premium fleet." },
                  { icon: <Calendar size={26} strokeWidth={1.5} />, title: "Schedule Date", desc: "Choose pickup and destination." },
                  { icon: <CheckCircle size={26} strokeWidth={1.5} />, title: "Confirm Booking", desc: "Secure online payment." },
                  { icon: <Sparkles size={26} strokeWidth={1.5} />, title: "Enjoy Ride", desc: "Relax while your chauffeur handles everything." }
                ].map((item, i) => {
                  const isLeft = i % 2 === 0;
                  return (
                    <div key={i} className="relative z-10 w-full flex items-center justify-center mb-[130px] md:mb-[150px] last:mb-0">
                      
                      {/* Left Content */}
                      <div className="flex-1 flex justify-end pr-6 md:pr-16">
                        {isLeft && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-right max-w-[200px] md:max-w-[220px]"
                          >
                            <h4 className="font-sans text-[#F5F5F5] font-semibold text-[12px] md:text-[14px] uppercase tracking-[0.2em] mb-2 md:mb-3">{item.title}</h4>
                            <p className="font-sans text-[rgba(255,255,255,0.78)] text-xs md:text-sm font-light leading-relaxed">{item.desc}</p>
                          </motion.div>
                        )}
                      </div>

                      {/* Center Icon (Glowing when active) */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, boxShadow: "0px 0px 0px rgba(201,162,39,0)" }} 
                        whileInView={{ opacity: 1, scale: 1, boxShadow: "0px 0px 25px rgba(201,162,39,0.25)" }} 
                        viewport={{ once: true, margin: "-100px" }} 
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className={`w-[64px] h-[64px] md:w-[72px] md:h-[72px] shrink-0 rounded-full flex items-center justify-center z-10 relative ${styles.timelineIcon}`}
                      >
                        {item.icon}
                      </motion.div>

                      {/* Right Content */}
                      <div className="flex-1 flex justify-start pl-6 md:pl-16">
                        {!isLeft && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-left max-w-[200px] md:max-w-[220px]"
                          >
                            <h4 className="font-sans text-[#F5F5F5] font-semibold text-[12px] md:text-[14px] uppercase tracking-[0.2em] mb-2 md:mb-3">{item.title}</h4>
                            <p className="font-sans text-[rgba(255,255,255,0.78)] text-xs md:text-sm font-light leading-relaxed">{item.desc}</p>
                          </motion.div>
                        )}
                      </div>
                      
                    </div>
                  );
                })}
              </div>
              
              {/* Timeline CTA */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-32 md:mt-40 text-center flex flex-col items-center"
              >
                <h3 className="font-heading text-4xl md:text-5xl text-[#F5F5F5] mb-10 drop-shadow-lg">Your Chauffeur Awaits</h3>
                <Button onClick={() => navigate('/cars')} className="bg-transparent border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#050505] transition-all duration-500 text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] h-14 px-12 rounded-none">
                  Reserve Your Ride
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Large Testimonial Showcase Content */}
          <div className="w-full min-h-[60vh] md:min-h-[100dvh] flex items-center justify-center py-20 md:py-32">
            <div className="container px-6 max-w-5xl text-center">
              <div className="text-primary text-8xl font-heading mb-4 opacity-60 h-16 leading-none">"</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="min-h-[250px] flex flex-col justify-center cursor-grab active:cursor-grabbing"
                  drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={1}
                  onDragEnd={(e, { offset }) => {
                    if (offset.x < -50) setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
                    else if (offset.x > 50) setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
                  }}
                >
                  <h3 className="text-2xl md:text-4xl text-[#F5F5F5] font-light italic leading-relaxed mb-12 drop-shadow-lg">
                    {testimonials[activeTestimonial].text}
                  </h3>
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-1 text-[#C9A227] mb-3 drop-shadow-md">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                    </div>
                    <p className="text-[#C9A227] font-bold uppercase tracking-widest text-sm drop-shadow-md">— {testimonials[activeTestimonial].author}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-4 mt-12">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setActiveTestimonial(i)} className={`w-12 h-1 transition-all duration-300 ${i === activeTestimonial ? 'bg-[#C9A227]' : 'bg-[#C9A227]/20 hover:bg-[#C9A227]/50'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
