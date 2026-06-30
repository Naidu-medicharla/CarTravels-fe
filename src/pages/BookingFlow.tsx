import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, ChevronLeft, MapPin, Calendar, CreditCard, ShieldCheck, Users, Briefcase, Navigation, Settings, Loader2, Flag, Lock, Shield, HelpCircle, Download, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { api, type BookingPreview, type UserProfileResponse } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getFallbackImage } from '@/lib/carImages';
import { getMembershipTier } from '@/lib/membership';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, isSameDay } from 'date-fns';
import 'react-day-picker/dist/style.css';

const steps = [
  { id: 1, title: 'Trip Details', icon: MapPin },
  { id: 2, title: 'Payment', icon: CreditCard },
  { id: 3, title: 'Confirm Booking', icon: ShieldCheck },
];

export const BookingFlow: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialType = (queryParams.get('type') as 'rental' | 'drop') || 'rental';
  const carNumber = queryParams.get('car') || 'AP09XX1234';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingType, setBookingType] = useState<'rental' | 'drop'>(initialType);

  // Form State
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [driverRequired, setDriverRequired] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);

  React.useEffect(() => {
    if (user?.email) {
      api.getCustomerProfile(user.email)
        .then(data => setProfile(data))
        .catch(err => console.error(err));
    }
  }, [user]);

  const discountPercentage = profile ? getMembershipTier(profile.total_trips).discountPercentage : 5;

  // Preview State
  const [previewData, setPreviewData] = useState<BookingPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');
  
  const [confirmingBooking, setConfirmingBooking] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (carNumber) {
      if (token) {
        api.getAllCars(token).then(cars => {
          const car = cars.find(c => c.car_number === carNumber);
          if (car) setSelectedCar(car);
        }).catch(err => console.error(err));
      }
      
      api.getCarAvailability(carNumber).then(res => {
        if (Array.isArray(res)) {
          setBookedDates(res.map(d => parseISO(d)));
        } else if (res && (res as any).booked_dates) {
          setBookedDates((res as any).booked_dates.map((d: string) => parseISO(d)));
        }
      }).catch(err => console.error(err));
    }
  }, [carNumber]);

  const nextStep = async () => {
    if (currentStep === 1) {
      if (!pickupDate || (bookingType === 'rental' && !returnDate)) {
        showToast('Please select the required dates');
        return;
      }
      
      if (bookingType === 'rental' && pickupDate && returnDate) {
        const start = parseISO(pickupDate);
        const end = parseISO(returnDate);
        const hasConflict = bookedDates.some(bd => bd >= start && bd <= end);
        if (hasConflict) {
          showToast('Your selected date range includes days that are already booked. Please choose different dates.');
          return;
        }
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        showToast('You must be logged in to continue.');
        return;
      }

      setLoadingPreview(true);
      setPreviewError('');

      try {
        const res = await api.previewBooking(token, {
          car_number: carNumber,
          start_date: pickupDate,
          end_date: bookingType === 'rental' ? returnDate : pickupDate,
          driver_required: driverRequired
        });
        setPreviewData(res);
        setCurrentStep(2);
      } catch (err: any) {
        setPreviewError(err.message || 'Failed to fetch preview');
        showToast(err.message || 'Failed to fetch preview');
      } finally {
        setLoadingPreview(false);
      }
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handleConfirmBooking = async () => {
    if (!previewData) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const finalAmount = previewData.total_amount - (previewData.total_amount * discountPercentage) / 100;
    const discountAmount = (previewData.total_amount * discountPercentage) / 100;
    
    const payload = {
      start_date: pickupDate,
      end_date: bookingType === 'rental' ? returnDate : pickupDate,
      driver_required: driverRequired,
      car_charges: previewData.car_price,
      driver_charges: previewData.driver_charges,
      discount: discountAmount,
      total_amount_before_discount: previewData.total_amount,
      total_amount: finalAmount,
      amount_paid: finalAmount,
      paid_by: user?.name || 'Customer',
      payment_channel: paymentMethod,
      payment_status: 'SUCCESS'
    };

    setConfirmingBooking(true);
    try {
      // Simulate 5 seconds payment processing
      await new Promise(resolve => setTimeout(resolve, 5000));
      await api.confirmRentalBooking(token, carNumber, payload);
      setCurrentStep(3);
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm booking');
    } finally {
      setConfirmingBooking(false);
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#181818,#0b0b0b)] pt-28 pb-8 relative overflow-hidden flex flex-col items-center">

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}
          >
            {toast.type === 'error' ? <X size={20} className="text-red-400 flex-shrink-0" /> : <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />}
            <span className="font-medium text-sm whitespace-nowrap">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Payment Loading Overlay */}
      <AnimatePresence>
        {confirmingBooking && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ x: [-30, 30, -30] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="mb-8"
              >
                <img src="https://freepngimg.com/thumb/car/3-2-car-free-download-png.png" alt="Processing Car" className="w-64 object-contain filter drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]" />
              </motion.div>
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-primary" size={32} />
                <h3 className="font-heading text-3xl text-white">Processing Payment...</h3>
              </div>
              <p className="text-muted-foreground mt-3 text-lg font-medium tracking-wide">Please do not close or refresh this window.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container w-full max-w-[1120px] px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-2 tracking-wide">Complete Your <span className="text-primary">Booking</span></h1>
          <p className="text-muted-foreground text-base">Reserve your luxury vehicle in just a few steps.</p>
        </div>

        {/* Compact Stepper */}
        <div className="relative mb-8 px-4 md:px-12 max-w-md mx-auto">
          <div className="relative flex justify-between items-start z-10 w-full">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const shortTitle = step.id === 1 ? 'Trip' : step.id === 2 ? 'Pay' : 'Confirm';
              
              return (
                <div key={step.id} className="relative flex flex-col items-center flex-1">
                  {/* Progress Line connecting to previous step */}
                  {index !== 0 && (
                    <div className="absolute top-[10px] left-[-50%] right-[50%] h-[2px] bg-white/20 z-0">
                      <div 
                        className={`h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(212,175,55,0.5)] ${
                          isCompleted || isCurrent ? 'w-full' : 'w-0'
                        }`} 
                      />
                    </div>
                  )}

                  {/* Dot */}
                  <div className={`relative z-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted || (currentStep === 3 && step.id === 3) ? 'w-5 h-5 bg-primary text-black' : 
                        isCurrent ? 'w-5 h-5 bg-primary shadow-[0_0_15px_rgba(212,175,55,0.6)]' : 
                        'w-5 h-5 bg-[#0a0a0a] border-2 border-white/20'
                      }`}
                  >
                    {(isCompleted || (currentStep === 3 && step.id === 3)) && <CheckCircle2 size={12} className="stroke-[3]" />}
                  </div>
                  
                  {/* Label */}
                  <span className={`text-[11px] font-bold uppercase tracking-widest mt-2 transition-opacity duration-300 ${isCurrent ? 'text-primary' : 'text-white/80'} ${!isCurrent && !isCompleted ? 'opacity-50' : 'opacity-100'}`}>
                    {shortTitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="grid lg:grid-cols-[1fr_380px] gap-12 items-start pb-32"
              >
                {/* Left Column: Form Cards */}
                <div className="space-y-8">
                  {/* Trip Details Card */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                    <h2 className="font-heading text-[30px] font-bold text-white mb-8 border-b border-white/5 pb-4">Trip Details</h2>
                    
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-[22px] font-semibold text-white mb-4">Location</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Pickup Location</label>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                              <Input disabled value="Gachibowli, Hyderabad (HQ)" className="pl-12 h-14 bg-black/40 border-white/10 text-[16px] text-white rounded-2xl disabled:opacity-100 disabled:cursor-not-allowed" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                              <strong className="text-primary font-bold">Note:</strong> Please collect the vehicle from our headquarters. If you require delivery to your specific location, please contact our support team. Additional delivery charges may apply.
                            </p>
                          </div>
                          {bookingType === 'drop' && (
                            <div>
                              <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Drop-off Location</label>
                              <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input className="pl-12 h-14 bg-black/40 border-white/10 text-[16px] text-white rounded-2xl focus-visible:ring-primary focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all" placeholder="Enter drop-off address" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <h3 className="text-[22px] font-semibold text-white mb-4">Schedule</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Pickup Date</label>
                            <Popover.Root open={isPickupOpen} onOpenChange={setIsPickupOpen}>
                              <Popover.Trigger asChild>
                                <button className="relative w-full text-left pl-12 h-14 bg-black/40 border border-white/10 text-[16px] text-white rounded-2xl hover:bg-white/5 focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] focus:border-primary transition-all flex items-center">
                                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                  {pickupDate ? format(parseISO(pickupDate), 'PPP') : <span className="text-muted-foreground">Select date</span>}
                                </button>
                              </Popover.Trigger>
                              <Popover.Portal>
                                <Popover.Content className="z-50 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 shadow-2xl" sideOffset={8}>
                                  <style>{`
                                    .rdp { --rdp-accent-color: #D4AF37; --rdp-background-color: rgba(212, 175, 55, 0.1); margin: 0; }
                                    .rdp-day_selected { font-weight: bold; }
                                    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: rgba(255,255,255,0.1); }
                                    
                                    .rdp-day-booked-custom {
                                      color: transparent !important;
                                      position: relative;
                                      pointer-events: none;
                                      opacity: 1;
                                    }
                                    .rdp-day-booked-custom::after {
                                      content: '';
                                      position: absolute;
                                      top: 50%; left: 50%;
                                      transform: translate(-50%, -50%);
                                      width: 24px; height: 24px;
                                      background-image: var(--booked-car-url);
                                      background-size: contain;
                                      background-repeat: no-repeat;
                                      background-position: center;
                                    }
                                  `}</style>
                                  <div style={{ '--booked-car-url': `url("${selectedCar?.images?.[0] || (selectedCar ? getFallbackImage(selectedCar.brand, selectedCar.model) : '')}")` } as React.CSSProperties}>
                                    <DayPicker
                                      mode="single"
                                      selected={pickupDate ? parseISO(pickupDate) : undefined}
                                      onSelect={(d) => {
                                        if (d) {
                                          setPickupDate(format(d, 'yyyy-MM-dd'));
                                          setIsPickupOpen(false);
                                        }
                                      }}
                                      disabled={[{ before: new Date() }, ...bookedDates]}
                                      modifiers={{ booked: bookedDates }}
                                      modifiersClassNames={{ booked: 'rdp-day-booked-custom' }}
                                    />
                                  </div>
                                </Popover.Content>
                              </Popover.Portal>
                            </Popover.Root>
                          </div>
                          {bookingType === 'rental' && (
                            <div>
                              <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Return Date</label>
                              <Popover.Root open={isReturnOpen} onOpenChange={setIsReturnOpen}>
                                <Popover.Trigger asChild>
                                  <button className="relative w-full text-left pl-12 h-14 bg-black/40 border border-white/10 text-[16px] text-white rounded-2xl hover:bg-white/5 focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] focus:border-primary transition-all flex items-center">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    {returnDate ? format(parseISO(returnDate), 'PPP') : <span className="text-muted-foreground">Select date</span>}
                                  </button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                  <Popover.Content className="z-50 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 shadow-2xl" sideOffset={8}>
                                    <style>{`
                                      .rdp { --rdp-accent-color: #D4AF37; --rdp-background-color: rgba(212, 175, 55, 0.1); margin: 0; }
                                      .rdp-day_selected { font-weight: bold; }
                                      .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: rgba(255,255,255,0.1); }
                                      
                                      .rdp-day-booked-custom {
                                        color: transparent !important;
                                        position: relative;
                                        pointer-events: none;
                                        opacity: 1;
                                      }
                                      .rdp-day-booked-custom::after {
                                        content: '';
                                        position: absolute;
                                        top: 50%; left: 50%;
                                        transform: translate(-50%, -50%);
                                        width: 24px; height: 24px;
                                        background-image: var(--booked-car-url);
                                        background-size: contain;
                                        background-repeat: no-repeat;
                                        background-position: center;
                                      }
                                    `}</style>
                                    <div style={{ '--booked-car-url': `url("${selectedCar?.images?.[0] || (selectedCar ? getFallbackImage(selectedCar.brand, selectedCar.model) : '')}")` } as React.CSSProperties}>
                                      <DayPicker
                                        mode="single"
                                        selected={returnDate ? parseISO(returnDate) : undefined}
                                        onSelect={(d) => {
                                          if (d) {
                                            setReturnDate(format(d, 'yyyy-MM-dd'));
                                            setIsReturnOpen(false);
                                          }
                                        }}
                                        disabled={[{ before: pickupDate ? parseISO(pickupDate) : new Date() }, ...bookedDates]}
                                        modifiers={{ booked: bookedDates }}
                                        modifiersClassNames={{ booked: 'rdp-day-booked-custom' }}
                                      />
                                    </div>
                                  </Popover.Content>
                                </Popover.Portal>
                              </Popover.Root>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Preference Card */}
                  {bookingType === 'rental' && (
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                      <h2 className="font-heading text-[30px] font-bold text-white mb-8 border-b border-white/5 pb-4">Driver Preference</h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div 
                          onClick={() => setDriverRequired(true)}
                          className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${driverRequired ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/10 hover:border-white/30 bg-black/40'}`}
                        >
                          {driverRequired && <div className="absolute top-4 right-4 text-primary"><CheckCircle2 size={24} /></div>}
                          <h3 className="text-[16px] font-bold text-white mb-2">Chauffeur Driven</h3>
                          <p className="text-[13px] text-muted-foreground leading-relaxed pr-8">Relax while our professional, vetted chauffeur drives you to your destination.</p>
                        </div>
                        <div 
                          onClick={() => setDriverRequired(false)}
                          className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${!driverRequired ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/10 hover:border-white/30 bg-black/40'}`}
                        >
                          {!driverRequired && <div className="absolute top-4 right-4 text-primary"><CheckCircle2 size={24} /></div>}
                          <h3 className="text-[16px] font-bold text-white mb-2">Self Drive</h3>
                          <p className="text-[13px] text-muted-foreground leading-relaxed pr-8">Take the wheel yourself. Requires a valid premium driving license and deposit.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Sticky Booking Summary */}
                <div className="sticky top-24 lg:top-32 space-y-6 z-20">
                  <details className="group bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden" open={window.innerWidth >= 1024}>
                    <summary className="font-heading text-[22px] text-white p-6 md:p-8 cursor-pointer flex justify-between items-center list-none outline-none marker:hidden lg:cursor-default lg:pointer-events-none">
                      Booking Summary
                      <ChevronRight size={20} className="lg:hidden text-primary transition-transform group-open:rotate-90" />
                    </summary>
                    
                    <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                      {selectedCar && (
                        <div className="mb-6">
                          <div className="flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent rounded-xl p-4 h-32 md:h-40 mb-4">
                            <img src={selectedCar.images?.[0] || getFallbackImage(selectedCar.brand, selectedCar.model)} alt={selectedCar.model} className="w-[180px] object-contain filter drop-shadow-2xl" />
                          </div>
                          
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-heading font-bold text-2xl text-white">{selectedCar.brand} {selectedCar.model}</h4>
                              <span className="inline-block px-2 py-1 mt-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded">Premium SUV</span>
                            </div>
                            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-white text-[13px] font-bold">
                              <span className="text-primary">★</span> 4.9
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-muted-foreground mt-4 mb-6">
                            <span className="flex items-center gap-1.5"><Users size={14}/> {selectedCar.seats} Seats</span>
                            <span className="flex items-center gap-1.5"><Flag size={14}/> {selectedCar.fuel_type}</span>
                            <span className="flex items-center gap-1.5"><Settings size={14}/> {selectedCar.transmission}</span>
                          </div>
                        </div>
                      )}

                      <hr className="border-white/10 mb-6" />
                      
                      {selectedCar ? (
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center text-[16px] text-muted-foreground">
                            <span>Price</span>
                            <span className="text-white font-bold">₹ {selectedCar.price_per_day}/day</span>
                          </div>
                          <div className="flex justify-between items-center text-[16px] text-muted-foreground">
                            <span>Taxes & Fees</span>
                            <span className="text-white font-medium">Calculated next</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">Loading vehicle details...</div>
                      )}
                      
                      {/* Trust Signals */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <div className="flex items-center gap-2 text-[12px] bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5 text-green-400 font-bold uppercase tracking-wider">
                          <CheckCircle2 size={14} /> Free Cancellation
                        </div>
                        <div className="flex items-center gap-2 text-[12px] bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5 text-green-400 font-bold uppercase tracking-wider">
                          <CheckCircle2 size={14} /> Instant Confirmation
                        </div>
                      </div>
                    </div>
                    <style>{`details > summary::-webkit-details-marker { display: none; }`}</style>
                  </details>
                </div>
                
                {/* Step 1 Footer Actions */}
                <div className="fixed bottom-0 inset-x-0 p-4 md:p-6 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 z-50 pb-[max(env(safe-area-inset-bottom,20px),20px)] shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
                  <div className="container max-w-[1120px] mx-auto flex justify-between items-center gap-4 px-2 md:px-8">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase mb-0.5">Total Price</span>
                      <span className="text-white font-heading font-bold text-2xl">
                        {selectedCar ? `₹${selectedCar.price_per_day}` : '...'}
                        <span className="text-sm font-normal text-muted-foreground">/day</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        onClick={currentStep === 1 ? () => navigate('/cars') : prevStep} 
                        disabled={loadingPreview}
                        className="hidden md:flex text-muted-foreground hover:text-white disabled:opacity-50 transition-all hover:-translate-y-[1px] hover:bg-transparent px-4"
                      >
                        <ChevronLeft className="mr-1" size={18} /> Back
                      </Button>
                      <Button 
                        className="group bg-primary text-black px-8 h-14 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.25)] font-bold text-[16px] transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_25px_rgba(212,175,55,0.4)] disabled:opacity-50"
                        onClick={nextStep}
                        disabled={loadingPreview}
                      >
                        {loadingPreview ? (
                          <><Loader2 className="animate-spin mr-2" size={20} /> Loading...</>
                        ) : (
                          <>Continue <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} /></>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="grid lg:grid-cols-[1fr_380px] gap-8 items-start bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 md:p-8 pb-32 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
              >
                {/* Left Column: Details & Forms */}
                <div className="space-y-6">
                  
                  {/* Car Details Section */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                      <div className="w-full md:w-auto h-32 flex-shrink-0 flex items-center justify-center">
                        <img src={selectedCar?.images?.[0] || (selectedCar ? getFallbackImage(selectedCar.brand, selectedCar.model) : "https://freepngimg.com/thumb/car/3-2-car-free-download-png.png")} alt="Car preview" className="w-[140px] md:w-[160px] object-contain filter drop-shadow-2xl" />
                      </div>
                      
                      <div className="flex-1 w-full pt-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="text-2xl font-heading font-bold text-white tracking-wide mb-1">{selectedCar?.brand} {selectedCar?.model}</h3>
                            <p className="text-primary text-xs font-semibold tracking-wider uppercase">Luxury Class</p>
                          </div>
                          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-white text-[12px] font-bold">
                            <span className="text-primary">★</span> 4.9
                          </div>
                        </div>
                        
                        {/* Minimal Specs */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mt-3">
                          <div className="flex items-center gap-1.5"><Users size={14} className="text-white/60" /> {selectedCar?.seats} Seats</div>
                          <div className="flex items-center gap-1.5"><Settings size={14} className="text-white/60" /> {selectedCar?.transmission}</div>
                          <div className="flex items-center gap-1.5"><Flag size={14} className="text-white/60" /> {selectedCar?.fuel_type}</div>
                        </div>

                        {/* Included Benefits Chips */}
                        <div className="flex flex-wrap gap-2.5 mt-4">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[11px] font-semibold">
                            <CheckCircle2 size={12} /> Free Cancellation
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-white/80 text-[11px] font-semibold">
                            <CheckCircle2 size={12} className="text-primary" /> Damage Waiver
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing Profile Summary */}
                  <details className="group bg-white/[0.02] border border-white/10 rounded-2xl transition-all duration-300">
                    <summary className="flex justify-between items-center p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-xl text-white">Billing Profile</h3>
                        <ChevronRight size={16} className="text-white/40 transition-transform group-open:rotate-90" />
                      </div>
                      <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                        <Edit2 size={12} /> Edit
                      </button>
                    </summary>
                    
                    <div className="px-5 pb-5 pt-1 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-300">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users size={18} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">{user?.name || 'Verified Customer'}</h4>
                          <p className="text-xs text-primary">{user?.role === 'ADMIN' ? 'Administrator Account' : 'Premium Member Account'}</p>
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                          <p className="text-sm text-white font-medium">{user?.email || 'Not Provided'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Phone Number</p>
                          <p className="text-sm text-white font-medium">{user?.phone || 'Not Provided'}</p>
                        </div>
                      </div>
                        
                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck size={16} className="text-green-400" />
                        Using your verified primary profile details for this booking.
                      </div>
                    </div>
                  </details>

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-heading text-2xl text-white mb-6">Payment Method</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div 
                        onClick={() => setPaymentMethod('card')}
                        className={`relative p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-300 border ${paymentMethod === 'card' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
                      >
                        {paymentMethod === 'card' && <div className="absolute top-1/2 -translate-y-1/2 right-4 text-primary"><CheckCircle2 size={18} /></div>}
                        <CreditCard size={28} className={`${paymentMethod === 'card' ? 'text-primary' : 'text-white/60'}`} />
                        <div>
                          <h4 className="font-bold text-white text-sm mb-0.5">Credit / Debit Card</h4>
                          <p className="text-[11px] text-muted-foreground">Pay securely with card</p>
                        </div>
                      </div>
                      <div 
                        onClick={() => setPaymentMethod('upi')}
                        className={`relative p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-300 border ${paymentMethod === 'upi' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
                      >
                        {paymentMethod === 'upi' && <div className="absolute top-1/2 -translate-y-1/2 right-4 text-primary"><CheckCircle2 size={18} /></div>}
                        <div className={`w-7 flex items-center justify-center font-bold text-lg leading-none ${paymentMethod === 'upi' ? 'text-primary' : 'text-white/60'}`}>UPI</div>
                        <div>
                          <h4 className="font-bold text-white text-sm mb-0.5">UPI</h4>
                          <p className="text-[11px] text-muted-foreground">GPay, PhonePe, Paytm</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Sticky Summary */}
                <div className="sticky top-32 space-y-6 pb-28 md:pb-32">
                  
                  {/* Price Summary */}
                  <div className="bg-black/60 backdrop-blur-xl border border-primary/30 rounded-3xl p-5 md:p-6 shadow-[0_0_40px_rgba(212,175,55,0.08)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] -z-10" />
                    
                    <h4 className="font-heading text-2xl text-white mb-6">Price Summary</h4>
                    
                    {/* Itinerary Summary inside Price Card for cohesion */}
                    <div className="mb-6 flex flex-row justify-between gap-4">
                      <div className="flex gap-3">
                        <MapPin className="text-primary shrink-0" size={18} />
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5 uppercase tracking-wider font-semibold">Pick-up</p>
                          <p className="text-sm font-bold text-white">{pickupDate || 'Tomorrow'}</p>
                          <p className="text-[11px] text-white/50">Gachibowli, HQ</p>
                        </div>
                      </div>
                      
                      {bookingType === 'rental' && (
                        <div className="flex gap-3">
                          <Flag className="text-primary shrink-0" size={18} />
                          <div>
                            <p className="text-[11px] text-muted-foreground mb-0.5 uppercase tracking-wider font-semibold">Drop-off</p>
                            <p className="text-sm font-bold text-white">{returnDate || 'Next Sunday'}</p>
                            <p className="text-[11px] text-white/50">Gachibowli, HQ</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <hr className="border-white/10 my-6" />

                    {previewData ? (
                      <>
                        <div className="space-y-6 text-sm mb-6">
                          <div className="flex justify-between items-center text-muted-foreground">
                            <span>Rental fee ({previewData.num_days} days)</span>
                            <span className="text-white">₹{previewData.car_price.toLocaleString()}</span>
                          </div>
                          
                          {previewData.driver_charges > 0 && (
                            <div className="flex justify-between items-center text-muted-foreground">
                              <span>Driver charges</span>
                              <span className="text-white">₹{previewData.driver_charges.toLocaleString()}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-green-400 font-medium">
                            <span>Discount ({discountPercentage}% Off)</span>
                            <span>-₹{((previewData.total_amount * discountPercentage) / 100).toLocaleString()}</span>
                          </div>
                        </div>

                        <hr className="border-white/10 my-6" />
                        
                        <div className="flex flex-col mb-4">
                          <span className="block text-sm text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Total Amount</span>
                          <span className="text-[36px] md:text-[40px] font-heading font-bold text-primary leading-none">
                            ₹{(previewData.total_amount - (previewData.total_amount * discountPercentage) / 100).toLocaleString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <p>Error loading price.</p>
                      </div>
                    )}

                    <label className="flex items-start gap-3 mt-8 mb-2 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer transition-colors hover:bg-white/10">
                      <input type="checkbox" id="terms" className="mt-1 w-5 h-5 rounded border-white/20 bg-black/50 checked:bg-primary checked:border-primary focus:ring-primary focus:ring-offset-background shrink-0" />
                      <span className="text-[14px] text-white leading-relaxed">
                        I agree to the <span className="text-primary hover:underline">Terms & Conditions</span> and cancellation policy.
                        <span className="block text-xs text-muted-foreground mt-1">Required before payment</span>
                      </span>
                    </label>
                  </div>

                  {/* Trust Signals */}
                  <div className="flex flex-wrap gap-2 px-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70 font-bold uppercase tracking-wider">
                      <Shield size={12} className="text-primary" /> Secure
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70 font-bold uppercase tracking-wider">
                      <CheckCircle2 size={12} className="text-primary" /> No Hidden Fees
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70 font-bold uppercase tracking-wider">
                      <HelpCircle size={12} className="text-primary" /> 24/7
                    </div>
                  </div>

                </div>
                
                {/* Step 2 Footer Actions */}
                <div className="fixed bottom-0 inset-x-0 p-4 md:p-6 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 z-50 pb-[max(env(safe-area-inset-bottom,20px),20px)] shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
                  <div className="container max-w-[1120px] mx-auto">
                    <div className="flex items-center justify-center gap-2 text-[12px] text-green-400 font-medium mb-4 text-center">
                      <ShieldCheck size={14} />
                      Your payment is encrypted and secure. You won't be charged until confirmed.
                    </div>
                    <div className="flex justify-between items-center gap-4 px-2 md:px-8">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase mb-0.5">Total Amount</span>
                        <span className="text-white font-heading font-bold text-2xl">
                          {previewData ? `₹${(previewData.total_amount - (previewData.total_amount * discountPercentage) / 100).toLocaleString()}` : '...'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          onClick={prevStep} 
                          disabled={confirmingBooking}
                          className="hidden md:flex text-muted-foreground hover:text-white disabled:opacity-50 transition-all hover:-translate-y-[1px] hover:bg-transparent px-4"
                        >
                          <ChevronLeft className="mr-1" size={18} /> Back
                        </Button>
                        <Button 
                          className="group bg-primary text-black px-8 h-14 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.25)] font-bold text-[16px] transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_25px_rgba(212,175,55,0.4)] disabled:opacity-50"
                          onClick={handleConfirmBooking}
                          disabled={confirmingBooking}
                        >
                          {confirmingBooking ? (
                            <><Loader2 className="animate-spin mr-2" size={20} /> Processing...</>
                          ) : (
                            'Book Now'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-w-2xl mx-auto"
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 text-primary relative">
                    <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20 duration-1000" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    >
                      <CheckCircle2 size={40} className="stroke-[3]" />
                    </motion.div>
                  </div>
                  <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-2">Booking Confirmed</h2>
                  <p className="text-primary font-medium tracking-wide">#{Math.random().toString(36).substr(2, 6).toUpperCase()}-24</p>
                </div>

                {/* Booking Summary Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8 text-left">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                    <div className="w-20 h-12 relative rounded-md flex items-center justify-center bg-black/40 border border-white/10 px-1">
                      <img 
                        src={selectedCar?.images?.[0] || (selectedCar ? getFallbackImage(selectedCar.brand, selectedCar.model) : "https://freepngimg.com/thumb/car/3-2-car-free-download-png.png")} 
                        alt="Vehicle" 
                        className="w-full h-full object-contain filter drop-shadow-lg" 
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : (previewData?.vehicle?.name || 'Luxury Vehicle')}</h4>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{selectedCar?.category || previewData?.vehicle?.category || 'Premium Class'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pickup Date</p>
                      <p className="text-sm font-semibold text-white">{pickupDate || 'Tomorrow'}</p>
                      <p className="text-[11px] text-white/50 mt-0.5">09:00 AM</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                      <p className="text-sm font-semibold text-white">Gachibowli</p>
                      <p className="text-[11px] text-white/50 mt-0.5">Headquarters</p>
                    </div>
                    <div className="col-span-2 md:col-span-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Driver Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        <p className="text-sm font-semibold text-yellow-500">Assigning Driver...</p>
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">You will be notified shortly</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 px-8 h-12 rounded-xl">
                    <Download className="mr-2" size={18} /> Download Invoice
                  </Button>
                  <Button onClick={() => navigate('/profile')} className="w-full sm:w-auto bg-primary text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] px-10 h-12 rounded-xl font-bold transition-all">
                    <Users className="mr-2" size={18} /> Back to Dashboard
                  </Button>
                </div>

                {/* Footer Trust Signals */}
                <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-muted-foreground border-t border-white/10 pt-6">
                  <span className="flex items-center gap-1.5"><Shield size={14} className="text-primary" /> Secure Booking</span>
                  <span className="hidden sm:block">•</span>
                  <span className="flex items-center gap-1.5"><HelpCircle size={14} className="text-primary" /> 24/7 Support</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
