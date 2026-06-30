import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, CheckCircle2, ArrowRight, ChevronDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

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
  const [pickupLocation, setPickupLocation] = useState('Hyderabad, IN');
  const [dropLocation, setDropLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  const handleSearch = () => {
    navigate(`/book?type=rental&pickup=${pickupDate}&return=${returnDate}`);
  };
  return (
    <div className="bg-background min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
        {/* Cinematic Background Image & Gradient */}
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {/* Fog/Vignette Overlays - Lightened for better car visibility */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#050505] via-black/40 to-transparent" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/10" />
        <div className="absolute inset-0 z-0 bg-black/10" />
        
        


        <div className="container relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          
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
            
            <motion.h1 variants={fadeInUp} className="font-heading text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-8 drop-shadow-2xl">
              <span className="text-white font-light tracking-wide">Premium Travel,</span><br/>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] italic">Perfectly Timed.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg text-white/70 leading-[1.8] mb-12 max-w-md font-light">
              Experience seamless airport transfers, outstation journeys, corporate travel, and premium chauffeur services with Vibe Travels. Every ride is designed for comfort, reliability, and elegance.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 items-center">
              <Button onClick={() => navigate('/cars')} size="lg" className="bg-primary text-black hover:bg-primary/90 hover:shadow-[0_20px_40px_rgba(212,175,55,0.3)] hover:-translate-y-1 font-bold px-8 h-14 rounded-full transition-all duration-300 group">
                Book Your Ride <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => navigate('/cars')} size="lg" variant="ghost" className="text-white hover:text-primary hover:bg-white/5 h-14 px-6 rounded-full font-medium transition-colors group relative overflow-hidden">
                View Fleet
                <div className="absolute bottom-3 left-6 right-6 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Customer" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center text-primary mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
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


      {/* Stats Section */}
      <section className="py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-white/5 text-center">
            {[
              { num: "500+", label: "Available Cars" },
              { num: "25K+", label: "Happy Customers" },
              { num: "100+", label: "Professional Drivers" },
              { num: "24/7", label: "Customer Support" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="font-heading font-bold text-4xl text-primary mb-2">{stat.num}</span>
                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Why Choose Us & How It Works */}
      <section className="py-24 border-t border-white/5 bg-white/[0.01]">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Why Choose Us */}
            <div>
              <h2 className="font-heading font-medium text-4xl text-white mb-4">Why <span className="text-primary">Vibe Travels</span></h2>
              <p className="text-muted-foreground mb-12">We don&apos;t just rent cars; we provide a premium lifestyle experience.</p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: "Luxury Fleet", desc: "Top-tier vehicles from world-class brands." },
                  { title: "Verified Drivers", desc: "Professional, vetted, and courteous chauffeurs." },
                  { title: "24/7 Assistance", desc: "Round the clock support for your peace of mind." },
                  { title: "Transparent Pricing", desc: "No hidden charges, pure premium value." }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="glass-panel p-6 rounded-2xl border-white/5 hover:border-primary/30 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={24} className="text-primary" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="relative">
              <h2 className="font-heading font-bold text-4xl text-white mb-4">How It <span className="text-primary">Works</span></h2>
              <p className="text-muted-foreground mb-12">Your dream ride is just a few clicks away.</p>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/20 before:to-transparent">
                {[
                  { step: "1", title: "Choose Your Car", desc: "Select from our premium fleet." },
                  { step: "2", title: "Select Dates & Location", desc: "Tell us when and where." },
                  { step: "3", title: "Confirm & Pay", desc: "Secure payment gateway." },
                  { step: "4", title: "Enjoy the Ride", desc: "Experience pure luxury." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-background text-muted-foreground font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:border-primary group-hover:text-primary transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10">
                      {item.step}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass-panel p-4 rounded-xl">
                      <h4 className="font-heading font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
