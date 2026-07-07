import React, { useState, useEffect } from 'react';
import { User, CreditCard, History, Settings, LogOut, ShieldCheck, MapPin, Calendar, Edit2, Upload, Crown, Star, ChevronRight, Loader2, CheckCircle2, Home, Plus, Car, HelpCircle, Phone, Mail, Lock, Eye, EyeOff, Bell, Globe, Shield, X, Search, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useGlobalData } from '@/context/GlobalDataContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFallbackImage } from '@/lib/carImages';
import { api, type UserProfileResponse } from '@/lib/api';
import { getMembershipTier } from '@/lib/membership';
import { NotificationBell } from '@/components/NotificationBell';
import { useNotifications } from '@/lib/useNotifications';
import { MembershipTiersModal } from '@/components/MembershipTiersModal';
import { InvoiceTemplate } from '@/components/InvoiceTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const CustomerProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { customerProfile: profile, setCustomerProfile: setProfile, isDataLoading: loading } = useGlobalData();
  const navigate = useNavigate();
  const location = useLocation();
  
  const getTabFromHash = () => {
    switch (location.hash) {
      case '#bookings': return 'My Bookings';
      case '#addresses': return 'Addresses';
      case '#payments': return 'Payments';
      case '#support': return 'Support';
      default: return 'Profile Details';
    }
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash());

  useEffect(() => {
    setActiveTab(getTabFromHash());
  }, [location.hash]);

  const [visibleTrips, setVisibleTrips] = useState(5);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [viewingDetails, setViewingDetails] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isTrustOpen, setIsTrustOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Settings form state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{text:string;ok:boolean}|null>(null);
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [isInvoiceGenerating, setIsInvoiceGenerating] = useState(false);

  const handleDownloadInvoice = async (booking: any) => {
    if (!booking) return;
    setIsInvoiceGenerating(true);
    // Small delay so the hidden template can mount and styles can apply
    await new Promise(r => setTimeout(r, 200));
    try {
      const element = document.getElementById('profile-invoice-template');
      if (!element) return;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#111111',
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`VibeTravels_Invoice_${booking.booking_id || booking.id}.pdf`);
    } catch (err) {
      console.error('Invoice generation failed', err);
    } finally {
      setIsInvoiceGenerating(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation.');
      return;
    }
    setIsCancelling(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');
      await api.requestCancelBooking(token, selectedBooking.id, cancelReason);
      
      if (profile) {
        setProfile({
          ...profile,
          all_bookings: profile.all_bookings?.map(b => b.id === selectedBooking.id ? { ...b, status: 'CANCEL_REQUESTED' } : b)
        });
      }
      setSelectedBooking(null);
      setViewingDetails(false);
      setCancelMode(false);
      setCancelReason('');
      alert('Cancellation requested successfully. An admin will review it shortly.');
    } catch (err: any) {
      alert(err.message || 'Failed to request cancellation');
    } finally {
      setIsCancelling(false);
    }
  };

  // Profile fetching is now handled by GlobalDataContext

  // Handle deep linking for bookings via ?ref=ID query param
  useEffect(() => {
    if (!profile) return;
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref && activeTab === 'My Bookings') {
      const booking = profile.all_bookings?.find(b => b.id.toString() === ref);
      if (booking && selectedBooking?.id !== booking.id) {
        setSelectedBooking(booking);
        setViewingDetails(true);
      }
    }
  }, [location.search, profile, activeTab]);

  const tier = profile ? getMembershipTier(profile.total_trips) : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userToken = localStorage.getItem('auth_token') || null;
  const notifs = useNotifications(userToken);

  // ── Notification click handler (User) ──────────────────────────────
  const USER_TYPE_TO_TAB: Record<string, string> = {
    DRIVER_ASSIGNED:       'My Bookings',
    CANCELLATION_APPROVED: 'My Bookings',
    CANCELLATION_REJECTED: 'My Bookings',
    TICKET_REPLY:          'Support',
    TIER_UPGRADE:          'My Bookings',
  };

  const handleUserNotificationAction = async (notification: any) => {
    // 1. Mark as read
    await notifs.markRead(notification.id);

    // 2. Navigate to relevant tab and pass ref
    const targetTab = USER_TYPE_TO_TAB[notification.type];
    if (targetTab) {
      if (notification.reference_id) {
         navigate(`?ref=${notification.reference_id}#${targetTab === 'My Bookings' ? 'bookings' : 'support'}`);
      } else {
         navigate(`#${targetTab === 'My Bookings' ? 'bookings' : 'support'}`);
      }
    }

    // 3. Close panel
    notifs.closePanel();
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center pt-24 pb-32">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
        <span className="ml-4 text-white font-heading text-lg">Loading Profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pt-24 md:pt-32 pb-32 md:pb-24">
      <div className="container max-w-[1400px] px-4 md:px-8">
        
        {/* --- MOBILE DASHBOARD LAYOUT --- */}
        <div className="flex flex-col md:hidden pb-24">
          {activeTab === 'Profile Details' && (
             <div className="space-y-4">
               {/* Header */}
           <div className="mb-4 mt-2 flex items-center justify-between">
             <div>
               <h1 className="text-base text-white/80 font-heading font-bold mb-1">Good Morning,</h1>
               <h2 className="text-[30px] leading-none text-white font-heading font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Venkat'}</h2>
               <p className="text-muted-foreground text-sm">Ready for your next journey?</p>
             </div>
             <NotificationBell
               unreadCount={notifs.unreadCount}
               notifications={notifs.notifications}
               panelOpen={notifs.panelOpen}
               onOpen={notifs.openPanel}
               onClose={notifs.closePanel}
               onAction={handleUserNotificationAction}
               onMarkAllRead={notifs.markAllRead}
             />
           </div>

           {/* Compressed Profile Card */}
           <div className="glass-panel rounded-2xl p-4 flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center border border-primary/30 shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.15)]">
                <User size={32} className="text-primary" />
              </div>
              <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <h3 className="font-heading font-bold text-lg text-white leading-none m-0">{user?.name || 'Customer'}</h3>
                   <div className="bg-green-500/10 text-green-400 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border border-green-500/20 flex items-center gap-0.5">
                     <ShieldCheck size={8} /> Verified
                   </div>
                 </div>
                 {tier && (
                   <span className="text-primary text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                     <Star size={10} className="fill-primary" /> {tier.name} Member
                   </span>
                 )}
                 <p className="text-[10px] text-muted-foreground mt-1">
                   {profile?.total_trips ?? 0} Trips • Since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2026'}
                 </p>
              </div>
           </div>

           {/* Membership */}
           <div onClick={() => setIsTierModalOpen(true)} className="glass-panel rounded-2xl p-4 mt-2 relative overflow-hidden cursor-pointer hover:bg-white/[0.03] transition-colors">
             <div className="absolute top-0 right-0 p-2 opacity-10"><Crown size={60} className="text-primary" /></div>
             <div className="flex justify-between items-end mb-4 z-10 relative">
               <div>
                 <h4 className="text-primary font-heading font-bold text-lg tracking-wide uppercase">{tier?.name || 'Standard'}</h4>
                 <p className="text-[10px] text-white/50 mt-0.5">{tier?.discountPercentage}% Discount Active</p>
               </div>
               <ShieldCheck className="text-primary mb-1" size={20} />
             </div>
             <div className="z-10 relative">
               <div className="w-full h-1.5 bg-black rounded-full overflow-hidden mb-2 border border-white/5">
                  <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" style={{width: '75%'}} />
               </div>
               <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-right">{tier?.nextTierTrips ? `${tier.nextTierTrips - profile!.total_trips} rides until next tier` : 'Max Tier Reached'}</p>
             </div>
           </div>

           {/* Recent Bookings */}
           <div className="mt-4 mb-2">
             <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-heading font-bold text-lg text-white">Recent Trips</h3>
                <span onClick={() => navigate('#bookings')} className="text-[10px] text-primary font-bold uppercase tracking-widest cursor-pointer">View All</span>
             </div>
             <div className="space-y-3">
               {profile?.recent_activity?.length ? profile.recent_activity.slice(0, 3).map((activity, idx) => (
                 <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center gap-4">
                    <div className="w-16 h-12 bg-black/40 rounded flex items-center justify-center p-1 border border-white/5">
                      <img src={getFallbackImage(activity.car_name.split(' ')[0], activity.car_name.split(' ').slice(1).join(' '))} alt={activity.car_name} className="w-full h-full object-contain filter drop-shadow-md" />
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-white text-sm">{activity.car_name}</h4>
                       <p className="text-[10px] text-muted-foreground mb-0.5">{activity.date}</p>
                       <span className="text-[10px] text-white/50">Driver: Rahul Sharma</span>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-white text-sm">₹{activity.amount_paid.toLocaleString()}</p>
                       <span className="text-[9px] text-green-400 uppercase tracking-widest font-bold bg-green-500/10 px-1.5 py-0.5 rounded mt-0.5 inline-block">Completed</span>
                    </div>
                 </div>
               )) : (
                 <div className="glass-panel rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                      <Car size={20} />
                    </div>
                    <h4 className="text-white font-bold mb-1">No trips yet.</h4>
                    <p className="text-xs text-muted-foreground mb-4">Book your first ride and start earning rewards.</p>
                    <Button onClick={() => navigate('/')} className="bg-primary text-black h-10 text-sm font-bold rounded-full w-full shadow-[0_0_15px_rgba(212,175,55,0.3)]">Book Ride</Button>
                 </div>
               )}
             </div>
           </div>

           {/* Quick Actions Grid */}
           <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
             <button onClick={() => navigate('#bookings')} className="bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-colors">
                <History size={20} className="text-primary" />
                <span className="text-xs font-semibold text-white">Trips</span>
             </button>
             <button onClick={() => navigate('#profile')} className="bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-colors">
                <CreditCard size={20} className="text-primary" />
                <span className="text-xs font-semibold text-white">Payments</span>
             </button>
             <button className="bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-colors">
                <MapPin size={20} className="text-primary" />
                <span className="text-xs font-semibold text-white">Address</span>
             </button>
             <button onClick={() => setIsSupportOpen(true)} className="bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-colors">
                <HelpCircle size={20} className="text-primary" />
                <span className="text-xs font-semibold text-white">Support</span>
             </button>
           </div>

           {/* Travel Summary */}
           <div className="mt-4 mb-8">
             <h3 className="font-heading font-bold text-lg text-white mb-4 px-1">Travel Stats</h3>
             <div className="grid grid-cols-2 gap-3">
                <div className="glass-panel rounded-xl p-4 flex flex-col justify-center items-center text-center h-24">
                   <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Total Spend</span>
                   <span className="text-xl font-bold text-white">₹{profile?.total_spend?.toLocaleString() ?? 0}</span>
                </div>
                <div className="glass-panel rounded-xl p-4 flex flex-col justify-center items-center text-center h-24">
                   <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Completed Trips</span>
                   <span className="text-xl font-bold text-white">{profile?.total_trips ?? 0}</span>
                </div>
                <div className="glass-panel rounded-xl p-4 flex flex-col justify-center items-center text-center h-24">
                   <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Member Since</span>
                   <span className="text-xl font-bold text-white">{profile?.created_at ? new Date(profile.created_at).getFullYear() : '2026'}</span>
                </div>
                <div className="glass-panel rounded-xl p-4 flex flex-col justify-center items-center text-center h-24">
                   <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Favorite Vehicle</span>
                   <span className="text-sm font-bold text-white flex items-center justify-center gap-1 mt-1">Mercedes S-Class</span>
                </div>
             </div>
           </div>
           
           {/* Settings & Help Footer */}
           <div className="glass-panel rounded-2xl overflow-hidden mb-8">
             <button onClick={notifs.openPanel} className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3"><Bell size={16} className="text-muted-foreground" /><span className="text-sm font-medium text-white">Notifications</span></div>
                <ChevronRight size={16} className="text-white/30" />
             </button>
             <button onClick={() => setIsTrustOpen(true)} className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-muted-foreground" /><span className="text-sm font-medium text-white">Trust & Safety</span></div>
                <ChevronRight size={16} className="text-white/30" />
             </button>
             <button onClick={() => setIsSupportOpen(true)} className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3"><HelpCircle size={16} className="text-muted-foreground" /><span className="text-sm font-medium text-white">Support</span></div>
                <ChevronRight size={16} className="text-white/30" />
             </button>
             <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 transition-colors group">
                <div className="flex items-center gap-3"><LogOut size={16} className="text-destructive" /><span className="text-sm font-medium text-destructive">Sign Out</span></div>
             </button>
           </div>
           
          </div>
          )}

          {activeTab === 'My Bookings' && (
             <div className="space-y-4 mt-2">
                <div className="mb-4 px-1 flex items-end justify-between">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-white">Trips</h2>
                    <p className="text-xs text-[#D4AF37] font-semibold mt-1">{profile?.all_bookings?.length || 0} Luxury Journeys</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">₹{profile?.total_spend?.toLocaleString() ?? 0} Spent</p>
                </div>

                <div className="px-1 mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <Input placeholder="Search by Vehicle or Booking ID..." className="pl-9 pr-10 bg-white/[0.02] border-white/10 text-sm h-11 rounded-xl focus:border-[#D4AF37]/50 transition-colors" />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                      <SlidersHorizontal size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <button className="px-4 py-1.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold border border-[#D4AF37]/20 shrink-0 transition-colors">All</button>
                    <button className="px-4 py-1.5 rounded-full bg-white/5 text-white/60 hover:text-white text-xs font-bold border border-white/5 hover:border-white/10 shrink-0 transition-colors">Upcoming</button>
                    <button className="px-4 py-1.5 rounded-full bg-white/5 text-white/60 hover:text-white text-xs font-bold border border-white/5 hover:border-white/10 shrink-0 transition-colors">Completed</button>
                    <button className="px-4 py-1.5 rounded-full bg-white/5 text-white/60 hover:text-white text-xs font-bold border border-white/5 hover:border-white/10 shrink-0 transition-colors">Cancelled</button>
                    <button className="ml-auto px-3 py-1.5 rounded-full bg-white/5 text-white/60 hover:text-white border border-white/5 transition-colors shrink-0 flex items-center gap-1.5">
                      <Calendar size={12} /> <span className="text-[10px] uppercase tracking-widest font-bold">Date</span>
                    </button>
                  </div>
                </div>

                {profile?.all_bookings?.length ? profile.all_bookings.slice(0, visibleTrips).map((booking, idx) => (
                   <div key={idx} className="glass-panel rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="font-bold text-white text-base">{booking.car_name}</h4>
                             <span className="text-[10px] text-muted-foreground font-semibold">Booking #{booking.booking_id}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-white/80 font-medium block">{booking.start_date}</span>
                            <span className="text-[10px] text-white/40 block mt-0.5">Hyderabad Airport</span>
                          </div>
                       </div>
                       
                       <div className="w-full h-px bg-white/5 my-1" />

                       <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-lg">₹{booking.total_amount.toLocaleString()}</span>
                          <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Confirmed & Paid
                          </span>
                       </div>

                       <div className="w-full h-px bg-white/5 my-1" />

                       <div className="flex justify-between items-center">
                         <span className="text-xs text-white/50 font-medium">Driver: Rahul Sharma</span>
                         {!booking.is_trip_completed && booking.status !== 'CANCELLED' && (
                           <Button onClick={() => { setSelectedBooking(booking); setViewingDetails(false); }} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10 hover:text-white transition-colors h-7 text-[10px] px-4 rounded-full flex items-center gap-1">
                             View Booking <ChevronRight size={10} />
                           </Button>
                         )}
                       </div>
                   </div>
                )) : (
                  <div className="text-center py-16 flex flex-col items-center justify-center glass-panel rounded-2xl">
                    <Car size={40} className="mb-4 text-white/10" />
                    <h4 className="text-white font-bold mb-1">No journeys yet.</h4>
                    <p className="text-xs text-muted-foreground mb-6">Reserve your first luxury ride.</p>
                    <Button onClick={() => navigate('/')} className="bg-primary text-black h-10 text-xs font-bold rounded-full px-8 shadow-[0_0_15px_rgba(212,175,55,0.3)]">Book Now</Button>
                  </div>
                )}
                {profile?.all_bookings && visibleTrips < profile.all_bookings.length && (
                  <div className="flex justify-center mt-6 pb-4">
                    <Button onClick={() => setVisibleTrips(prev => prev + 5)} variant="outline" className="border-white/10 text-white hover:bg-white/10 rounded-full h-10 text-xs px-8 font-bold transition-all hover:border-[#D4AF37]/50">
                      Load More Trips
                    </Button>
                  </div>
                )}
             </div>
          )}
        </div>

           {/* Bottom Nav (Mobile) */}
        <div className="fixed bottom-0 inset-x-0 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 z-50 md:hidden pb-[max(env(safe-area-inset-bottom,16px),16px)] shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
           <div className="flex justify-around items-center h-16 px-2">
             <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-white transition-colors w-16">
                <Home size={22} />
                <span className="text-[9px] font-bold tracking-wider uppercase">Home</span>
             </button>
             <button onClick={() => navigate('#bookings')} className={`flex flex-col items-center gap-1.5 transition-colors w-16 ${activeTab === 'My Bookings' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                <Car size={22} className={activeTab === 'My Bookings' ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : ''} />
                <span className="text-[9px] font-bold tracking-wider uppercase">Trips</span>
             </button>
             <button onClick={() => navigate('#profile')} className={`flex flex-col items-center gap-1.5 transition-colors w-16 ${activeTab === 'Profile Details' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                <User size={22} className={activeTab === 'Profile Details' ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : ''} />
                <span className="text-[9px] font-bold tracking-wider uppercase">Profile</span>
             </button>
             <button onClick={() => setIsSettingsOpen(true)} className={`flex flex-col items-center gap-1.5 transition-colors w-16 ${isSettingsOpen ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                <Settings size={22} />
                <span className="text-[9px] font-bold tracking-wider uppercase">Settings</span>
             </button>
           </div>
        </div>

        {/* --- DESKTOP DASHBOARD LAYOUT --- */}
        <div className="hidden md:grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-panel p-6 text-center border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full -z-10" />
              <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-[0_0_8px_rgba(212,175,55,0.15)] mt-4">
                <User size={40} className="text-primary" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-1">{user?.name || 'Customer'}</h3>
              
              <div className="flex flex-col items-center gap-2 mb-6">
                {tier ? (
                  <>
                    <span className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      <Star size={12} className="fill-primary" /> {tier.name} Member
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Member since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
                    </span>
                  </>
                ) : (
                  <Loader2 className="animate-spin text-primary mt-2" size={20} />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-left mb-6 border-y border-white/5 py-4">
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">Trips</span>
                  <span className="block text-white font-bold text-lg">{profile?.total_trips ?? '-'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">Distance</span>
                  <span className="block text-white font-bold text-lg">-</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full w-fit mx-auto border border-green-500/20 mt-4">
                <ShieldCheck size={12} /> Verified Account
              </div>
            </Card>

            <nav className="glass-panel rounded-xl overflow-hidden border-white/5 flex flex-col">
              {[
                { label: 'Profile Details', icon: User, hash: '#profile' },
                { label: 'My Bookings', display: 'Trips', icon: History, hash: '#bookings' },
              ].map((item, i) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <button key={i} onClick={() => navigate(item.hash)} className={`flex items-center gap-4 px-6 py-4 text-sm font-medium transition-colors ${isActive ? 'bg-white/5 text-primary border-l-2 border-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
                    <Icon size={18} /> {item.display || item.label}
                  </button>
                );
              })}
              <button 
                onClick={() => setIsTrustOpen(true)}
                className="flex items-center gap-4 px-6 py-4 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white transition-colors border-l-2 border-transparent border-t border-white/5"
              >
                <Shield size={18} /> Trust & Safety
              </button>
              <button 
                onClick={() => setIsSupportOpen(true)}
                className="flex items-center gap-4 px-6 py-4 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white transition-colors border-l-2 border-transparent border-t border-white/5"
              >
                <HelpCircle size={18} /> Support
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-4 px-6 py-4 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white transition-colors border-l-2 border-transparent mt-auto border-t border-white/5"
              >
                <Settings size={18} /> Settings
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-4 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border-l-2 border-transparent border-t border-white/5"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'Profile Details' && (
              <div className="grid md:grid-cols-2 gap-6">
              
              {/* Box 1: Personal Info */}
              <div className="glass-panel p-8 rounded-2xl border-white/5 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h2 className="font-heading font-bold text-xl text-white">Personal Information</h2>
                </div>
                
                <div className="space-y-5 flex-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Full Name</span>
                    <p className="text-white font-medium pb-2 border-b border-white/5">{profile?.name || user?.name || 'Not Provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Email Address</span>
                    <p className="text-white font-medium pb-2 border-b border-white/5">{profile?.email || user?.email || 'Not Provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Phone Number</span>
                    <p className="text-white font-medium pb-2 border-b border-white/5">{profile?.phone || user?.phone || 'Not Provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Driving License</span>
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-white font-medium">Pending Upload</span>
                      <button className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                        Upload Now <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Membership & Profile Completion */}
              <div className="glass-panel p-8 rounded-2xl border-white/5 flex flex-col h-full space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-heading font-bold text-lg text-white">Profile Completion</h2>
                    <span className="text-primary font-bold text-sm">80%</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-primary/50 to-primary w-[80%] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Upload your driving license to reach 100% and unlock premium self-drive vehicles.</p>
                </div>

                <div className="flex-1">
                  <h2 className="font-heading font-bold text-lg text-white mb-4">Membership Tier</h2>
                  <div onClick={() => setIsTierModalOpen(true)} className="bg-gradient-to-br from-yellow-900/40 via-black to-black border border-primary/20 rounded-xl p-5 relative overflow-hidden h-[160px] flex flex-col cursor-pointer hover:border-primary/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Crown size={80} />
                    </div>
                    {tier ? (
                      <>
                        <div className="flex justify-between items-start z-10">
                          <div>
                            <h4 className="text-primary font-heading font-bold text-lg tracking-wide uppercase">{tier.name}</h4>
                            <span className="text-white/60 text-xs">Vibe Travels Elite</span>
                          </div>
                          <ShieldCheck className="text-primary" size={24} />
                        </div>
                        <div className="mt-auto z-10">
                          <div className="flex justify-between text-xs text-white/80 mb-1">
                            <span>{tier.discountPercentage}% Loyalty Discount</span>
                            <span>Priority Support</span>
                          </div>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest mt-2">
                            {tier.nextTierTrips 
                              ? `${tier.nextTierTrips - profile!.total_trips} trips away from next tier` 
                              : 'Max Tier Reached'}
                          </div>
                        </div>
                      </>
                    ) : (
                       <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Box 3: Recent Activity */}
              <div className="glass-panel p-8 rounded-2xl border-white/5 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h2 className="font-heading font-bold text-xl text-white">Recent Activity</h2>
                  <Button variant="outline" size="sm" onClick={() => navigate('#bookings')} className="text-primary border-primary hover:bg-primary hover:text-black text-xs transition-colors cursor-pointer">View All</Button>
                </div>
                
                <div className="flex-1 flex flex-col justify-start space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {profile?.recent_activity?.length ? profile.recent_activity.map((activity, idx) => (
                    <div key={idx} className="bg-black/40 rounded-xl border border-white/10 p-4 relative overflow-hidden group hover:border-primary/30 transition-colors flex-shrink-0">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[30px] -z-10 group-hover:bg-primary/10 transition-colors" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Booking #{activity.booking_id}</span>
                          <h4 className="font-bold text-white text-lg">{activity.car_name}</h4>
                        </div>
                        <span className="text-primary font-bold text-[10px] uppercase border border-primary/20 bg-primary/10 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(212,175,55,0.1)]">Completed</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-24 h-16 bg-white/5 rounded-lg flex items-center justify-center p-2">
                          <img src={getFallbackImage(activity.car_name.split(' ')[0], activity.car_name.split(' ').slice(1).join(' '))} alt={activity.car_name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs text-white/80 mb-2">
                            <Calendar size={12} className="text-primary" /> {activity.date}
                          </div>
                          <div className="flex items-end justify-between">
                            <span className="text-white font-bold">₹{activity.amount_paid.toLocaleString()}</span>
                            <span className="text-[10px] text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded">Paid</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-muted-foreground py-8">No recent bookings found.</div>
                  )}
                </div>
              </div>

              {/* Box 4: Metrics / Analytics */}
              <div className="glass-panel p-8 rounded-2xl border-white/5 flex flex-col h-full">
                <h2 className="font-heading font-bold text-xl text-white mb-6 border-b border-white/5 pb-4">Travel Summary</h2>
                
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Total Spend</span>
                    <span className="text-2xl font-bold text-white">₹{profile?.total_spend?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Completed</span>
                    <span className="text-2xl font-bold text-white">{profile?.total_trips ?? 0} Trips</span>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Distance</span>
                    <span className="text-2xl font-bold text-white">-</span>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Avg Rating</span>
                    <span className="text-2xl font-bold text-white flex items-center gap-1">{profile?.avg_rating?.toFixed(1) ?? '0.0'} <Star size={16} className="text-primary fill-primary" /></span>
                  </div>
                </div>
              </div>

              </div>
            )}

            {activeTab === 'My Bookings' && (
              <div className="glass-panel p-8 rounded-2xl border-white/5 flex flex-col min-h-[500px]">
                <div className="mb-6 border-b border-white/5 pb-4 flex justify-between items-end">
                  <div>
                    <h2 className="font-heading font-bold text-3xl text-white">Trips</h2>
                    <p className="text-sm text-[#D4AF37] font-semibold mt-1">{profile?.all_bookings?.length || 0} Luxury Journeys</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">₹{profile?.total_spend?.toLocaleString() ?? 0} Total Spent</p>
                </div>

                <div className="mb-8 flex items-center justify-between gap-4">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <Input placeholder="Search by Vehicle or Booking ID..." className="pl-10 pr-10 bg-white/[0.02] border-white/10 text-sm h-11 rounded-xl focus:border-[#D4AF37]/50 transition-colors" />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                      <SlidersHorizontal size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-5 py-2 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-bold border border-[#D4AF37]/20 transition-colors">All</button>
                    <button className="px-5 py-2 rounded-full bg-white/5 text-white/60 hover:text-white text-sm font-bold border border-white/5 hover:border-white/10 transition-colors">Upcoming</button>
                    <button className="px-5 py-2 rounded-full bg-white/5 text-white/60 hover:text-white text-sm font-bold border border-white/5 hover:border-white/10 transition-colors">Completed</button>
                    <button className="px-5 py-2 rounded-full bg-white/5 text-white/60 hover:text-white text-sm font-bold border border-white/5 hover:border-white/10 transition-colors">Cancelled</button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button className="px-4 py-2 rounded-full bg-white/5 text-white/60 hover:text-white border border-white/5 transition-colors flex items-center gap-2">
                      <Calendar size={14} /> <span className="text-xs uppercase tracking-widest font-bold">Date</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {profile?.all_bookings?.length ? profile.all_bookings.slice(0, visibleTrips).map((booking, idx) => (
                    <div key={idx} className="bg-black/40 rounded-xl border border-white/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-20 bg-white/5 rounded-xl flex items-center justify-center p-2 border border-white/5">
                          <img src={getFallbackImage(booking.car_name.split(' ')[0], booking.car_name.split(' ').slice(1).join(' '))} alt={booking.car_name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Booking #{booking.booking_id}</span>
                          </div>
                          <h4 className="font-bold text-white text-xl mb-2">{booking.car_name}</h4>
                          <div className="flex items-center gap-4 text-xs text-white/60 font-medium">
                            <span className="flex items-center gap-1.5">{booking.start_date} {booking.end_date ? `to ${booking.end_date}` : ''}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>Hyderabad Airport</span>
                          </div>
                          <span className="text-xs text-white/50 font-medium block mt-3">Driver: Rahul Sharma</span>
                        </div>
                      </div>
                      <div className="text-right mt-4 md:mt-0 flex flex-col justify-between items-end h-full">
                        <div>
                          <span className="block text-2xl font-bold text-white mb-1">₹{booking.total_amount.toLocaleString()}</span>
                          {booking.status === 'CANCEL_REQUESTED' ? (
                            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 flex items-center justify-end gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Cancel Requested
                            </span>
                          ) : booking.status === 'CANCELLED' ? (
                            <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-red-500/10 px-2 py-1 rounded border border-red-500/20 flex items-center justify-end gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Cancelled
                            </span>
                          ) : (
                            <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex items-center justify-end gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Confirmed & Paid
                            </span>
                          )}
                          {booking.status === 'CONFIRMED' && booking.admin_reject_reason && (
                            <span className="block text-[10px] text-red-400 mt-1 text-right max-w-[150px] truncate" title={`Cancel Rejected: ${booking.admin_reject_reason}`}>
                              Reject Reason: {booking.admin_reject_reason}
                            </span>
                          )}
                        </div>
                        
                        {!booking.is_trip_completed && booking.status !== 'CANCELLED' && (
                          <Button onClick={() => { setSelectedBooking(booking); setViewingDetails(false); }} variant="outline" size="sm" className="mt-4 border-white/10 text-white hover:bg-white/10 hover:text-white transition-colors h-9 text-xs px-6 rounded-full flex items-center gap-1.5">
                            View Booking <ChevronRight size={14} />
                          </Button>
                        )}
                        {booking.is_trip_completed && (
                          <span className="mt-4 text-xs text-primary font-medium flex items-center gap-1">
                            Completed <CheckCircle2 size={14} />
                          </span>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                      <Car size={56} className="mb-6 text-white/10" />
                      <h4 className="text-white text-xl font-bold mb-2">No journeys yet.</h4>
                      <p className="text-sm text-muted-foreground mb-8">Reserve your first luxury ride and experience the Vibe Travels difference.</p>
                      <Button onClick={() => navigate('/')} className="bg-primary text-black h-12 text-sm font-bold rounded-full px-10 shadow-[0_0_20px_rgba(212,175,55,0.3)]">Book Now</Button>
                    </div>
                  )}
                  {profile?.all_bookings && visibleTrips < profile.all_bookings.length && (
                    <div className="flex justify-center mt-10">
                      <Button onClick={() => setVisibleTrips(prev => prev + 5)} variant="outline" className="border-white/10 text-white hover:bg-white/10 rounded-full h-11 px-10 font-bold transition-all hover:border-[#D4AF37]/50">
                        Load More Trips
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Manage Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => { setSelectedBooking(null); setViewingDetails(false); }}>
          <div className="bg-[#111] border border-white/10 rounded-t-2xl md:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b border-white/5 relative flex items-center justify-between">
               <div>
                 <h3 className="text-xl font-heading font-bold text-white mb-1">{viewingDetails ? 'Booking Details' : 'Manage Trip'}</h3>
                 <p className="text-xs text-muted-foreground">Booking #{selectedBooking.booking_id}</p>
               </div>
               <button onClick={() => { setSelectedBooking(null); setViewingDetails(false); setCancelMode(false); }} className="text-white/50 hover:text-white transition-colors">
                  <Plus className="rotate-45" size={24} />
               </button>
             </div>
             
             {cancelMode ? (
               <div className="p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-sm text-white/80">Please tell us why you want to cancel this booking.</p>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 resize-none min-h-[100px]"
                    placeholder="E.g., Change of plans..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setCancelMode(false); setCancelReason(''); }} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors border border-white/10">
                      Back
                    </button>
                    <button onClick={handleCancelRequest} disabled={isCancelling} className="flex-1 py-3 rounded-xl bg-destructive/90 hover:bg-destructive text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
                    </button>
                  </div>
               </div>
             ) : !viewingDetails ? (
               <>
                 <div className="p-4 space-y-2">
                    <button onClick={() => setViewingDetails(true)} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors text-left group">
                       <div className="flex items-center gap-3"><Car size={18} className="text-primary" /><span className="text-sm font-medium text-white">View Booking Details</span></div>
                       <ChevronRight size={16} className="text-white/30 group-hover:text-primary transition-colors" />
                    </button>
                    <button 
                       className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors text-left group"
                       onClick={() => handleDownloadInvoice(selectedBooking)}
                       disabled={isInvoiceGenerating}
                     >
                        <div className="flex items-center gap-3">
                          {isInvoiceGenerating
                            ? <Loader2 size={18} className="text-primary animate-spin" />
                            : <Upload size={18} className="text-primary rotate-180" />
                          }
                          <span className="text-sm font-medium text-white">
                            {isInvoiceGenerating ? 'Generating PDF…' : 'Download Invoice'}
                          </span>
                        </div>
                        {!isInvoiceGenerating && <ChevronRight size={16} className="text-white/30 group-hover:text-primary transition-colors" />}
                     </button>
                    <button onClick={() => { setSelectedBooking(null); setViewingDetails(false); navigate('/contact'); }} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors text-left group">
                       <div className="flex items-center gap-3"><HelpCircle size={18} className="text-primary" /><span className="text-sm font-medium text-white">Contact Support</span></div>
                       <ChevronRight size={16} className="text-white/30 group-hover:text-primary transition-colors" />
                    </button>
                 </div>
                 <div className="p-4 border-t border-white/5">
                    <button onClick={() => setCancelMode(true)} className="w-full py-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 font-bold text-sm transition-colors text-center">
                       Cancel Booking
                    </button>
                 </div>
               </>
             ) : (
               <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm text-muted-foreground">Car Name</span>
                      <span className="text-sm font-semibold text-white">{selectedBooking.car_name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded uppercase tracking-wider">{selectedBooking.status === 'CANCEL_REQUESTED' ? 'Cancel Requested' : selectedBooking.status}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <span className="text-sm font-medium text-white">{selectedBooking.booking_type}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm text-muted-foreground">Dates</span>
                      <span className="text-sm font-medium text-white">{selectedBooking.start_date} {selectedBooking.end_date ? `to ${selectedBooking.end_date}` : ''}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <span className="text-sm font-bold text-white">₹{selectedBooking.total_amount?.toLocaleString() ?? '0'}</span>
                    </div>
                    {selectedBooking.driver_name && (
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="text-sm text-muted-foreground">Assigned Driver</span>
                        <div className="text-right">
                          <span className="text-sm font-medium text-white block">{selectedBooking.driver_name}</span>
                          <span className="text-xs text-muted-foreground block">{selectedBooking.driver_phone}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button onClick={() => setViewingDetails(false)} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-white/10">
                    Back to Options
                  </button>
               </div>
             )}
          </div>
        </div>
      )}
      
      <MembershipTiersModal 
        isOpen={isTierModalOpen} 
        onClose={() => setIsTierModalOpen(false)} 
        currentTrips={profile?.total_trips || 0} 
      />

      {/* Hidden Invoice Template — rendered off-screen for pdf generation */}
      {selectedBooking && (
        <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
          <div id="profile-invoice-template">
            <InvoiceTemplate
              bookingId={selectedBooking.booking_id || String(selectedBooking.id)}
              bookingData={{
                paid_by: user?.name || 'Customer',
                customer_email: user?.email || '',
                customer_phone: user?.phone || '',
                booking_type: selectedBooking.booking_type?.toLowerCase() || 'rental',
              }}
              carData={{
                brand: selectedBooking.car_name?.split(' ')[0] || '',
                model: selectedBooking.car_name?.split(' ').slice(1).join(' ') || selectedBooking.car_name || '',
              }}
              dates={{
                pickup: selectedBooking.start_date || selectedBooking.pickup_date || 'N/A',
                return: selectedBooking.end_date || 'N/A',
              }}
              discount={0}
              previewData={{
                num_days: selectedBooking.num_days || 1,
                car_price: selectedBooking.total_amount || 0,
                driver_charges: selectedBooking.driver_charges || 0,
                total_amount: selectedBooking.total_amount || 0,
              }}
            />
          </div>
        </div>
      )}

      {/* ── SUPPORT BOTTOM SHEET ──────────────────────────────────── */}
      <AnimatePresence>
        {isSupportOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-[800] bg-black/60 backdrop-blur-sm"
              style={{top:'64px'}} onClick={() => setIsSupportOpen(false)} />
            <motion.div
              initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
              transition={{type:'spring',damping:28,stiffness:260}}
              className="fixed bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 inset-x-0 md:mx-auto z-[801] w-full md:max-w-md bg-[#0D0D0F] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl p-6 pb-10 md:pb-6 shadow-2xl"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Contact Support</h2>
                <button onClick={() => setIsSupportOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><X size={16} className="text-white/50" /></button>
              </div>
              <p className="text-sm text-white/40 mb-6">Our team is available Mon–Sat, 9 AM – 7 PM IST. Tap to reach us directly.</p>
              <div className="space-y-3">
                <a href="tel:+919876543210"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/8 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all group active:scale-[0.98]">
                  <div className="w-11 h-11 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone size={18} className="text-green-400" />
                  </div>
                  <div>
                    <span className="text-xs text-white/40 uppercase tracking-widest block mb-0.5">Call Us</span>
                    <span className="text-sm font-bold text-white">+91 98765 43210</span>
                  </div>
                </a>
                <a href="mailto:support@vibetravels.in"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/8 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all group active:scale-[0.98]">
                  <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <span className="text-xs text-white/40 uppercase tracking-widest block mb-0.5">Email Us</span>
                    <span className="text-sm font-bold text-white">support@vibetravels.in</span>
                  </div>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── TRUST & SAFETY BOTTOM SHEET ───────────────────────────── */}
      <AnimatePresence>
        {isTrustOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-[800] bg-black/60 backdrop-blur-sm"
              style={{top:'64px'}} onClick={() => setIsTrustOpen(false)} />
            <motion.div
              initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
              transition={{type:'spring',damping:28,stiffness:260}}
              className="fixed bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 inset-x-0 md:mx-auto z-[801] w-full md:max-w-md bg-[#0D0D0F] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl p-6 pb-10 md:pb-6 shadow-2xl"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Shield size={18} className="text-[#D4AF37]" />
                  <h2 className="text-lg font-bold text-white">Trust &amp; Safety</h2>
                </div>
                <button onClick={() => setIsTrustOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><X size={16} className="text-white/50" /></button>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { icon: ShieldCheck, color:'#22c55e', bg:'rgba(34,197,94,0.08)', border:'rgba(34,197,94,0.2)', title:'Verified Drivers', desc:'All drivers undergo background checks and license verification before onboarding.' },
                  { icon: Lock, color:'#60a5fa', bg:'rgba(96,165,250,0.08)', border:'rgba(96,165,250,0.2)', title:'Encrypted Payments', desc:'Your payment info is secured with bank-grade AES-256 encryption end-to-end.' },
                  { icon: Globe, color:'#D4AF37', bg:'rgba(212,175,55,0.08)', border:'rgba(212,175,55,0.2)', title:'GPS Tracked Rides', desc:'Every ride is tracked in real time so your safety is always our priority.' },
                  { icon: Star, color:'#a78bfa', bg:'rgba(167,139,250,0.08)', border:'rgba(167,139,250,0.2)', title:'Verified Reviews', desc:'All ratings come from users who have completed a verified trip with us.' },
                ].map(({icon: Icon, color, bg, border, title, desc}) => (
                  <div key={title} className="flex gap-4 p-4 rounded-xl" style={{background:bg,border:`1px solid ${border}`}}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{background:`${color}18`,border:`1.5px solid ${border}`}}>
                      <Icon size={18} style={{color}} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">{title}</p>
                      <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="/privacy" className="flex items-center justify-center gap-2 text-xs text-[#D4AF37] hover:underline">
                <Globe size={12} /> Read our full Privacy Policy
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── SETTINGS BOTTOM SHEET ─────────────────────────────────── */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-[800] bg-black/60 backdrop-blur-sm"
              style={{top:'64px'}} onClick={() => setIsSettingsOpen(false)} />
            <motion.div
              initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
              transition={{type:'spring',damping:28,stiffness:260}}
              className="fixed bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 inset-x-0 md:mx-auto z-[801] w-full md:max-w-lg bg-[#0D0D0F] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl pb-10 md:pb-6 shadow-2xl max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="sticky top-0 bg-[#0D0D0F] px-6 pt-6 pb-4 z-10">
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5"><Settings size={18} className="text-[#D4AF37]" /><h2 className="text-lg font-bold text-white">Settings</h2></div>
                  <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><X size={16} className="text-white/50" /></button>
                </div>
              </div>
              <div className="px-6 pb-2 space-y-6">
                {/* Change Password */}
                <div>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-3 flex items-center gap-2"><Lock size={12} /> Change Password</h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <input type={showCurrentPwd ? 'text' : 'password'} placeholder="Current password" value={currentPwd} onChange={e=>setCurrentPwd(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 pr-11" />
                      <button type="button" onClick={()=>setShowCurrentPwd(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">{showCurrentPwd ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                    </div>
                    <div className="relative">
                      <input type={showNewPwd ? 'text' : 'password'} placeholder="New password" value={newPwd} onChange={e=>setNewPwd(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 pr-11" />
                      <button type="button" onClick={()=>setShowNewPwd(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">{showNewPwd ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                    </div>
                    <input type="password" placeholder="Confirm new password" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50" />
                    {pwdMsg && <p className={`text-xs px-1 ${pwdMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{pwdMsg.text}</p>}
                    <button
                      disabled={pwdLoading}
                      onClick={async () => {
                        if (!currentPwd || !newPwd || !confirmPwd) { setPwdMsg({text:'Please fill all fields.',ok:false}); return; }
                        if (newPwd !== confirmPwd) { setPwdMsg({text:'New passwords do not match.',ok:false}); return; }
                        if (newPwd.length < 6) { setPwdMsg({text:'Password must be at least 6 characters.',ok:false}); return; }
                        setPwdLoading(true); setPwdMsg(null);
                        try {
                          const token = localStorage.getItem('auth_token') || '';
                          await api.changePassword?.(token, currentPwd, newPwd);
                          setPwdMsg({text:'Password changed successfully!',ok:true});
                          setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
                        } catch(e:any) { setPwdMsg({text: e.message || 'Failed to change password.',ok:false}); }
                        finally { setPwdLoading(false); }
                      }}
                      className="w-full py-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] text-sm font-bold hover:bg-[#D4AF37]/20 transition-colors disabled:opacity-50"
                    >
                      {pwdLoading ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </div>
                {/* Notifications */}
                <div>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-3 flex items-center gap-2"><Bell size={12} /> Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { label:'Push Notifications', desc:'Booking updates & reminders', val:notifPush, set:setNotifPush },
                      { label:'Email Notifications', desc:'Receipts, confirmations & offers', val:notifEmail, set:setNotifEmail },
                    ].map(({label,desc,val,set}) => (
                      <div key={label} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/8">
                        <div>
                          <p className="text-sm font-medium text-white">{label}</p>
                          <p className="text-xs text-white/35">{desc}</p>
                        </div>
                        <button onClick={()=>set(p=>!p)}
                          className={`w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 ${val ? 'bg-[#D4AF37]' : 'bg-white/10'}`}>
                          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${val ? 'left-[26px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
