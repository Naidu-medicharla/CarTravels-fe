import React, { useEffect } from 'react';
import { X, CheckCircle2, Crown, Shield, Trophy, Star, Zap, Award } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const TIERS = [
  { name: 'BRONZE',   icon: Award,        minTrips: 0,  maxTrips: 1,   discount: 1,  color: '#CD7F32', bg: 'rgba(205,127,50,0.08)',  border: 'rgba(205,127,50,0.25)' },
  { name: 'SILVER',   icon: Star,         minTrips: 2,  maxTrips: 5,   discount: 3,  color: '#C0C0C0', bg: 'rgba(192,192,192,0.08)', border: 'rgba(192,192,192,0.25)' },
  { name: 'GOLD',     icon: Crown,        minTrips: 6,  maxTrips: 10,  discount: 5,  color: '#FFD700', bg: 'rgba(255,215,0,0.08)',   border: 'rgba(255,215,0,0.25)'   },
  { name: 'PLATINUM', icon: Shield,       minTrips: 11, maxTrips: 20,  discount: 8,  color: '#E5E4E2', bg: 'rgba(229,228,226,0.08)', border: 'rgba(229,228,226,0.25)' },
  { name: 'DIAMOND',  icon: Zap,          minTrips: 21, maxTrips: 35,  discount: 10, color: '#B9F2FF', bg: 'rgba(185,242,255,0.08)', border: 'rgba(185,242,255,0.25)' },
  { name: 'ELITE',    icon: Trophy,       minTrips: 36, maxTrips: 50,  discount: 12, color: '#9F7AEA', bg: 'rgba(159,122,234,0.08)', border: 'rgba(159,122,234,0.25)' },
  { name: 'LEGEND',   icon: Crown,        minTrips: 51, maxTrips: null,discount: 15, color: '#D4AF37', bg: 'rgba(212,175,55,0.10)',  border: 'rgba(212,175,55,0.35)'  },
];

const getCurrentTierIndex = (trips: number) => {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (trips >= TIERS[i].minTrips) return i;
  }
  return 0;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTrips: number;
}

export const MembershipTiersModal: React.FC<Props> = ({ isOpen, onClose, currentTrips }) => {
  const currentTierIndex = getCurrentTierIndex(currentTrips);

  // Lock body scroll when modal is open, but DON'T reset overflow on the html element
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — starts below the navbar (top-[64px]) */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm z-[800]"
            style={{ top: '64px' }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="fixed inset-x-0 mx-auto z-[801] w-full max-w-lg px-4"
            style={{ top: '80px' }}
          >
            <div
              className="bg-[#0D0D0F] border border-white/10 rounded-2xl shadow-2xl flex flex-col"
              style={{ maxHeight: 'calc(100vh - 100px)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header — sticky inside modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
                <div className="flex items-center gap-2.5">
                  <Crown size={18} className="text-[#D4AF37]" />
                  <div>
                    <h2 className="text-base font-bold text-white tracking-wide">Vibe Travels Tiers</h2>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-0.5">Exclusive loyalty rewards</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-white/60" />
                </button>
              </div>

              <p className="text-xs text-white/40 px-6 pt-3 shrink-0">
                You currently have <span className="text-[#D4AF37] font-bold">{currentTrips} completed trip{currentTrips !== 1 ? 's' : ''}</span>.
              </p>

              {/* Scrollable tiers list — no native scrollbar shown */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide">
                {TIERS.map((tier, index) => {
                  const Icon = tier.icon;
                  const isCurrent = index === currentTierIndex;
                  const isPast    = index < currentTierIndex;
                  const isFuture  = index > currentTierIndex;
                  const isAspirational = isFuture && (tier.name === 'ELITE' || tier.name === 'LEGEND');
                  const label     = tier.maxTrips === null
                    ? `${tier.minTrips}+ trips`
                    : `${tier.minTrips} to ${tier.maxTrips} trips`;

                  return (
                    <motion.div
                      key={tier.name}
                      animate={isCurrent ? { boxShadow: [ '0 0 0px rgba(0,0,0,0)', `0 0 15px ${tier.color}30`, '0 0 0px rgba(0,0,0,0)' ] } : {}}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
                      style={{
                        background: isCurrent ? tier.bg : isPast ? 'rgba(255,255,255,0.02)' : 'transparent',
                        border: `1px solid ${isCurrent ? tier.border : isPast ? 'rgba(255,255,255,0.06)' : isAspirational ? `${tier.color}40` : 'rgba(255,255,255,0.04)'}`,
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: isPast || isCurrent ? `${tier.color}18` : isAspirational ? `${tier.color}10` : 'rgba(255,255,255,0.04)',
                          border: `1.5px solid ${isPast || isCurrent ? tier.border : isAspirational ? `${tier.color}30` : 'rgba(255,255,255,0.08)'}`,
                        }}
                      >
                        {isPast ? (
                          <CheckCircle2 size={16} style={{ color: tier.color }} />
                        ) : (
                          <Icon size={16} style={{ color: isCurrent ? tier.color : isAspirational ? `${tier.color}60` : 'rgba(255,255,255,0.25)' }} />
                        )}
                      </div>

                      {/* Name + trips */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-bold tracking-wider"
                            style={{ color: isCurrent ? tier.color : isPast ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}
                          >
                            {tier.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-md tracking-wider ml-1"
                              style={{ background: `${tier.color}22`, color: tier.color, border: `1px solid ${tier.border}` }}>
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-white/30">{label}</span>
                        {isCurrent && tier.maxTrips !== null && (
                          <div className="mt-1 text-[10px] font-medium" style={{ color: tier.color }}>
                            {tier.maxTrips - currentTrips + 1} more rides to unlock {TIERS[index + 1].name} ({TIERS[index + 1].discount}% discount)
                          </div>
                        )}
                      </div>

                      {/* Discount */}
                      <div className="text-right shrink-0">
                        <span
                          className="text-xl font-black leading-none"
                          style={{ color: isCurrent ? tier.color : isPast ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)' }}
                        >
                          {tier.discount}%
                        </span>
                        <span className="block text-[9px] font-semibold uppercase tracking-widest text-white/25 mt-0.5">DISCOUNT</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-white/6 shrink-0">
                <p className="text-[11px] text-white/40 text-center flex items-center justify-center gap-1.5 font-medium">
                  <Shield size={12} className="text-[#D4AF37]" />
                  Discounts are automatically applied at checkout.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
