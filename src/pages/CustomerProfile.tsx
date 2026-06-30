import React, { useState, useEffect } from 'react';
import { User, CreditCard, History, Settings, LogOut, ShieldCheck, MapPin, Calendar, Edit2, Upload, Crown, Star, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getFallbackImage } from '@/lib/carImages';
import { api, type UserProfileResponse } from '@/lib/api';
import { getMembershipTier } from '@/lib/membership';

export const CustomerProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Profile Details');

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
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container max-w-[1400px]">
        
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-panel p-6 text-center border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full -z-10" />
              <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center mx-auto mb-4 border-2 border-primary/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
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

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full w-fit mx-auto border border-green-500/20">
                <ShieldCheck size={14} /> Verified Account
              </div>
            </Card>

            <nav className="glass-panel rounded-xl overflow-hidden border-white/5 flex flex-col">
              {[
                { label: 'Profile Details', icon: User },
                { label: 'My Bookings', icon: History },
                { label: 'Saved Cards', icon: CreditCard },
                { label: 'Addresses', icon: MapPin },
                { label: 'Settings', icon: Settings },
              ].map((item, i) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <button key={i} onClick={() => setActiveTab(item.label)} className={`flex items-center gap-4 px-6 py-4 text-sm font-medium transition-colors ${isActive ? 'bg-white/5 text-primary border-l-2 border-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
                    <Icon size={18} /> {item.label}
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
                <h2 className="font-heading font-bold text-2xl text-white mb-6 border-b border-white/5 pb-4">My Bookings</h2>
                <div className="space-y-4">
                  {profile?.all_bookings?.length ? profile.all_bookings.map((booking, idx) => (
                    <div key={idx} className="bg-black/40 rounded-xl border border-white/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-20 bg-white/5 rounded-xl flex items-center justify-center p-2 border border-white/5">
                          <img src={getFallbackImage(booking.car_name.split(' ')[0], booking.car_name.split(' ').slice(1).join(' '))} alt={booking.car_name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] text-primary uppercase tracking-widest font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(212,175,55,0.1)]">{booking.status}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">#{booking.booking_id}</span>
                          </div>
                          <h4 className="font-bold text-white text-xl mb-2">{booking.car_name}</h4>
                          <div className="flex items-center gap-4 text-xs text-white/60 font-medium">
                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {booking.start_date} {booking.end_date !== booking.start_date ? `to ${booking.end_date}` : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right mt-4 md:mt-0 flex flex-col justify-between items-end h-full">
                        <div>
                          <span className="block text-2xl font-bold text-white mb-1">₹{booking.total_amount.toLocaleString()}</span>
                          <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded border border-green-500/20">Payment Successful</span>
                        </div>
                        
                        {!booking.is_trip_completed && booking.status !== 'CANCELLED' && (
                          <Button variant="outline" size="sm" className="mt-4 border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors h-8 text-xs px-4">
                            Cancel Booking
                          </Button>
                        )}
                        {booking.is_trip_completed && (
                          <span className="mt-4 text-xs text-primary font-medium flex items-center gap-1">
                            Trip Completed <CheckCircle2 size={14} />
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
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
