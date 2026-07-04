import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import airportBg from '../assets/services/airport.png';
import outstationBg from '../assets/services/outstation.png';
import templeBg from '../assets/services/temple.png';
import familyBg from '../assets/services/family.jpg';

type SpecPosition = 'top-left' | 'top-right' | 'bottom-right' | 'center-right' | 'bottom-center';

interface ExperienceData {
  id: string;
  shortName: string;
  titleLines: string[];
  thirdLine: string;
  description: string;
  price: string;
  bgImage: string;
  vehicle: string;
  vehicleType: string;
  specPosition: SpecPosition;
  imageFilter?: string;
  customOverlay?: React.ReactNode;
}

const EXPERIENCES: ExperienceData[] = [
  {
    id: 'airport',
    shortName: 'Airport',
    titleLines: ['Airport', 'Transfers'],
    thirdLine: 'For Every Flight.',
    description: 'Never miss a flight. Enjoy seamless, punctual, and stress-free airport pick-ups and drop-offs in absolute luxury.',
    price: '1,500',
    bgImage: airportBg, 
    vehicle: 'Mercedes S-Class',
    vehicleType: 'Luxury Sedan',
    specPosition: 'top-right',
    imageFilter: 'saturate(65%) contrast(95%) sepia(10%)',
    customOverlay: (
      <>
        {/* 1. Matte Blacks (The "Lift") - prevents any pixel from being darker than #0f1115 */}
        <div className="absolute inset-0 bg-[#0f1115] mix-blend-lighten opacity-90" />
        
        {/* 2. Warm Shadows - pushes darks into a subtle amber/brown */}
        <div className="absolute inset-0 bg-[#3a2000] mix-blend-multiply opacity-30" />
        
        {/* 3. Teal Highlights / Soft Bloom - adds cyan to brights and blooms them */}
        <div className="absolute inset-0 bg-[#00e5ff] mix-blend-color-dodge opacity-[0.04]" />
        
        {/* 4. Film Grain - true fractal noise overlay (Reduced opacity for better quality) */}
        <div 
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </>
    )
  },
  {
    id: 'wedding',
    shortName: 'Wedding',
    titleLines: ['Wedding', 'Services'],
    thirdLine: 'Your Perfect Entrance.',
    description: 'Impeccably maintained luxury sedans for your special day, complete with elegant decorations and professional chauffeurs.',
    price: '5,000',
    bgImage: 'https://images.unsplash.com/photo-1599912027611-484b9fc447af?ixlib=rb-4.1.0&q=100&w=2560&auto=format&fit=crop', 
    vehicle: 'Mercedes E-Class',
    vehicleType: 'Premium Sedan',
    specPosition: 'top-right'
  },
  {
    id: 'temple',
    shortName: 'Temple',
    titleLines: ['Temple', 'Tours'],
    thirdLine: 'A Peaceful Pilgrimage.',
    description: 'Experience divine journeys with absolute comfort. Our premium SUVs ensure a smooth, peaceful ride to sacred destinations.',
    price: '3,500',
    bgImage: templeBg, 
    vehicle: 'Toyota Fortuner',
    vehicleType: 'Premium SUV',
    specPosition: 'top-right'
  },
  {
    id: 'outstation',
    shortName: 'Outstation',
    titleLines: ['Outstation', 'Trips'],
    thirdLine: 'Elevated Travel.',
    description: 'Embark on weekend getaways or cross-city trips. Our high-performance luxury vehicles make long journeys a pleasure.',
    price: '4,000',
    bgImage: outstationBg, 
    vehicle: 'Toyota Fortuner',
    vehicleType: 'Premium SUV',
    specPosition: 'center-right'
  },
  {
    id: 'local',
    shortName: 'Local',
    titleLines: ['Local', 'Travel'],
    thirdLine: 'Master Your Schedule.',
    description: 'Navigate the city in absolute comfort. Whether it\'s corporate meetings or fine dining, our chauffeurs know the city.',
    price: '2,000',
    bgImage: 'https://images.unsplash.com/flagged/photo-1553505192-acca7d4509be?ixlib=rb-4.1.0&q=100&w=2560&auto=format&fit=crop', 
    vehicle: 'BMW 5 Series',
    vehicleType: 'Executive Sedan',
    specPosition: 'top-right'
  },
  {
    id: 'family',
    shortName: 'Family',
    titleLines: ['Family', 'Tours'],
    thirdLine: 'Space For Everyone.',
    description: 'Create memories together in spacious, premium vehicles. Perfect for extended family trips where comfort is paramount.',
    price: '3,000',
    bgImage: familyBg, 
    vehicle: 'Toyota Innova Crysta',
    vehicleType: 'Premium MPV',
    specPosition: 'bottom-right'
  }
];

export const Services: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [activeExpIndex, setActiveExpIndex] = useState(0);
  const activeExp = EXPERIENCES[activeExpIndex];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      const idx = EXPERIENCES.findIndex(e => e.id === hash);
      if (idx !== -1) setActiveExpIndex(idx);
    }
  }, [location.hash]);

  // Auto-play slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveExpIndex((prev) => (prev + 1) % EXPERIENCES.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, []);

  const getPositionClasses = (pos: SpecPosition) => {
    switch (pos) {
      case 'top-left': return 'top-0 left-4 md:left-12 items-start text-left';
      case 'top-right': return 'top-0 right-4 md:right-12 items-end text-right';
      case 'bottom-right': return 'bottom-8 right-4 md:right-12 items-end text-right';
      case 'center-right': return 'top-1/2 -translate-y-1/2 right-4 md:right-12 items-end text-right';
      case 'bottom-center': return 'bottom-8 left-1/2 -translate-x-1/2 items-center text-center';
      default: return 'bottom-8 right-4 md:right-12 items-end text-right';
    }
  };

  const getAlignmentClass = (pos: SpecPosition) => {
    if (pos === 'top-left') return 'justify-start';
    if (pos === 'bottom-center') return 'justify-center';
    return 'justify-end';
  };

  const renderSpecs = (isMobile: boolean) => {
    const alignment = isMobile ? 'justify-start' : getAlignmentClass(activeExp.specPosition);
    const alignLeft = isMobile || activeExp.specPosition === 'top-left';
    
    const starOrder = alignLeft
      ? <><span className="text-[#D4AF37] text-[10px] tracking-[0.3em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">★★★★★</span><span className="text-white text-[10px] uppercase tracking-widest font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Premium Experience</span></>
      : <><span className="text-white text-[10px] uppercase tracking-widest font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Premium Experience</span><span className="text-[#D4AF37] text-[10px] tracking-[0.3em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">★★★★★</span></>;

    return (
      <>
        <div className={`flex items-center gap-2 mb-2 w-full ${alignment}`}>
          {starOrder}
        </div>
        
        <h3 className="text-white font-bold text-xl tracking-wide leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{activeExp.vehicle}</h3>
        <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest mb-4 block drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold">{activeExp.vehicleType}</span>
        
        <div className={`w-10 h-[2px] bg-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${alignLeft ? 'ml-0' : 'ml-auto'}`} />

        <div className={`flex flex-col ${alignLeft ? 'items-start' : 'items-end'}`}>
          <span className="text-white uppercase tracking-widest text-[9px] font-bold mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Starting</span>
          <span className="text-white font-sans text-xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">₹{activeExp.price}</span>
        </div>
      </>
    );
  };

  return (
    <div className="bg-[#050505] min-h-screen relative overflow-hidden font-sans pt-[72px] lg:pt-[140px]">
      
      {/* --- CINEMATIC BACKGROUND --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeExp.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="fixed inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ 
              backgroundImage: `url(${activeExp.bgImage})`,
              filter: activeExp.imageFilter || 'contrast(110%) brightness(90%)'
            }}
          />
          
          {activeExp.customOverlay}

          {activeExp.id === 'airport' ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0b]/80 via-transparent to-transparent opacity-80" />
            </>
          ) : (
            <>
              {/* Strict Left Gradient */}
              <div 
                className="absolute inset-0 w-full"
                style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 40%, transparent 100%)' }}
              />
              
              {/* Mobile Bottom Gradient to ensure text readability */}
              <div 
                className="absolute inset-0 w-full lg:hidden"
                style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 min-h-[calc(100vh-140px)] flex flex-col pt-4 md:pt-8 pb-32 lg:pb-12">
        
        {/* --- BOTTOM SLIDE INDICATORS --- */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-3">
          {EXPERIENCES.map((exp, index) => {
            const isActive = activeExpIndex === index;
            return (
              <button
                key={exp.id}
                onClick={() => setActiveExpIndex(index)}
                className="group relative px-2 py-4 flex flex-col items-center justify-center"
              >
                {/* Tooltip text that appears on hover or when active */}
                <span className={`absolute bottom-full mb-2 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-500 font-light ${
                  isActive 
                    ? 'text-white opacity-100 translate-y-0' 
                    : 'text-white/40 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none'
                }`}>
                  {exp.shortName}
                </span>
                
                {/* The line indicator */}
                <div className={`h-[2px] transition-all duration-500 rounded-full ${
                  isActive 
                    ? 'w-10 bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.5)]' 
                    : 'w-4 bg-white/20 group-hover:bg-white/60 group-hover:w-6'
                }`} />
              </button>
            );
          })}
        </div>

        {/* --- MAIN EDITORIAL CONTENT --- */}
        <div className="flex-1 container mx-auto relative px-0 flex justify-between">
          
          {/* LEFT CONTENT */}
          <div className="w-full lg:w-[50%] flex flex-col justify-end pb-4 md:pb-8 px-4 md:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeExp.id + "-content"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }}
                className="flex flex-col"
              >
                {/* Typography Stack */}
                <motion.div className="mb-8 md:mb-8 mt-4 md:mt-8">
                  <h1 className="font-heading font-medium text-white leading-[0.95] tracking-tight text-[38px] sm:text-[50px] md:text-[60px] uppercase mb-3 md:mb-4 drop-shadow-2xl">
                    {activeExp.titleLines.map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </h1>
                  
                  <span className="text-[#D4AF37] font-serif italic text-base md:text-xl block drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-light tracking-wide">
                    {activeExp.thirdLine}
                  </span>
                </motion.div>

                <motion.p className="text-white/90 text-[13px] md:text-[14px] leading-[1.8] mb-10 md:mb-8 font-medium max-w-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {activeExp.description}
                </motion.p>
                
                <motion.div>
                  <Button 
                    onClick={() => navigate('/cars')}
                    className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black font-medium uppercase tracking-widest text-xs h-12 rounded-none flex items-center gap-4 transition-all duration-500 group px-6 w-fit mb-10 lg:mb-0"
                  >
                    <span>Reserve Journey</span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>

                {/* Mobile Specs Block (Only visible on mobile) */}
                <motion.div className="lg:hidden flex flex-col pt-6 border-t border-white/10 mt-auto pb-4">
                  {renderSpecs(true)}
                </motion.div>

              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* DESKTOP FLOATING INFO SPECS */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeExp.id + "-specs-desktop"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className={`hidden lg:flex w-[260px] flex-col absolute drop-shadow-2xl ${getPositionClasses(activeExp.specPosition)}`}
            >
              {renderSpecs(false)}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
      
      {/* Global Style to hide scrollbar on webkit for the nav tabs */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
