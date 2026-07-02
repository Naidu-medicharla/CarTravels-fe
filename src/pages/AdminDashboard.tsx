import React, { useState } from 'react';
import { 
  LayoutDashboard, CalendarCheck, Car, Users, MessageSquare, 
  BarChart3, Settings, Search, Plus, ChevronDown, ChevronRight,
  AlertTriangle, Phone, MapPin, CreditCard, ChevronUp, MoreVertical, X, Check, Menu, Home, User, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  kpiData, alertsData, actionRequired, fleetStatus, 
  revenueSummary, recentBookings, recentInquiries, mockSchedule, mockBookingsList, mockInquiriesList, mockFleet, mockCustomers
} from '../data/mockAdminData';
import { api, DashboardDetailsResponse } from '../lib/api';

// Subcomponents
const StatBox = ({ title, value }: { title: string, value: string | number }) => (
  <div className="flex flex-col">
    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</span>
    <span className="text-xl font-bold text-white">{value}</span>
  </div>
);

const SectionCard = ({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#0A0A0A] border border-white/5 rounded-lg p-5 ${className}`}>
    <h3 className="text-white text-sm font-bold tracking-wide mb-4">{title}</h3>
    {children}
  </div>
);

const StatusText = ({ status }: { status: string }) => {
  let color = "text-white/70";
  if (status === 'Pending') color = "text-yellow-500";
  if (status === 'Confirmed') color = "text-blue-400";
  if (status === 'Completed') color = "text-green-400";
  if (status === 'Cancelled') color = "text-red-500";
  if (status === 'New') color = "text-yellow-500";
  if (status === 'Opened') color = "text-blue-400";
  if (status === 'Replied') color = "text-green-400";
  if (status === 'Closed') color = "text-[#333333]";
  return <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{status}</span>;
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null);
  const [bookings, setBookings] = useState(mockBookingsList);
  const [inquiries, setInquiries] = useState(mockInquiriesList);

  const [dashboardData, setDashboardData] = useState<DashboardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (activeTab === 'Dashboard') {
      const fetchData = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('auth_token') || '';
          const data = await api.getDashboardDetails(token);
          setDashboardData(data);
        } catch (e) {
          console.error('Failed to fetch dashboard data', e);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [activeTab]);

  // Drawer State - Driver
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [driverMode, setDriverMode] = useState<'select' | 'create'>('select');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [newDriver, setNewDriver] = useState({ name: '', phone: '' });

  // Drawer State - Inquiry
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('Medium');

  // Cars Module State
  const [fleet, setFleet] = useState(mockFleet);
  const [isCarDrawerOpen, setIsCarDrawerOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  
  // Modals for Cars
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState('Maintenance');
  const [customUnavailableReason, setCustomUnavailableReason] = useState('');
  const [bookingConflictMode, setBookingConflictMode] = useState<boolean>(false);
  const [conflictResolution, setConflictResolution] = useState('Cancel'); // Cancel, Assign, Keep
  
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveConflictMode, setArchiveConflictMode] = useState<boolean>(false);

  // Customers Module State
  const [customersList, setCustomersList] = useState(mockCustomers);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  // Cancel Request State
  const [isCancelRejectModalOpen, setIsCancelRejectModalOpen] = useState(false);
  const [cancelRejectReason, setCancelRejectReason] = useState('');
  const [bookingToReject, setBookingToReject] = useState<string | null>(null);

  const handleApproveCancel = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      await api.approveCancelBooking(token, parseInt(id));
    } catch (e) {
      console.error(e);
    }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
  };

  const openRejectCancelModal = (id: string) => {
    setBookingToReject(id);
    setCancelRejectReason('');
    setIsCancelRejectModalOpen(true);
  };

  const handleRejectCancel = async () => {
    if (!bookingToReject || !cancelRejectReason.trim()) return;
    try {
      const token = localStorage.getItem('auth_token') || '';
      await api.rejectCancelBooking(token, parseInt(bookingToReject), cancelRejectReason);
    } catch (e) {
      console.error(e);
    }
    setBookings(prev => prev.map(b => b.id === bookingToReject ? { ...b, status: 'Confirmed' } : b));
    setIsCancelRejectModalOpen(false);
    setBookingToReject(null);
  };

  const unassignedCount = bookings.filter(b => b.driver === 'Unassigned').length;
  const newInquiriesCount = inquiries.filter(i => i.status === 'New').length;

  const navigateToBookings = (filter: string) => {
    setActiveFilter(filter);
    setActiveTab('Bookings');
  };

  const openAssignDrawer = (id: string) => {
    setSelectedBookingId(id);
    setDriverMode('select');
    setSelectedDriver('');
    setIsDrawerOpen(true);
  };

  const handleAssignDriver = () => {
    const driverName = driverMode === 'select' ? selectedDriver : newDriver.name;
    if (!driverName) return;

    setBookings(prev => prev.map(b => 
      b.id === selectedBookingId ? { ...b, driver: driverName, status: 'Confirmed' } : b
    ));
    setIsDrawerOpen(false);
    
    // Also update mockSchedule if applicable
    const scheduleItem = mockSchedule.find(s => s.id === selectedBookingId);
    if(scheduleItem) {
        scheduleItem.driver = driverName;
        scheduleItem.status = 'Confirmed';
    }
  };

  const openInquiryDrawer = (id: string) => {
    setSelectedInquiryId(id);
    setReplyText('');
    const inq = inquiries.find(i => i.id === id);
    if (inq) {
      setPriorityLevel(inq.priority || 'Medium');
      if (inq.status === 'New') {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'Opened' } : i));
      }
    }
    setIsInquiryDrawerOpen(true);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setInquiries(prev => prev.map(i => 
      i.id === selectedInquiryId ? { ...i, status: 'Replied', admin_reply: replyText, priority: priorityLevel } : i
    ));
    setIsInquiryDrawerOpen(false);
  };

  const openEditCarDrawer = (car: any) => {
    setSelectedCar(car);
    setIsCarDrawerOpen(true);
  };

  const handleMakeUnavailableClick = (car: any) => {
    setSelectedCar(car);
    setUnavailableReason('Maintenance');
    setCustomUnavailableReason('');
    
    // Check for future bookings
    if (car.upcoming_bookings && car.upcoming_bookings.length > 0) {
      setBookingConflictMode(true);
    } else {
      setBookingConflictMode(false);
    }
    
    setIsUnavailableModalOpen(true);
  };

  const handleConfirmUnavailable = () => {
    // If conflict mode, we simulate cancelling or reassigning
    // For MVP, we just update status to Maintenance (or the chosen reason)
    setFleet(prev => prev.map(c => 
      c.car_number === selectedCar.car_number ? { ...c, status: unavailableReason === 'Sold' ? 'Archived' : 'Maintenance' } : c
    ));
    setIsUnavailableModalOpen(false);
    setIsCarDrawerOpen(false); // Close drawer if open
  };

  const handleArchiveClick = (car: any) => {
    setSelectedCar(car);
    // Check if currently on a trip (mock logic: if upcoming booking is today)
    const hasOngoing = car.upcoming_bookings?.some((b:any) => b.date === '2026-07-01');
    setArchiveConflictMode(hasOngoing);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = () => {
    setFleet(prev => prev.map(c => 
      c.car_number === selectedCar.car_number ? { ...c, status: 'Archived' } : c
    ));
    setIsArchiveModalOpen(false);
    setIsCarDrawerOpen(false);
  };

  const openCustomerDrawer = (customer: any) => {
    setSelectedCustomer(customer);
    setExpandedBookingId(null);
    setIsCustomerDrawerOpen(true);
  };

  const toggleBookingAccordion = (id: string) => {
    if (expandedBookingId === id) setExpandedBookingId(null);
    else setExpandedBookingId(id);
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Bookings', icon: CalendarCheck },
    { name: 'Cars', icon: Car },
    { name: 'Customers', icon: Users },
    { name: 'Support / Inquiries', icon: MessageSquare },
    { name: 'Reports', icon: BarChart3 },
    { name: 'Settings', icon: Settings },
  ];

  const renderDashboard = () => {
    if (loading || !dashboardData) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
        </div>
      );
    }
    return (
    <div className="space-y-6">
      
      {/* 1. Alert Center */}
      <div className="flex flex-col gap-2">
        {unassignedCount > 0 && (
          <button onClick={() => navigateToBookings('Awaiting Driver')} className="flex justify-between items-center bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 p-4 rounded-lg transition-colors text-left group min-h-[56px]">
            <div className="flex items-center gap-3">
              <span className="text-xl">🚗</span>
              <span className="font-bold text-[#D4AF37] text-sm md:text-base">Driver Assignment ({unassignedCount})</span>
            </div>
            <ChevronRight size={18} className="text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
          </button>
        )}
        {newInquiriesCount > 0 && (
          <button onClick={() => setActiveTab('Support / Inquiries')} className="flex justify-between items-center bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 p-4 rounded-lg transition-colors text-left group min-h-[56px]">
            <div className="flex items-center gap-3">
              <span className="text-xl">📧</span>
              <span className="font-bold text-blue-400 text-sm md:text-base">New Inquiries ({newInquiriesCount})</span>
            </div>
            <ChevronRight size={18} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
        {alertsData.filter(a => !a.text.includes('Driver') && !a.text.includes('Inquiries')).map((alert, i) => (
          <div key={i} className="flex justify-between items-center bg-[#111111] hover:bg-[#1a1a1a] border border-white/10 p-4 rounded-lg transition-colors min-h-[56px]">
            <div className="flex items-center gap-3">
              <span className="text-xl">{alert.icon}</span>
              <span className="font-bold text-white text-sm md:text-base">{alert.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Dashboard Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
        <SectionCard title="Bookings" className="p-4 md:p-5">
          <span className="text-2xl md:text-3xl font-bold text-white">{dashboardData.kpis.today_bookings}</span>
        </SectionCard>
        <SectionCard title="Revenue" className="p-4 md:p-5">
          <span className="text-xl md:text-2xl font-bold text-[#D4AF37]">{dashboardData.kpis.today_revenue}</span>
        </SectionCard>
        <SectionCard title="Cars" className="p-4 md:p-5">
          <span className="text-2xl md:text-3xl font-bold text-white">{dashboardData.kpis.available_cars}</span>
        </SectionCard>
        <SectionCard title="Pending" className="p-4 md:p-5">
          <span className="text-2xl md:text-3xl font-bold text-yellow-500">{kpiData.pendingRequests}</span>
        </SectionCard>
        <SectionCard title="Inquiries" className="p-4 md:p-5">
          <span className="text-2xl md:text-3xl font-bold text-white">{newInquiriesCount}</span>
        </SectionCard>
        <SectionCard title="Maintenance" className="p-4 md:p-5">
          <span className="text-2xl md:text-3xl font-bold text-red-400">{dashboardData.kpis.under_maintenance}</span>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Action Required & Schedule */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* 4. Action Required */}
          <SectionCard title="Action Required" className="p-4 md:p-6">
            <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4">
              <div className="flex items-center gap-3 bg-[#111111] p-3 rounded-lg border border-white/5 cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <span className="text-sm font-bold text-white/80">Pending Confirmations ({actionRequired.awaitingConfirmation})</span>
              </div>
              <div onClick={() => navigateToBookings('Awaiting Driver')} className="flex items-center gap-3 bg-[#D4AF37]/10 p-3 rounded-lg border border-[#D4AF37]/30 cursor-pointer hover:border-[#D4AF37] transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                <span className="text-sm font-bold text-[#D4AF37]">Driver Assignment ({unassignedCount})</span>
              </div>
              <div className="flex items-center gap-3 bg-[#111111] p-3 rounded-lg border border-white/5 cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <span className="text-sm font-bold text-white/80">Pending Payments ({actionRequired.pendingPayments})</span>
              </div>
              <div className="flex items-center gap-3 bg-[#111111] p-3 rounded-lg border border-white/5 cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <span className="text-sm font-bold text-white/80">Customer Complaints ({actionRequired.customerComplaints})</span>
              </div>
              <div className="flex items-center gap-3 bg-[#111111] p-3 rounded-lg border border-white/5 cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <span className="text-sm font-bold text-white/80">Maintenance Requests ({actionRequired.maintenanceRequests})</span>
              </div>
            </div>
          </SectionCard>

          {/* 3. Today's Schedule (Accordion) */}
          <SectionCard title="Today's Schedule">
            <div className="flex flex-col divide-y divide-white/5">
              {dashboardData.today_schedule.length === 0 && (
                <div className="py-8 text-center text-white/40 text-sm">No scheduled trips for today.</div>
              )}
              {dashboardData.today_schedule.map((s) => {
                const isExpanded = expandedScheduleId === s.id;
                return (
                  <div key={s.id} className="py-4">
                    <button 
                      onClick={() => setExpandedScheduleId(isExpanded ? null : s.id)}
                      className="w-full flex justify-between items-center group text-left"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#D4AF37] block mb-1">{s.time}</span>
                        <span className="text-sm font-medium text-white group-hover:text-[#D4AF37] transition-colors">{s.title}</span>
                      </div>
                      <div className="text-white/30 group-hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/5 bg-[#111111] p-4 rounded-md">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2">
                          <div>
                            <span className="text-[10px] uppercase text-white/40 tracking-wider block mb-1">Booking ID</span>
                            <span className="text-sm font-medium text-white">{s.id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-white/40 tracking-wider block mb-1">Customer</span>
                            <span className="text-sm font-medium text-white">{s.customer}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-white/40 tracking-wider block mb-1">Phone</span>
                            <span className="text-sm font-medium text-white">{s.phone}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-white/40 tracking-wider block mb-1">Payment</span>
                            <span className="text-sm font-medium text-white">{s.payment}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-white/40 tracking-wider block mb-1">Vehicle</span>
                            <span className="text-sm font-medium text-[#D4AF37]">{s.vehicle}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-white/40 tracking-wider block mb-1">Vehicle Number</span>
                            <span className="text-sm font-medium text-white">{s.plate}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-white/40 tracking-wider block mb-1">Driver</span>
                            <span className={`text-sm font-medium ${s.driver === 'Unassigned' ? 'text-red-400' : 'text-white'}`}>{s.driver}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-white/40 tracking-wider block mb-1">Status</span>
                            <StatusText status={s.status} />
                          </div>
                          <div className="col-span-2 md:col-span-4 mt-2">
                            <div className="flex items-center justify-between text-sm bg-black/40 p-3 rounded">
                              <div className="flex items-center gap-2 text-white/80"><MapPin size={14} className="text-[#D4AF37]" /> {s.pickup}</div>
                              <ArrowRight size={14} className="text-white/30" />
                              <div className="flex items-center gap-2 text-white/80"><MapPin size={14} className="text-[#D4AF37]" /> {s.destination}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider py-3 rounded flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                <Plus size={16} /> Add Booking
              </button>
              <button className="bg-[#111111] border border-white/10 text-white font-bold text-xs uppercase tracking-wider py-3 rounded flex flex-col items-center justify-center gap-1 hover:border-[#D4AF37] transition-colors">
                <Plus size={16} /> Add Car
              </button>
              <button className="bg-[#111111] border border-white/10 text-white font-bold text-xs uppercase tracking-wider py-3 rounded hover:border-[#D4AF37] transition-colors col-span-2">
                Manage Customers
              </button>
              <button className="bg-[#111111] border border-white/10 text-white font-bold text-xs uppercase tracking-wider py-3 rounded hover:border-[#D4AF37] transition-colors col-span-2">
                View All Bookings
              </button>
            </div>
          </SectionCard>

          {/* 5. Recent Bookings */}
          <SectionCard title="Recent Bookings">
            <div className="flex flex-col gap-4">
              {dashboardData.recent_bookings.length === 0 && (
                <div className="text-white/40 text-sm text-center py-4">No recent bookings.</div>
              )}
              {dashboardData.recent_bookings.map((b, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">{b.customer}</h4>
                    <span className="text-xs text-white/40 block">{b.vehicle} • {b.time}</span>
                  </div>
                  <StatusText status={b.status} />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 6. Fleet Status */}
          <SectionCard title="Fleet Status">
            <div className="flex justify-between items-center">
              <StatBox title="Available" value={fleetStatus.available} />
              <div className="w-px h-8 bg-white/10" />
              <StatBox title="Booked" value={fleetStatus.booked} />
              <div className="w-px h-8 bg-white/10" />
              <StatBox title="Maintenance" value={fleetStatus.maintenance} />
            </div>
          </SectionCard>

          {/* 7. Customer Support */}
          <SectionCard title="Support & Inquiries">
            <div className="flex flex-col gap-4">
              {recentInquiries.map((iq, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] mb-0.5 block">{iq.type}</span>
                    <h4 className="text-sm font-medium text-white">{iq.subject}</h4>
                  </div>
                  <span className="text-xs text-white/40">{iq.time}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 8. Revenue Summary */}
          <SectionCard title="Revenue Summary">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Today</span>
                <span className="text-lg font-bold text-[#D4AF37]">{dashboardData.revenue_summary.today}</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Yesterday</span>
                <span className="text-sm font-bold text-white">{dashboardData.revenue_summary.yesterday}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">This Month</span>
                <span className="text-sm font-bold text-white">{dashboardData.revenue_summary.this_month}</span>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
  };

  const renderBookingsPlaceholder = () => {
    const cancelRequestsCount = bookings.filter(b => b.status === 'CANCEL_REQUESTED').length;

    const filteredBookings = bookings.filter(b => {
      if (activeFilter === 'Awaiting Driver') return b.driver === 'Unassigned';
      if (activeFilter === 'Pending') return b.status === 'Pending';
      if (activeFilter === 'Confirmed') return b.status === 'Confirmed';
      if (activeFilter === 'Cancel Requests') return b.status === 'CANCEL_REQUESTED';
      if (activeFilter === 'Cancelled') return b.status === 'Cancelled' || b.status === 'CANCELLED';
      if (activeFilter === 'Completed') return b.status === 'Completed';
      return true; // 'All'
    });

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Booking Management</h2>
            <p className="text-white/50 text-sm">Manage, assign, and track all reservations.</p>
          </div>
          <button className="hidden md:flex bg-[#D4AF37] hover:bg-[#b5952f] text-black px-4 py-2 text-sm font-bold rounded transition-colors items-center gap-2">
            <Plus size={16} /> New Booking
          </button>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {['All', 'Awaiting Driver', 'Pending', 'Cancel Requests', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
            <button 
              key={f} 
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === f ? 'bg-white text-black' : 'bg-[#111111] border border-white/10 text-white hover:bg-white/10'}`}
            >
              {f} {f === 'Awaiting Driver' && unassignedCount > 0 && `(${unassignedCount})`}
              {f === 'Cancel Requests' && cancelRequestsCount > 0 && `(${cancelRequestsCount})`}
            </button>
          ))}
        </div>

        <div className="bg-[#111111] md:border border-white/10 rounded-lg flex-1 overflow-hidden flex flex-col">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0A0A0A] border-b border-white/10">
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">ID / Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Vehicle & Driver</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Route</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-4">
                      <span className="font-bold text-white text-sm block">{b.id}</span>
                      <span className="text-xs text-white/50">{b.date}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-white text-sm block">{b.customer}</span>
                      <span className="text-xs text-white/50">{b.phone}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-[#D4AF37] text-sm block">{b.vehicle}</span>
                      <span className={`text-xs ${b.driver === 'Unassigned' ? 'text-red-400 font-medium' : 'text-white/50'}`}>{b.driver}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-white block">{b.pickup}</span>
                    </td>
                    <td className="px-4 py-4"><StatusText status={b.status} /></td>
                    <td className="px-4 py-4 text-right">
                      {b.status === 'CANCEL_REQUESTED' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleApproveCancel(b.id)} className="bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                            Approve
                          </button>
                          <button onClick={() => openRejectCancelModal(b.id)} className="bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                            Reject
                          </button>
                        </div>
                      ) : b.driver === 'Unassigned' ? (
                        <button onClick={() => openAssignDrawer(b.id)} className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-black px-3 py-1.5 rounded text-xs font-bold transition-colors">
                          Assign Driver
                        </button>
                      ) : (
                        <button className="text-white/40 hover:text-white p-1 rounded transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-white/40 text-sm">No bookings found for this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-4 bg-[#050505]">
            {filteredBookings.map((b) => (
              <div key={b.id} className="bg-[#111111] border border-white/5 p-4 rounded-lg flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white block">{b.customer}</span>
                    <span className="text-xs text-white/50">{b.id} • {b.date}</span>
                  </div>
                  <StatusText status={b.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-white/40 block mb-0.5">Vehicle</span><span className="text-[#D4AF37] font-bold">{b.vehicle}</span></div>
                  <div><span className="text-white/40 block mb-0.5">Route</span><span className="text-white">{b.pickup}</span></div>
                  <div className="col-span-2">
                    <span className="text-white/40 block mb-0.5">Driver</span>
                    <span className={b.driver === 'Unassigned' ? 'text-red-400 font-bold' : 'text-white'}>{b.driver}</span>
                  </div>
                </div>
                {b.status === 'CANCEL_REQUESTED' ? (
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => handleApproveCancel(b.id)} className="flex-1 bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500 hover:text-white py-2 rounded text-xs font-bold transition-colors">
                      Approve
                    </button>
                    <button onClick={() => openRejectCancelModal(b.id)} className="flex-1 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white py-2 rounded text-xs font-bold transition-colors">
                      Reject
                    </button>
                  </div>
                ) : b.driver === 'Unassigned' && (
                  <button onClick={() => openAssignDrawer(b.id)} className="w-full mt-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-black py-2 rounded text-xs font-bold transition-colors">
                    Assign Driver
                  </button>
                )}
              </div>
            ))}
            {filteredBookings.length === 0 && (
              <div className="py-12 text-center text-white/40 text-sm bg-[#111111] rounded-lg border border-white/5">
                No bookings found for this filter.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderInquiriesPlaceholder = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Support & Inquiries</h2>
            <p className="text-white/50 text-sm">Manage customer questions, partnerships, and complaints.</p>
          </div>
        </div>

        <div className="bg-[#111111] md:border border-white/10 rounded-lg flex-1 overflow-hidden flex flex-col">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0A0A0A] border-b border-white/10">
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Customer Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Received</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-4">
                      <span className="font-bold text-white text-sm block">{inq.name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-[#D4AF37] text-sm block">{inq.subject}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-white block">{inq.created_at}</span>
                    </td>
                    <td className="px-4 py-4"><StatusText status={inq.status} /></td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => openInquiryDrawer(inq.id)} className="bg-[#111111] text-white border border-white/30 hover:border-[#D4AF37] hover:text-[#D4AF37] px-3 py-1.5 rounded text-xs font-bold transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {inquiries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-white/40 text-sm">No inquiries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-4 bg-[#050505]">
            {inquiries.map((inq) => (
              <div key={inq.id} className="bg-[#111111] border border-white/5 p-4 rounded-lg flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white block">{inq.name}</span>
                    <span className="text-xs text-white/50">{inq.created_at}</span>
                  </div>
                  <StatusText status={inq.status} />
                </div>
                <div>
                  <span className="font-medium text-[#D4AF37] text-sm block">{inq.subject}</span>
                </div>
                <button onClick={() => openInquiryDrawer(inq.id)} className="w-full mt-2 flex items-center justify-center gap-2 bg-[#111111] text-white border border-white/30 hover:border-[#D4AF37] hover:text-[#D4AF37] py-2 rounded text-xs font-bold transition-colors">
                  View Details <ArrowRight size={14} />
                </button>
              </div>
            ))}
            {inquiries.length === 0 && (
              <div className="py-12 text-center text-white/40 text-sm bg-[#111111] rounded-lg border border-white/5">
                No inquiries found.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCarsPlaceholder = () => {
    const filteredFleet = fleet.filter(c => {
      if (activeFilter === 'Available') return c.status === 'Available';
      if (activeFilter === 'Unavailable') return c.status === 'Booked' || c.status === 'Maintenance';
      if (activeFilter === 'Archived') return c.status === 'Archived';
      if (activeFilter === 'Maintenance') return c.status === 'Maintenance';
      return c.status !== 'Archived'; // 'All' filters out Archived by default
    });

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Fleet Management</h2>
            <p className="text-white/50 text-sm">Manage vehicles, pricing, availability, and status.</p>
          </div>
          <button className="bg-[#D4AF37] hover:bg-[#b5952f] text-black px-4 py-2 text-sm font-bold rounded transition-colors flex items-center gap-2">
            <Plus size={16} /> Add Car
          </button>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {['All Active', 'Available', 'Unavailable', 'Maintenance', 'Archived'].map(f => (
            <button 
              key={f} 
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === f || (activeFilter === 'All' && f === 'All Active') ? 'bg-white text-black' : 'bg-[#111111] border border-white/10 text-white hover:bg-white/10'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredFleet.map(car => (
            <div key={car.car_number} className="bg-[#111111] border border-white/10 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-24 h-16 bg-white/5 rounded overflow-hidden relative border border-white/10">
                  <div className="absolute inset-0 flex items-center justify-center text-white/20"><Car size={24} /></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{car.brand} {car.model} <span className="text-[#D4AF37] text-sm font-medium ml-2">{car.year}</span></h3>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="bg-white/5 px-2 py-0.5 rounded font-mono">{car.car_number}</span>
                    <span>{car.transmission}</span>
                    <span>{car.seats} Seats</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                <div className="flex items-center gap-4 w-full justify-between md:justify-end">
                  <div className="text-right">
                    <span className="block text-sm font-bold text-white">₹{car.price_per_day.toLocaleString()}/Day</span>
                    <span className="block text-xs text-white/50">₹{car.price_per_km}/km</span>
                  </div>
                  <div className="w-px h-8 bg-white/10 mx-2 hidden md:block"></div>
                  <StatusText status={car.status === 'Maintenance' ? 'Pending' : car.status === 'Archived' ? 'Closed' : car.status === 'Booked' ? 'Confirmed' : 'Completed'} />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <button onClick={() => openEditCarDrawer(car)} className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold text-white transition-colors">
                    Edit
                  </button>
                  {car.status !== 'Archived' && (
                    <button onClick={() => handleMakeUnavailableClick(car)} className="flex-1 md:flex-none px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded text-xs font-bold text-yellow-500 transition-colors">
                      Make Unavailable
                    </button>
                  )}
                  {car.status !== 'Archived' && (
                    <button onClick={() => handleArchiveClick(car)} className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded text-xs font-bold text-red-400 transition-colors">
                      Archive
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredFleet.length === 0 && (
            <div className="py-12 text-center text-white/40 text-sm bg-[#111111] rounded-lg border border-white/5">
              No vehicles found matching this filter.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCustomersPlaceholder = () => {
    const filteredCustomers = customersList.filter(c => {
      if (activeFilter === 'Active') return c.status === 'Active' || c.status === 'VIP';
      if (activeFilter === 'VIP') return c.status === 'VIP';
      if (activeFilter === 'Blocked') return c.status === 'Blocked';
      return true; // 'All'
    });

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Customer CRM</h2>
            <p className="text-white/50 text-sm">Manage customer relationships, lifetime value, and support.</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {['All', 'Active', 'VIP', 'Blocked'].map(f => (
            <button 
              key={f} 
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === f ? 'bg-white text-black' : 'bg-[#111111] border border-white/10 text-white hover:bg-white/10'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-[#111111] md:border border-white/10 rounded-lg flex-1 overflow-hidden flex flex-col">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0A0A0A] border-b border-white/10">
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider text-center">Bookings</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Total Spent</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Last Booking</th>
                  <th className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm block">{cust.name}</span>
                        {cust.status === 'VIP' && <span title="VIP Customer" className="text-xl leading-none -mt-1">👑</span>}
                      </div>
                      <span className="text-[10px] text-white/40 uppercase font-mono">{cust.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-white/80 text-sm block">{cust.phone}</span>
                      <span className="text-xs text-[#D4AF37] hover:underline cursor-pointer">{cust.email}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-bold text-white">{cust.total_bookings}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-bold text-white">₹{cust.total_spent.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-white/70 block">{cust.last_booking}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => openCustomerDrawer(cust)} className="bg-[#111111] text-white border border-white/30 hover:border-[#D4AF37] hover:text-[#D4AF37] px-3 py-1.5 rounded text-xs font-bold transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-white/40 text-sm">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-4 bg-[#050505]">
            {filteredCustomers.map((cust) => (
              <div key={cust.id} className="bg-[#111111] border border-white/5 p-4 rounded-lg flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white block text-lg">{cust.name}</span>
                    {cust.status === 'VIP' && <span title="VIP Customer" className="text-xl leading-none">👑</span>}
                  </div>
                  <span className="text-[10px] text-white/40 uppercase font-mono mt-1">{cust.id}</span>
                </div>
                <div className="flex justify-between items-center bg-[#0A0A0A] p-3 rounded border border-white/5 mt-1">
                  <div className="text-center">
                    <span className="block text-[10px] uppercase text-white/40 tracking-wider">Bookings</span>
                    <span className="block font-bold text-white">{cust.total_bookings}</span>
                  </div>
                  <div className="w-px h-6 bg-white/10"></div>
                  <div className="text-center">
                    <span className="block text-[10px] uppercase text-white/40 tracking-wider">Total Spent</span>
                    <span className="block font-bold text-[#D4AF37]">₹{cust.total_spent.toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => openCustomerDrawer(cust)} className="w-full mt-1 flex items-center justify-center gap-2 bg-[#111111] text-white border border-white/30 hover:border-[#D4AF37] hover:text-[#D4AF37] py-2 rounded text-xs font-bold transition-colors">
                  View Profile <ArrowRight size={14} />
                </button>
              </div>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="py-12 text-center text-white/40 text-sm bg-[#111111] rounded-lg border border-white/5">
                No customers found.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-[#050505] flex flex-col md:flex-row overflow-hidden font-sans relative">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-[#090909] border-b border-white/5 z-40 shrink-0">
        <h1 className="font-heading font-bold text-xl text-white tracking-widest uppercase">
          Vibe <span className="text-[#D4AF37]">Admin</span>
        </h1>
        <button onClick={() => setIsMobileSidebarOpen(true)} className="text-white hover:text-[#D4AF37] transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-[60] md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-4/5 md:w-64 bg-[#090909] border-r border-white/5 flex flex-col z-[70] md:z-50 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
          <h1 className="font-heading font-bold text-xl text-white tracking-widest uppercase">
            Vibe <span className="text-[#D4AF37]">Admin</span>
          </h1>
          <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <ul className="space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      setActiveTab(item.name);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-[#111111] text-[#D4AF37] border border-white/10' 
                        : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        
        <div className="p-4 border-t border-white/5 mt-auto space-y-4">
          <div className="flex flex-col gap-2 mb-4 px-2">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 text-sm font-medium text-white/60 hover:text-white transition-colors">
              <Home size={16} /> Home
            </button>
            <button onClick={() => navigate('/profile')} className="flex items-center gap-3 text-sm font-medium text-white/60 hover:text-white transition-colors">
              <User size={16} /> My Profile
            </button>
          </div>
          {/* Profile inside sidebar */}
          <div className="flex items-center gap-3 px-2 pt-2 border-t border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center font-bold text-black shrink-0">
              B
            </div>
            <div>
              <span className="block text-sm font-bold text-white">Bunny</span>
              <span className="block text-[10px] uppercase text-white/50 tracking-wider">Admin</span>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-73px)] md:h-screen overflow-hidden">
        
        {/* Top Header - Desktop Only */}
        <header className="hidden md:flex h-16 bg-[#090909] border-b border-white/5 items-center justify-between px-8 shrink-0">
          <h2 className="font-bold text-lg text-white">{activeTab}</h2>
          
          <div className="flex flex-1 max-w-xl mx-8 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="Search booking ID, customer, car, or phone..." 
              className="w-full bg-[#111111] border border-white/10 rounded-full pl-11 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="bg-[#D4AF37] hover:bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-colors flex items-center gap-1">
              <Plus size={14} /> Add Booking
            </button>
            <button className="bg-[#111111] hover:border-[#D4AF37] text-white border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-colors flex items-center gap-1">
              <Plus size={14} /> Add Car
            </button>
          </div>
        </header>

        {/* Dynamic View Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#050505] relative">
          {activeTab === 'Dashboard' ? renderDashboard() : 
           activeTab === 'Bookings' ? renderBookingsPlaceholder() : 
           activeTab === 'Support / Inquiries' ? renderInquiriesPlaceholder() : 
           activeTab === 'Cars' ? renderCarsPlaceholder() : 
           activeTab === 'Customers' ? renderCustomersPlaceholder() : 
           renderPlaceholder()}
        </main>
      </div>

      {/* Side Drawer for Driver Assignment */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full md:w-[450px] h-full bg-[#0B0B0C] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Assign Driver</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {/* Booking Summary */}
                <div className="bg-[#111111] p-5 rounded-lg border border-white/5 mb-8">
                  <h3 className="text-xs uppercase text-white/40 font-bold tracking-widest mb-4">Booking Details</h3>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block mb-1">Booking ID</span>
                      <span className="text-sm text-white font-medium">{selectedBookingId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block mb-1">Customer</span>
                      <span className="text-sm text-white font-medium">{bookings.find(b => b.id === selectedBookingId)?.customer}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block mb-1">Vehicle</span>
                      <span className="text-sm text-[#D4AF37] font-medium">{bookings.find(b => b.id === selectedBookingId)?.vehicle}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block mb-1">Pickup</span>
                      <span className="text-sm text-white font-medium truncate pr-2">{bookings.find(b => b.id === selectedBookingId)?.pickup}</span>
                    </div>
                  </div>
                </div>

                {/* Driver Selection Flow */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4">Select Existing Driver</h3>
                    <div className="space-y-2">
                      {['Ramesh', 'Kiran', 'Ajay', 'Suresh'].map(d => (
                        <div 
                          key={d} 
                          onClick={() => { setDriverMode('select'); setSelectedDriver(d); }}
                          className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${driverMode === 'select' && selectedDriver === d ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/10 bg-[#111111] hover:border-white/20'}`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${driverMode === 'select' && selectedDriver === d ? 'border-[#D4AF37]' : 'border-white/30'}`}>
                            {driverMode === 'select' && selectedDriver === d && <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
                          </div>
                          <span className="text-sm text-white font-medium">{d}</span>
                          <span className="ml-auto text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded uppercase tracking-wider">Available</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-xs text-white/40 uppercase font-bold tracking-widest">OR</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>

                  <div>
                    <button 
                      onClick={() => { setDriverMode('create'); setSelectedDriver(''); }}
                      className={`w-full text-left flex items-center justify-between p-4 rounded-md border transition-colors ${driverMode === 'create' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/10 bg-[#111111] hover:border-white/20'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${driverMode === 'create' ? 'border-[#D4AF37]' : 'border-white/30'}`}>
                          {driverMode === 'create' && <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
                        </div>
                        <span className="text-sm font-bold text-white">+ Add New Driver</span>
                      </div>
                    </button>

                    {driverMode === 'create' && (
                      <div className="mt-4 p-5 bg-[#111111] border border-white/5 rounded-md space-y-4">
                        <div>
                          <label className="text-xs text-white/50 block mb-1">Driver Name</label>
                          <input type="text" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50 block mb-1">Phone Number</label>
                          <input type="text" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-[#0A0A0A]">
                <div className="flex gap-3">
                  <button onClick={() => setIsDrawerOpen(false)} className="flex-1 py-3 bg-[#111111] hover:bg-white/5 border border-white/10 text-white text-sm font-bold rounded-md transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={handleAssignDriver}
                    disabled={driverMode === 'select' ? !selectedDriver : !newDriver.name}
                    className="flex-1 py-3 bg-[#D4AF37] hover:bg-white disabled:bg-[#D4AF37]/50 disabled:cursor-not-allowed text-black text-sm font-bold rounded-md transition-colors flex justify-center items-center gap-2"
                  >
                    {driverMode === 'create' ? 'Create & Assign' : 'Assign Driver'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Side Drawer for Inquiries */}
      <AnimatePresence>
        {isInquiryDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
              onClick={() => setIsInquiryDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full md:w-[500px] h-full bg-[#0B0B0C] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Customer Inquiry</h2>
                <button onClick={() => setIsInquiryDrawerOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {/* Customer Details */}
                <div className="bg-[#111111] p-5 rounded-lg border border-white/5">
                  <h3 className="text-sm font-bold text-white mb-4">{inquiries.find(i => i.id === selectedInquiryId)?.name}</h3>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block mb-1">Email</span>
                      <span className="text-sm text-white font-medium">{inquiries.find(i => i.id === selectedInquiryId)?.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block mb-1">Phone</span>
                      <span className="text-sm text-white font-medium">{inquiries.find(i => i.id === selectedInquiryId)?.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block mb-1">Status</span>
                      <StatusText status={inquiries.find(i => i.id === selectedInquiryId)?.status || 'Opened'} />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block mb-1">Submitted</span>
                      <span className="text-sm text-white font-medium truncate pr-2">{inquiries.find(i => i.id === selectedInquiryId)?.created_at}</span>
                    </div>
                  </div>
                </div>

                {/* Priority Selector */}
                <div>
                  <h3 className="text-[10px] text-white/30 uppercase block mb-2 font-bold tracking-widest">Priority</h3>
                  <div className="flex gap-2">
                    {['High', 'Medium', 'Low'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setPriorityLevel(p)}
                        className={`flex-1 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors border ${
                          priorityLevel === p 
                            ? (p === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/30' : p === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30')
                            : 'bg-[#111111] text-white/40 border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* The Message */}
                <div>
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-2">{inquiries.find(i => i.id === selectedInquiryId)?.subject}</h3>
                  <p className="text-white/70 text-sm leading-relaxed bg-white/5 p-4 rounded-lg">
                    {inquiries.find(i => i.id === selectedInquiryId)?.message}
                  </p>
                </div>

                {/* The Reply Area */}
                <div>
                  <h3 className="text-[10px] text-white/30 uppercase block mb-2 font-bold tracking-widest">Reply</h3>
                  {inquiries.find(i => i.id === selectedInquiryId)?.status === 'Replied' ? (
                    <div className="bg-[#111111] p-4 rounded-lg border border-green-500/20">
                      <span className="text-[10px] text-green-400 uppercase font-bold tracking-widest block mb-2">Admin Reply</span>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {inquiries.find(i => i.id === selectedInquiryId)?.admin_reply}
                      </p>
                    </div>
                  ) : (
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response to the customer here..."
                      className="w-full h-32 bg-[#050505] border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-[#D4AF37] resize-none"
                    />
                  )}
                </div>
              </div>

              {inquiries.find(i => i.id === selectedInquiryId)?.status !== 'Replied' && (
                <div className="p-6 border-t border-white/10 bg-[#0A0A0A]">
                  <div className="flex gap-3">
                    <button onClick={() => setIsInquiryDrawerOpen(false)} className="flex-1 py-3 bg-[#111111] hover:bg-white/5 border border-white/10 text-white text-sm font-bold rounded-md transition-colors">
                      Cancel
                    </button>
                    <button 
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="flex-1 py-3 bg-[#D4AF37] hover:bg-white disabled:bg-[#D4AF37]/50 disabled:cursor-not-allowed text-black text-sm font-bold rounded-md transition-colors flex justify-center items-center gap-2"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Side Drawer for Edit Car */}
      <AnimatePresence>
        {isCarDrawerOpen && selectedCar && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
              onClick={() => setIsCarDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full md:w-[600px] h-full bg-[#0B0B0C] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#090909]">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Edit Vehicle</h2>
                  <p className="text-xs text-white/50">{selectedCar.car_number}</p>
                </div>
                <button onClick={() => setIsCarDrawerOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Basic Details */}
                <section>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Basic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-white/40 uppercase block mb-1">Vehicle Number</label>
                      <input type="text" defaultValue={selectedCar.car_number} className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" disabled />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 uppercase block mb-1">Brand</label>
                      <input type="text" defaultValue={selectedCar.brand} className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 uppercase block mb-1">Model</label>
                      <input type="text" defaultValue={selectedCar.model} className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 uppercase block mb-1">Year</label>
                      <input type="number" defaultValue={selectedCar.year} className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                  </div>
                </section>

                <hr className="border-white/5" />

                {/* Specifications */}
                <section>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-white/40 uppercase block mb-1">Fuel Type</label>
                      <select defaultValue={selectedCar.fuel_type} className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]">
                        <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 uppercase block mb-1">Transmission</label>
                      <select defaultValue={selectedCar.transmission} className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]">
                        <option>Automatic</option><option>Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 uppercase block mb-1">Seats</label>
                      <input type="number" defaultValue={selectedCar.seats} className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 uppercase block mb-1">Color</label>
                      <input type="text" defaultValue={selectedCar.color} className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                  </div>
                </section>

                <hr className="border-white/5" />

                {/* Pricing & Availability */}
                <section>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Pricing & Availability</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-white/40 uppercase block mb-1">Price Per Day (₹)</label>
                      <input type="number" defaultValue={selectedCar.price_per_day} className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 uppercase block mb-1">Price Per KM (₹)</label>
                      <input type="number" defaultValue={selectedCar.price_per_km} className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-white/40 uppercase block mb-1">Availability Type</label>
                      <div className="flex gap-2">
                        {['Rental', 'Pickup', 'Both'].map(t => (
                          <button key={t} className={`flex-1 py-2 rounded text-xs font-bold border transition-colors ${selectedCar.availability_type === t ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-[#111111] border-white/10 text-white/40 hover:text-white'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-white/5" />
                
                {/* Images */}
                <section>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Images</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedCar.images?.map((img:string, i:number) => (
                      <div key={i} className="aspect-video bg-[#111111] border border-white/10 rounded relative group overflow-hidden flex items-center justify-center">
                        <span className="text-white/20 text-[10px]">Image {i+1}</span>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                          <button className="text-xs text-white bg-white/20 px-2 py-1 rounded hover:bg-white/40">Replace</button>
                          {i > 0 && <button className="text-[10px] text-red-400 hover:text-red-300">Delete</button>}
                        </div>
                      </div>
                    ))}
                    <button className="aspect-video bg-[#111111] border border-white/10 border-dashed rounded flex flex-col items-center justify-center text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors">
                      <Plus size={16} className="mb-1" />
                      <span className="text-[10px] font-bold">Upload</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">Minimum 1 image required. First image is the cover.</p>
                </section>

                <hr className="border-white/5" />

                {/* Upcoming Bookings */}
                <section>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Upcoming Bookings ({selectedCar.upcoming_bookings?.length || 0})</h3>
                  {selectedCar.upcoming_bookings?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCar.upcoming_bookings.map((b:any, i:number) => (
                        <div key={i} className="flex justify-between items-center bg-[#111111] border border-white/5 p-3 rounded">
                          <div>
                            <span className="block text-sm text-white font-bold">{b.date}</span>
                            <span className="text-xs text-white/50">{b.type}</span>
                          </div>
                          <StatusText status={b.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/40 italic">No upcoming bookings for this vehicle.</p>
                  )}
                </section>

              </div>

              <div className="p-6 border-t border-white/10 bg-[#0A0A0A]">
                <div className="flex gap-3">
                  <button onClick={() => setIsCarDrawerOpen(false)} className="flex-1 py-3 bg-[#111111] hover:bg-white/5 border border-white/10 text-white text-sm font-bold rounded-md transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => setIsCarDrawerOpen(false)} className="flex-1 py-3 bg-[#D4AF37] hover:bg-white text-black text-sm font-bold rounded-md transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal for Make Unavailable */}
      <AnimatePresence>
        {isUnavailableModalOpen && selectedCar && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[110] backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setIsUnavailableModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0F0F0F] border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white">Make Vehicle Unavailable?</h3>
                  <p className="text-xs text-white/50 mt-1">{selectedCar.brand} {selectedCar.model} ({selectedCar.car_number})</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {!bookingConflictMode ? (
                    <div>
                      <label className="text-[10px] text-white/40 uppercase block mb-2 font-bold tracking-widest">Reason</label>
                      <select 
                        value={unavailableReason} 
                        onChange={(e) => setUnavailableReason(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option>Maintenance</option>
                        <option>Accident</option>
                        <option>Cleaning</option>
                        <option>Insurance</option>
                        <option>Other</option>
                      </select>
                      {unavailableReason === 'Other' && (
                        <input 
                          type="text" 
                          placeholder="Please specify reason..."
                          value={customUnavailableReason}
                          onChange={(e) => setCustomUnavailableReason(e.target.value)}
                          className="w-full mt-3 bg-[#111111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                      <div className="flex items-start gap-3 text-yellow-500 mb-4">
                        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm">Action Blocked: Active Bookings</h4>
                          <p className="text-xs text-yellow-500/80 mt-1 leading-relaxed">
                            This vehicle is tied to <strong>{selectedCar.upcoming_bookings?.length}</strong> upcoming bookings. You cannot silently mark it unavailable.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <label className="flex items-center gap-3 p-3 bg-black/40 rounded border border-yellow-500/20 cursor-pointer hover:bg-black/60 transition-colors">
                          <input type="radio" name="conflict" checked={conflictResolution === 'Cancel'} onChange={() => setConflictResolution('Cancel')} className="accent-yellow-500" />
                          <span className="text-sm font-medium text-white">Cancel all affected bookings</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-black/40 rounded border border-yellow-500/20 cursor-pointer hover:bg-black/60 transition-colors">
                          <input type="radio" name="conflict" checked={conflictResolution === 'Assign'} onChange={() => setConflictResolution('Assign')} className="accent-yellow-500" />
                          <span className="text-sm font-medium text-white">Assign another vehicle</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-black/40 rounded border border-yellow-500/20 cursor-pointer hover:bg-black/60 transition-colors">
                          <input type="radio" name="conflict" checked={conflictResolution === 'Keep'} onChange={() => setConflictResolution('Keep')} className="accent-yellow-500" />
                          <span className="text-sm font-medium text-white">Keep vehicle available</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex justify-end gap-3">
                  <button onClick={() => setIsUnavailableModalOpen(false)} className="px-4 py-2 bg-[#111111] hover:bg-white/5 border border-white/10 text-white text-sm font-bold rounded transition-colors">
                    Cancel
                  </button>
                  {(!bookingConflictMode || conflictResolution !== 'Keep') && (
                    <button 
                      onClick={handleConfirmUnavailable} 
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded transition-colors"
                    >
                      {bookingConflictMode ? (conflictResolution === 'Cancel' ? 'Cancel Bookings & Proceed' : 'Reassign & Proceed') : 'Mark Unavailable'}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal for Archive */}
      <AnimatePresence>
        {isArchiveModalOpen && selectedCar && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[110] backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setIsArchiveModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0F0F0F] border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-bold text-red-400">Archive Vehicle?</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  {archiveConflictMode ? (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-start gap-3 text-red-400">
                      <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm">Cannot Archive</h4>
                        <p className="text-xs text-red-400/80 mt-1 leading-relaxed">
                          This vehicle is currently assigned to an ongoing trip today. You cannot archive a vehicle while it is in active use.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-white/70 leading-relaxed">
                      Are you sure you want to archive <strong>{selectedCar.brand} {selectedCar.model} ({selectedCar.car_number})</strong>?<br/><br/>
                      This will hide the vehicle from customer listings, but preserve it for historical booking and revenue reports. This action is preferred over deletion.
                    </p>
                  )}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex justify-end gap-3">
                  <button onClick={() => setIsArchiveModalOpen(false)} className="px-4 py-2 bg-[#111111] hover:bg-white/5 border border-white/10 text-white text-sm font-bold rounded transition-colors">
                    {archiveConflictMode ? 'Close' : 'Cancel'}
                  </button>
                  {!archiveConflictMode && (
                    <button 
                      onClick={handleConfirmArchive} 
                      className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-sm font-bold rounded transition-colors"
                    >
                      Archive Vehicle
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Side Drawer for Customer Profile */}
      <AnimatePresence>
        {isCustomerDrawerOpen && selectedCustomer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
              onClick={() => setIsCustomerDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full md:w-[600px] h-full bg-[#0B0B0C] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#090909]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white">{selectedCustomer.name}</h2>
                    {selectedCustomer.status === 'VIP' && <span title="VIP Customer" className="text-xl leading-none -mt-1">👑</span>}
                  </div>
                  <p className="text-xs text-white/50 font-mono">{selectedCustomer.id} • Joined {selectedCustomer.joined_date}</p>
                </div>
                <button onClick={() => setIsCustomerDrawerOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Contact & LTV */}
                <section className="bg-[#111111] p-5 rounded-lg border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-y-4">
                  <div>
                    <span className="text-[10px] text-white/30 uppercase block mb-1">Phone</span>
                    <span className="text-sm text-white font-medium">{selectedCustomer.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase block mb-1">Email</span>
                    <span className="text-sm text-white font-medium">{selectedCustomer.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase block mb-1">Total Bookings</span>
                    <span className="text-sm text-white font-bold">{selectedCustomer.total_bookings}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase block mb-1">Total Spent</span>
                    <span className="text-sm text-[#D4AF37] font-bold">₹{selectedCustomer.total_spent.toLocaleString()}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-3 mt-2">
                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center justify-center gap-2 text-xs font-bold text-white transition-colors">
                      <Phone size={14} /> Call Customer
                    </button>
                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center justify-center gap-2 text-xs font-bold text-white transition-colors">
                      <MessageSquare size={14} /> Send Email
                    </button>
                  </div>
                </section>

                {/* Quick Stats Block */}
                <section>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[#111111] border border-white/5 rounded p-3 text-center">
                      <span className="block text-lg font-bold text-white">{selectedCustomer.bookings.length}</span>
                      <span className="block text-[10px] text-white/40 uppercase mt-1">Bookings</span>
                    </div>
                    <div className="flex-1 bg-[#111111] border border-green-500/20 rounded p-3 text-center">
                      <span className="block text-lg font-bold text-green-400">{selectedCustomer.bookings.filter((b:any) => b.status === 'Completed').length}</span>
                      <span className="block text-[10px] text-green-400/60 uppercase mt-1">Completed</span>
                    </div>
                    <div className="flex-1 bg-[#111111] border border-red-500/20 rounded p-3 text-center">
                      <span className="block text-lg font-bold text-red-400">{selectedCustomer.bookings.filter((b:any) => b.status === 'Cancelled').length}</span>
                      <span className="block text-[10px] text-red-400/60 uppercase mt-1">Cancelled</span>
                    </div>
                  </div>
                </section>

                {/* Ongoing Ride Alert */}
                {selectedCustomer.ongoing_ride && (
                  <section className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-4 rounded-lg flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0">
                      <Car size={16} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#D4AF37] mb-1">Ongoing Ride</h4>
                      <p className="text-xs text-[#D4AF37]/80">
                        {selectedCustomer.ongoing_ride.type} • {selectedCustomer.ongoing_ride.vehicle}
                      </p>
                      <p className="text-xs text-[#D4AF37]/80 mt-1">
                        Driver: <strong>{selectedCustomer.ongoing_ride.driver}</strong>
                      </p>
                    </div>
                    <StatusText status={selectedCustomer.ongoing_ride.status} />
                  </section>
                )}

                <hr className="border-white/5" />

                {/* Booking History Accordion */}
                <section>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Booking History</h3>
                  {selectedCustomer.bookings.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCustomer.bookings.map((booking:any) => (
                        <div key={booking.id} className="bg-[#111111] border border-white/5 rounded overflow-hidden">
                          {/* Accordion Header */}
                          <div 
                            onClick={() => toggleBookingAccordion(booking.id)}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-white/50">{booking.id}</span>
                                <span className="text-sm font-bold text-white">{booking.type}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-white/40">
                                <span>{booking.vehicle}</span>
                                <span>•</span>
                                <span>{booking.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <StatusText status={booking.status} />
                              {expandedBookingId === booking.id ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                            </div>
                          </div>
                          
                          {/* Accordion Body */}
                          <AnimatePresence>
                            {expandedBookingId === booking.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-white/5 bg-[#0A0A0A]"
                              >
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-[10px] text-white/30 uppercase block mb-1">Pickup</span>
                                    <span className="text-sm text-white">{booking.pickup}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-white/30 uppercase block mb-1">Destination</span>
                                    <span className="text-sm text-white">{booking.destination}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-white/30 uppercase block mb-1">Driver</span>
                                    <span className="text-sm text-white">{booking.driver}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-white/30 uppercase block mb-1">Vehicle No.</span>
                                    <span className="text-sm text-white font-mono">{booking.vehicle_no}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-white/30 uppercase block mb-1">Payment</span>
                                    <span className="text-sm text-white">{booking.payment} (₹{booking.amount.toLocaleString()})</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-white/5 rounded bg-[#111111]">
                      <p className="text-white/40 text-sm">No bookings yet.</p>
                      <p className="text-white/30 text-xs mt-1">Joined {selectedCustomer.joined_date}</p>
                    </div>
                  )}
                </section>

                <hr className="border-white/5" />

                {/* Support History */}
                <section>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Support History</h3>
                  {selectedCustomer.support_history.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCustomer.support_history.map((support:any, i:number) => (
                        <div key={i} className="flex justify-between items-start bg-[#111111] border border-white/5 p-3 rounded">
                          <div>
                            <span className="block text-sm text-white font-bold mb-1">{support.type}: {support.subject}</span>
                            <span className="text-xs text-white/50">{support.date}</span>
                          </div>
                          <StatusText status={support.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/40 italic">No support tickets found.</p>
                  )}
                </section>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Reject Cancel Request Modal */}
      <AnimatePresence>
        {isCancelRejectModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Reject Cancellation</h3>
                <button onClick={() => setIsCancelRejectModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-white/70">Please provide a reason for rejecting this cancellation request.</p>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 resize-none min-h-[100px]"
                  placeholder="E.g., Outside of cancellation window..."
                  value={cancelRejectReason}
                  onChange={(e) => setCancelRejectReason(e.target.value)}
                />
              </div>
              <div className="p-6 bg-black/40 border-t border-white/5 flex justify-end gap-3">
                <button onClick={() => setIsCancelRejectModalOpen(false)} className="px-6 py-2 rounded font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">
                  Cancel
                </button>
                <button onClick={handleRejectCancel} className="px-6 py-2 rounded font-bold text-sm bg-red-500/90 hover:bg-red-500 text-white transition-colors">
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="md:hidden fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
        <AnimatePresence>
          {isFabOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col gap-3"
            >
              <button className="bg-[#111111] border border-white/10 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-full hover:border-[#D4AF37] transition-colors shadow-lg flex items-center justify-end gap-2 text-right">
                <span>Add Car</span>
                <Car size={16} className="text-[#D4AF37]" />
              </button>
              <button className="bg-[#111111] border border-white/10 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-full hover:border-[#D4AF37] transition-colors shadow-lg flex items-center justify-end gap-2 text-right">
                <span>Add Booking</span>
                <CalendarCheck size={16} className="text-[#D4AF37]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-black shadow-lg transition-colors ${isFabOpen ? 'bg-white' : 'bg-[#D4AF37]'}`}
        >
          {isFabOpen ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

    </div>
  );
};

const renderPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6">
      <LayoutDashboard size={32} />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Module scaffolding</h2>
    <p className="text-white/50 max-w-md mx-auto">This module is currently being scaffolded. It will support full CRUD operations and real-time data sync once fully implemented.</p>
  </div>
);

// Add ArrowRight as it was missed in the imports but used inside the component.
const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
