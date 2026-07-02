import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  CalendarPlus,
  AlertCircle,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  XCircle,
  Reply,
  Trophy,
  Star,
  BellOff,
} from 'lucide-react';
import { NotificationItem } from '../lib/api';

// ─── Icon + colour map per notification type ────────────────────────────────

const TYPE_CONFIG: Record<
  string,
  { Icon: React.FC<{ size?: number; className?: string }>; colour: string; bg: string }
> = {
  NEW_BOOKING:           { Icon: CalendarPlus,   colour: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
  CANCEL_REQUEST:        { Icon: AlertCircle,    colour: 'text-orange-400', bg: 'bg-orange-400/10' },
  NEW_TICKET:            { Icon: MessageSquare,  colour: 'text-blue-400',  bg: 'bg-blue-400/10' },
  DRIVER_ASSIGNED:       { Icon: UserCheck,      colour: 'text-green-400', bg: 'bg-green-400/10' },
  CANCELLATION_APPROVED: { Icon: CheckCircle2,   colour: 'text-green-400', bg: 'bg-green-400/10' },
  CANCELLATION_REJECTED: { Icon: XCircle,        colour: 'text-red-400',   bg: 'bg-red-400/10' },
  TICKET_REPLY:          { Icon: Reply,          colour: 'text-purple-400',bg: 'bg-purple-400/10' },
  TIER_UPGRADE:          { Icon: Trophy,         colour: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
  BOOKING_MILESTONE:     { Icon: Star,           colour: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
};

function getFallback(type: string) {
  return TYPE_CONFIG[type] ?? {
    Icon: Bell,
    colour: 'text-white/60',
    bg: 'bg-white/5',
  };
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface NotificationBellProps {
  unreadCount: number;
  notifications: NotificationItem[];
  panelOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Called with the full notification object when a user clicks one */
  onAction: (notification: NotificationItem) => void;
  onMarkAllRead: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount,
  notifications,
  panelOpen,
  onOpen,
  onClose,
  onAction,
  onMarkAllRead,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen, onClose]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={panelOpen ? onClose : onOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#111111] border border-white/10 hover:border-[#D4AF37]/50 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={17} className="text-white/70" />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#D4AF37] text-black text-[10px] font-extrabold leading-none"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-12 w-[360px] max-h-[520px] bg-[#0B0B0C] border border-white/10 rounded-xl shadow-2xl z-[200] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-[#D4AF37]" />
                <span className="text-sm font-bold text-white tracking-wide">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold border border-[#D4AF37]/20">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {notifications.length > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-[#D4AF37] transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <BellOff size={22} className="text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm">You're all caught up!</p>
                </div>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {notifications.map(n => {
                      const { Icon, colour, bg } = getFallback(n.type);
                      return (
                        <motion.li
                          key={n.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-b border-white/5 last:border-b-0"
                        >
                          <button
                            onClick={() => onAction(n)}
                            className="w-full flex items-start gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors text-left group"
                          >
                            {/* Type icon */}
                            <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                              <Icon size={16} className={colour} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-sm font-bold text-white truncate">{n.title}</span>
                                <span className="text-[10px] text-white/30 shrink-0">{timeAgo(n.created_at)}</span>
                              </div>
                              <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{n.message}</p>
                            </div>

                            {/* Unread dot */}
                            {!n.is_read && (
                              <div className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0 mt-1.5" />
                            )}
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer hint */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 border-t border-white/5 shrink-0">
                <p className="text-[10px] text-white/25 text-center">Click a notification to dismiss it</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
