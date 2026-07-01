import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, CheckCircle2, ArrowRight, ChevronDown, Star, CarFront, BadgeCheck, Headset, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

import bgImage from '@/assets/bg.png';
import starImage from '@/assets/star.png';

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
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonials = [
    { text: "Excellent service. Driver was punctual and the car was immaculate.", author: "Rahul, Hyderabad", rating: 5 },
    { text: "A truly luxury experience. Will definitely book again for my next business trip.", author: "Priya, Bangalore", rating: 5 },
    { text: "Transparent pricing and premium fleet. The best travel service I've used.", author: "Amit, Mumbai", rating: 5 }
  ];

  return (
    <div className="bg-background min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center pt-20 md:pt-24 pb-12 overflow-hidden">
        {/* Cinematic Background Image & Gradient */}
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0 bg-cover bg-[85%_center] md:bg-[85%_center]"
          style={{ 
            backgroundImage: `url(${bgImage})`
          }}
        />
        
        {/* Fog/Vignette Overlays */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />

        <div className="container px-6 md:px-8 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-7 max-w-2xl lg:ml-12"
          >
            <motion.div variants={fadeInUp} className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 overflow-hidden group">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <img src={starImage} alt="star" className="w-4 h-4 relative z-10" />
              <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase relative z-10">Premium Travel Service</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] md:leading-[1.1] mb-6 md:mb-8 drop-shadow-2xl">
              <span className="text-white font-light tracking-wide">Premium Travel,</span><br />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] italic">Perfectly Timed.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-base md:text-lg text-white/80 leading-[1.8] mb-48 md:mb-12 max-w-[320px] md:max-w-md font-light">
              Experience seamless airport transfers, outstation journeys, corporate travel, and premium chauffeur services with Vibe Travels. Every ride is designed for comfort, reliability, and elegance.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center max-w-[320px] sm:max-w-none">
              <Button onClick={() => navigate('/cars')} size="lg" className="bg-primary text-black hover:bg-primary/90 hover:shadow-[0_20px_40px_rgba(212,175,55,0.3)] hover:-translate-y-1 font-bold px-8 h-14 w-[260px] sm:w-auto rounded-full transition-all duration-300 group">
                Book Your Ride <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => navigate('/cars')} size="lg" variant="ghost" className="text-white hover:text-primary bg-white/5 border border-white/10 hover:bg-white/10 h-14 px-6 w-[260px] sm:w-auto rounded-full font-medium transition-colors group relative overflow-hidden">
                View Fleet
                <div className="absolute bottom-3 left-6 right-6 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mt-12 flex flex-col items-start gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Customer" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center text-primary mb-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                  <span className="text-white font-bold text-sm ml-2">4.9</span>
                </div>
                <span className="text-xs text-white/50">Trusted by 12,000+ Customers</span>
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/40 hover:text-primary transition-colors cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-xs uppercase tracking-[0.2em] mb-2 font-medium">Explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>

      </section>


      {/* Why Choose Us */}
      <section className="py-16 md:py-24 border-t border-white/5 bg-white/[0.01]">
        <div className="container px-6 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading font-medium text-3xl md:text-4xl text-white mb-4">Why <span className="text-primary">Vibe Travels</span></h2>
            <p className="text-muted-foreground text-base md:text-lg">We don't just rent cars; we provide a premium lifestyle experience.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: <CarFront size={20} className="text-primary" />, title: "Luxury Fleet", desc: "Top-tier vehicles from world-class brands." },
              { icon: <BadgeCheck size={20} className="text-primary" />, title: "Verified Drivers", desc: "Professional, vetted, and courteous chauffeurs." },
              { icon: <Headset size={20} className="text-primary" />, title: "24/7 Support", desc: "Round the clock support for your peace of mind." },
              { icon: <IndianRupee size={20} className="text-primary" />, title: "Transparent Pricing", desc: "No hidden charges, pure premium value." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="glass-panel p-6 rounded-2xl border-white/5 hover:border-primary/30 transition-colors group flex flex-col items-center text-center md:items-start md:text-left"
              >
                <div className="w-12 h-12 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-bold text-lg text-white mb-2">{feature.title}</h3>
                <p className="text-base text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 border-t border-white/5 bg-[#0a0a0a]">
        <div className="container px-6 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">How It <span className="text-primary">Works</span></h2>
            <p className="text-muted-foreground text-base md:text-lg">Your dream ride is just a few clicks away.</p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {[
              { step: "①", title: "Choose Car" },
              { step: "②", title: "Select Date" },
              { step: "③", title: "Secure Payment" },
              { step: "④", title: "Enjoy Ride" }
            ].map((item, i) => (
              <React.Fragment key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="w-full md:w-48 p-4 rounded-xl glass-panel flex items-center justify-center gap-3 hover:border-primary/50 transition-colors"
                >
                  <span className="text-xl text-primary">{item.step}</span>
                  <span className="font-bold text-white text-sm md:text-base">{item.title}</span>
                </motion.div>
                {i < 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                    className="w-px h-6 bg-primary/40 md:w-8 md:h-px my-1 md:my-0"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 border-t border-white/5 bg-white/[0.02]">
        <div className="container px-6 md:px-8 max-w-3xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex justify-center gap-1 mb-6 text-primary">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[160px] py-8 px-6 md:px-12 glass-panel rounded-3xl mx-auto max-w-2xl flex flex-col justify-center cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = offset.x;
                  if (swipe < -50) {
                    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
                  } else if (swipe > 50) {
                    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
                  }
                }}
              >
                <p className="text-xl md:text-2xl text-white font-medium italic mb-8 leading-relaxed">"{testimonials[activeTestimonial].text}"</p>
                <p className="text-base text-primary uppercase tracking-widest font-bold">— {testimonials[activeTestimonial].author}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'bg-primary w-6' : 'bg-white/20'}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  );
};
