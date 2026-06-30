import React, { useState, useEffect } from 'react';
import { User, CreditCard, History, Settings, LogOut, ShieldCheck, MapPin, Calendar, Edit2, Upload, Crown, Star, ChevronRight, Loader2, CheckCircle2, Home, Plus, Car, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFallbackImage } from '@/lib/carImages';
import { api, type UserProfileResponse } from '@/lib/api';
import { getMembershipTier } from '@/lib/membership';

export const CustomerProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  const getTabFromHash = () => {
    switch (location.hash) {
      case '#bookings': return 'My Bookings';
      case '#addresses': return 'Addresses';
      case '#payments': return 'Payments';
      case '#support': return 'Support';
      case '#settings': return 'Settings';
      default: return 'Profile Details';
    }
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash());

  useEffect(() => {
    setActiveTab(getTabFromHash());
  }, [location.hash]);

  const [visibleTrips, setVisibleTrips] = useState(5);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    if (user?.email) {
      api.getCustomerProfile(user.email)
        .then(data => setProfile(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const tier = profile ? getMembershipTier(profile.total_trips) : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-32 pb-32 md:pb-24">
      <div className="container max-w-[1400px] px-4 md:px-8">
        
        {/* --- MOBILE DASHBOARD LAYOUT --- */}
        <div className="flex flex-col md:hidden pb-24">
          {activeTab === 'Profile Details' && (
             <div className="space-y-4">
               {/* Header */}
           <div className="mb-4 mt-2">
             <h1 className="text-base text-white/80 font-heading font-bold mb-1">Good Morning,</h1>
             <h2 className="text-[30px] leading-none text-white font-heading font-bold mb-2">{user?.name?.split(' ')[0] || 'Venkat'}</h2>
             <p className="text-muted-foreground text-sm">Ready for your next premium ride?</p>
           </div>

           {/* Compressed Profile Card */}
           <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border border-primary/30 shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.15)]">
                <User size={24} className="text-primary" />
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

           {/* Quick Actions Grid */}
           <div className="grid grid-cols-2 gap-3 mt-2">
             <button onClick={() => setActiveTab('My Bookings')} className="bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-colors">
                <History size={20} className="text-primary" />
                <span className="text-xs font-semibold text-white">Trips</span>
             </button>
             <button onClick={() => setActiveTab('Profile Details')} className="bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-colors">
                <CreditCard size={20} className="text-primary" />
                <span className="text-xs font-semibold text-white">Payments</span>
             </button>
             <button className="bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-colors">
                <MapPin size={20} className="text-primary" />
                <span className="text-xs font-semibold text-white">Address</span>
             </button>
             <button className="bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-colors">
                <Settings size={20} className="text-primary" />
                <span className="text-xs font-semibold text-white">Settings</span>
             </button>
           </div>

           {/* Current Booking (Simulated if history exists) Removed per user request */}

           {/* Membership */}
           <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 mt-2 relative overflow-hidden">
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
               <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-right">{tier?.nextTierTrips ? `${tier.nextTierTrips - profile!.total_trips} Trips to next tier` : 'Max Tier Reached'}</p>
             </div>
           </div>

           {/* Recent Bookings */}
           <div className="mt-4">
             <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-heading font-bold text-lg text-white">Recent Trips</h3>
                <span onClick={() => setActiveTab('My Bookings')} className="text-[10px] text-primary font-bold uppercase tracking-widest cursor-pointer">View All</span>
             </div>
             <div className="space-y-3">
               {profile?.recent_activity?.length ? profile.recent_activity.slice(0, 3).map((activity, idx) => (
                 <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center gap-4">
                    <div className="w-16 h-12 bg-black/40 rounded flex items-center justify-center p-1 border border-white/5">
                      <img src={getFallbackImage(activity.car_name.split(' ')[0], activity.car_name.split(' ').slice(1).join(' '))} alt={activity.car_name} className="w-full h-full object-contain filter drop-shadow-md" />
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-white text-sm">{activity.car_name}</h4>
                       <p className="text-[10px] text-muted-foreground">{activity.date}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-white text-sm">₹{activity.amount_paid.toLocaleString()}</p>
                       <span className="text-[9px] text-green-400 uppercase tracking-widest font-bold bg-green-500/10 px-1.5 py-0.5 rounded mt-0.5 inline-block">Completed</span>
                    </div>
                 </div>
               )) : (
                 <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
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

           {/* Travel Summary */}
           <div className="mt-4 mb-8">
             <h3 className="font-heading font-bold text-lg text-white mb-4 px-1">Travel Stats</h3>
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center text-center h-24">
                   <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Total Spend</span>
                   <span className="text-xl font-bold text-white">₹{profile?.total_spend?.toLocaleString() ?? 0}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center text-center h-24">
                   <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Completed</span>
                   <span className="text-xl font-bold text-white">{profile?.total_trips ?? 0} Trips</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center text-center h-24">
                   <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Avg Rating</span>
                   <span className="text-xl font-bold text-white flex items-center justify-center gap-1">{profile?.avg_rating?.toFixed(1) ?? '0.0'} <Star size={14} className="text-primary fill-primary" /></span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center text-center h-24">
                   <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Distance</span>
                   <span className="text-xl font-bold text-white">-</span>
                </div>
             </div>
           </div>
           
           {/* Settings & Help Footer */}
           <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden mb-8">
             <button className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3"><Settings size={16} className="text-muted-foreground" /><span className="text-sm font-medium text-white">Settings</span></div>
                <ChevronRight size={16} className="text-white/30" />
             </button>
             <button className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-muted-foreground" /><span className="text-sm font-medium text-white">Trust & Safety</span></div>
                <ChevronRight size={16} className="text-white/30" />
             </button>
             <button className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
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
                <div className="mb-6 px-1">
                  <h2 className="font-heading font-bold text-2xl text-white">Trips</h2>
                  <p className="text-xs text-muted-foreground mt-1">{profile?.all_bookings?.length || 0} Confirmed Trips</p>
                </div>
                {profile?.all_bookings?.length ? profile.all_bookings.slice(0, visibleTrips).map((booking, idx) => (
                   <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="font-bold text-white text-base">{booking.car_name}</h4>
                             <span className="text-[10px] text-muted-foreground font-semibold">Booking #{booking.booking_id}</span>
                          </div>
                          <span className="text-[10px] text-white/60 font-medium">{booking.start_date}</span>
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
                         <span className="text-xs text-primary font-bold">View Details</span>
                         {!booking.is_trip_completed && booking.status !== 'CANCELLED' && (
                           <Button onClick={() => setSelectedBooking(booking)} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10 hover:text-white transition-colors h-7 text-[10px] px-4 rounded-full">
                             Manage
                           </Button>
                         )}
                       </div>
                   </div>
                )) : (
                  <div className="text-center py-16 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl">
                    <Car size={40} className="mb-4 text-white/10" />
                    <h4 className="text-white font-bold mb-1">No trips yet.</h4>
                    <p className="text-xs text-muted-foreground mb-4">Book your first premium ride.</p>
                    <Button onClick={() => navigate('/')} className="bg-primary text-black h-9 text-xs font-bold rounded-full px-6">Book Ride</Button>
                  </div>
                )}
                {profile?.all_bookings && visibleTrips < profile.all_bookings.length && (
                  <div className="flex justify-center mt-4 pb-4">
                    <Button onClick={() => setVisibleTrips(prev => prev + 5)} variant="outline" className="border-white/10 text-white hover:bg-white/10 rounded-full h-9 text-xs px-6">
                      Load More Trips
                    </Button>
                  </div>
                )}
             </div>
          )}
        </div>

        {/* Floating Action Button (Mobile) Removed per user request */}

        {/* Bottom Nav (Mobile) */}
        <div className="fixed bottom-0 inset-x-0 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 z-50 md:hidden pb-[max(env(safe-area-inset-bottom,16px),16px)] shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
           <div className="flex justify-around items-center h-16 px-2">
             <button onClick={() => { setActiveTab('Profile Details'); navigate('/'); }} className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-white transition-colors w-16">
                <Home size={22} />
                <span className="text-[9px] font-bold tracking-wider uppercase">Home</span>
             </button>
             <button onClick={() => setActiveTab('My Bookings')} className={`flex flex-col items-center gap-1.5 transition-colors w-16 ${activeTab === 'My Bookings' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                <Car size={22} className={activeTab === 'My Bookings' ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : ''} />
                <span className="text-[9px] font-bold tracking-wider uppercase">Trips</span>
             </button>
             <button onClick={() => setActiveTab('Profile Details')} className={`flex flex-col items-center gap-1.5 transition-colors w-16 ${activeTab === 'Profile Details' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                <User size={22} className={activeTab === 'Profile Details' ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : ''} />
                <span className="text-[9px] font-bold tracking-wider uppercase">Profile</span>
             </button>
             <button className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-white transition-colors w-16">
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
              <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-[0_0_8px_rgba(212,175,55,0.15)]">
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
                { label: 'Profile Details', icon: User },
                { label: 'My Bookings', display: 'Trips', icon: History },
                { label: 'Saved Cards', icon: CreditCard },
                { label: 'Addresses', icon: MapPin },
                { label: 'Settings', icon: Settings },
              ].map((item, i) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <button key={i} onClick={() => setActiveTab(item.label)} className={`flex items-center gap-4 px-6 py-4 text-sm font-medium transition-colors ${isActive ? 'bg-white/5 text-primary border-l-2 border-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
                    <Icon size={18} /> {item.display || item.label}
                  </button>
                );
              })}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-4 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border-l-2 border-transparent mt-auto border-t border-white/5"
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
                  <div className="bg-gradient-to-br from-yellow-900/40 via-black to-black border border-primary/20 rounded-xl p-5 relative overflow-hidden h-[160px] flex flex-col">
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
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('My Bookings')} className="text-primary border-primary hover:bg-primary hover:text-black text-xs transition-colors cursor-pointer">View All</Button>
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
                <div className="mb-6 border-b border-white/5 pb-4 flex justify-between items-center">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-white">Trips</h2>
                    <p className="text-sm text-muted-foreground mt-1">{profile?.all_bookings?.length || 0} Confirmed Trips</p>
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
                            <span className="flex items-center gap-1.5">{booking.start_date} {booking.end_date !== booking.start_date ? `to ${booking.end_date}` : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right mt-4 md:mt-0 flex flex-col justify-between items-end h-full">
                        <div>
                          <span className="block text-2xl font-bold text-white mb-1">₹{booking.total_amount.toLocaleString()}</span>
                          <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Confirmed & Paid
                          </span>
                        </div>
                        
                        {!booking.is_trip_completed && booking.status !== 'CANCELLED' && (
                          <Button onClick={() => setSelectedBooking(booking)} variant="outline" size="sm" className="mt-4 border-white/10 text-white hover:bg-white/10 hover:text-white transition-colors h-8 text-xs px-6 rounded-full">
                            Manage
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
                    <div className="text-center text-muted-foreground py-16 flex flex-col items-center justify-center">
                      <History size={48} className="mb-4 text-white/10" />
                      <p>You have no booking history.</p>
                    </div>
                  )}
                  {profile?.all_bookings && visibleTrips < profile.all_bookings.length && (
                    <div className="flex justify-center mt-6">
                      <Button onClick={() => setVisibleTrips(prev => prev + 5)} variant="outline" className="border-white/10 text-white hover:bg-white/10 rounded-full h-10 px-8">
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
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedBooking(null)}>
          <div className="bg-[#111] border border-white/10 rounded-t-2xl md:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b border-white/5 relative">
               <h3 className="text-xl font-heading font-bold text-white mb-1">Manage Trip</h3>
               <p className="text-xs text-muted-foreground">Booking #{selectedBooking.booking_id}</p>
               <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                  <Plus className="rotate-45" size={24} />
               </button>
             </div>
             <div className="p-4 space-y-2">
                <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors text-left group">
                   <div className="flex items-center gap-3"><Car size={18} className="text-primary" /><span className="text-sm font-medium text-white">View Booking Details</span></div>
                   <ChevronRight size={16} className="text-white/30 group-hover:text-primary transition-colors" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors text-left group">
                   <div className="flex items-center gap-3"><Upload size={18} className="text-primary rotate-180" /><span className="text-sm font-medium text-white">Download Invoice</span></div>
                   <ChevronRight size={16} className="text-white/30 group-hover:text-primary transition-colors" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors text-left group">
                   <div className="flex items-center gap-3"><HelpCircle size={18} className="text-primary" /><span className="text-sm font-medium text-white">Contact Support</span></div>
                   <ChevronRight size={16} className="text-white/30 group-hover:text-primary transition-colors" />
                </button>
             </div>
             <div className="p-4 border-t border-white/5">
                <button onClick={() => { alert('Cancel booking flow initiated'); setSelectedBooking(null); }} className="w-full py-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 font-bold text-sm transition-colors text-center">
                   Cancel Booking
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
