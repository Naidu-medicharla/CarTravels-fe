import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, ChevronLeft, MapPin, Calendar, CreditCard, ShieldCheck, Users, Briefcase, Navigation, Settings, Loader2, Flag, Lock, Shield, HelpCircle, Download, X } from 'lucide-react';
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#181818,#0b0b0b)] pt-20 pb-24 relative overflow-hidden flex flex-col items-center">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

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
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-5xl md:text-6xl text-white mb-4 tracking-wide">Complete Your <span className="text-primary">Booking</span></h1>
          <p className="text-muted-foreground text-lg">Reserve your luxury vehicle in just a few steps.</p>
        </div>

        {/* Stepper */}
        <div className="relative flex justify-between items-center mb-10 px-8 md:px-12 max-w-2xl mx-auto">
          <div className="absolute left-[60px] right-[60px] top-6 h-[1px] bg-white/20 -z-10" />
          <div 
            className="absolute left-[60px] top-6 h-[2px] bg-primary -z-10 transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
            style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - ${((currentStep - 1) / (steps.length - 1)) * 120}px)` }}
          />
          
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className={`flex flex-col items-center gap-3 transition-opacity duration-300 ${!isCurrent && !isCompleted ? 'opacity-50' : 'opacity-100'}`}>
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted ? 'bg-primary border-primary text-black' : 
                      isCurrent ? 'bg-background border-primary text-primary shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 
                      'bg-background border-white/20 text-muted-foreground'
                    }`}
                >
                  {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-white'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
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
                <div className="space-y-6">
                  {/* Trip Details Card */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                    <h2 className="font-heading text-3xl font-bold text-white mb-8 border-b border-white/5 pb-4">Trip Details</h2>
                    
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Location</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Pickup Location</label>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                              <Input disabled value="Gachibowli, Hyderabad (HQ)" className="pl-12 h-14 bg-black/40 border-white/10 text-white rounded-xl disabled:opacity-100 disabled:cursor-not-allowed" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                              <strong className="text-primary font-bold">Note:</strong> Please collect the vehicle from our headquarters. If you require delivery to your specific location, please contact our support team. Additional delivery charges may apply.
                            </p>
                          </div>
                          {bookingType === 'drop' && (
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Drop-off Location</label>
                              <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input className="pl-12 h-14 bg-black/40 border-white/10 text-white rounded-xl focus-visible:ring-primary" placeholder="Enter drop-off address" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Schedule</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Pickup Date</label>
                            <Popover.Root open={isPickupOpen} onOpenChange={setIsPickupOpen}>
                              <Popover.Trigger asChild>
                                <button className="relative w-full text-left pl-12 h-14 bg-black/40 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors flex items-center">
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
                              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Return Date</label>
                              <Popover.Root open={isReturnOpen} onOpenChange={setIsReturnOpen}>
                                <Popover.Trigger asChild>
                                  <button className="relative w-full text-left pl-12 h-14 bg-black/40 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors flex items-center">
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
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                      <h2 className="font-heading text-3xl font-bold text-white mb-8 border-b border-white/5 pb-4">Driver Preference</h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div 
                          onClick={() => setDriverRequired(true)}
                          className={`p-6 rounded-2xl cursor-pointer transition-colors border ${driverRequired ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'border-white/10 hover:border-white/30 bg-black/40'}`}
                        >
                          <h3 className="text-lg font-bold text-white mb-2">Chauffeur Driven</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">Relax while our professional, vetted chauffeur drives you to your destination.</p>
                        </div>
                        <div 
                          onClick={() => setDriverRequired(false)}
                          className={`p-6 rounded-2xl cursor-pointer transition-colors border ${!driverRequired ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'border-white/10 hover:border-white/30 bg-black/40'}`}
                        >
                          <h3 className="text-lg font-bold text-white mb-2">Self Drive</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">Take the wheel yourself. Requires a valid premium driving license and deposit.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Sticky Booking Summary */}
                <div className="sticky top-32 space-y-6">
                  <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                    <h3 className="font-heading text-2xl text-white mb-6">Booking Summary</h3>
                    
                    {selectedCar && (
                      <div className="mb-6">
                        <div className="flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent rounded-xl p-4 h-40 mb-4">
                          <img src={selectedCar.images?.[0] || getFallbackImage(selectedCar.brand, selectedCar.model)} alt={selectedCar.model} className="max-h-full object-contain filter drop-shadow-2xl scale-110" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-heading font-bold text-2xl text-white">{selectedCar.brand} {selectedCar.model}</h4>
                            <span className="inline-block px-2 py-1 mt-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded">Premium SUV</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-white text-xs font-bold">
                            <span className="text-primary">★</span> 4.9
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mt-4 mb-6">
                          <span className="flex items-center gap-1.5"><Users size={14}/> {selectedCar.seats} Seats</span>
                          <span className="flex items-center gap-1.5"><Flag size={14}/> {selectedCar.fuel_type}</span>
                          <span className="flex items-center gap-1.5"><Settings size={14}/> {selectedCar.transmission}</span>
                        </div>
                      </div>
                    )}

                    <hr className="border-white/10 mb-6" />
                    
                    {selectedCar ? (
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>Price per day</span>
                          <span className="text-white font-medium">₹ {selectedCar.price_per_day}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>Taxes & Fees</span>
                          <span className="text-white font-medium">Calculated next</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-sm text-muted-foreground">Loading vehicle details...</div>
                    )}
                    
                    {/* Trust Signals */}
                    <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
                        <CheckCircle2 size={14} /> Free Cancellation up to 24h
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
                        <CheckCircle2 size={14} /> Instant Confirmation
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 1 Footer Actions */}
                <div className="fixed bottom-0 left-0 w-full p-6 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/10 flex justify-between items-center z-50">
                  <div className="container max-w-[1120px] mx-auto flex justify-between items-center w-full px-4 md:px-8">
                    <Button 
                      variant="ghost" 
                      onClick={currentStep === 1 ? () => navigate('/cars') : prevStep} 
                      disabled={loadingPreview}
                      className="text-muted-foreground hover:text-white disabled:opacity-50 transition-all hover:-translate-y-[1px] hover:bg-transparent"
                    >
                      <ChevronLeft className="mr-1" size={18} /> Back
                    </Button>
                    <Button 
                      className="group bg-primary text-black px-8 h-12 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.2)] font-semibold transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_25px_rgba(212,175,55,0.4)] disabled:opacity-50"
                      onClick={nextStep}
                      disabled={loadingPreview}
                    >
                      {loadingPreview ? (
                        <><Loader2 className="animate-spin mr-2" size={20} /> Loading...</>
                      ) : (
                        <>Continue <ChevronRight className="ml-1 transition-transform group-hover:translate-x-1" size={18} /></>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="grid lg:grid-cols-[1fr_380px] gap-10 items-start bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-10 md:p-12 pb-32 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
              >
                {/* Left Column: Details & Forms */}
                <div className="space-y-12">
                  
                  {/* Car Details Section */}
                  <div>
                    <div className="flex items-end justify-between mb-6">
                      <h2 className="font-heading text-3xl text-white">Review & Checkout</h2>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <div className="w-full md:w-64 h-48 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-4">
                        <img src={selectedCar?.images?.[0] || (selectedCar ? getFallbackImage(selectedCar.brand, selectedCar.model) : "https://freepngimg.com/thumb/car/3-2-car-free-download-png.png")} alt="Car preview" className="max-h-full object-contain filter drop-shadow-2xl scale-110" />
                      </div>
                      
                      <div className="flex-1 w-full pt-2">
                        <div className="mb-4">
                          <h3 className="text-3xl font-heading font-bold text-white tracking-wide mb-1">Vehicle - {carNumber}</h3>
                          <p className="text-primary text-sm font-semibold tracking-wider uppercase">Luxury Class</p>
                        </div>
                        
                        {/* Minimal Specs */}
                        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground mb-6">
                          <div className="flex items-center gap-2"><Users size={16} className="text-white/60" /> 4 Seats</div>
                          <div className="flex items-center gap-2"><Settings size={16} className="text-white/60" /> Auto</div>
                          <div className="flex items-center gap-2"><Briefcase size={16} className="text-white/60" /> 2 Luggage</div>
                          <div className="flex items-center gap-2"><Navigation size={16} className="text-white/60" /> Unlimited Mileage</div>
                        </div>
                      </div>
                    </div>

                    {/* Included Benefits Chips */}
                    <div className="flex flex-wrap gap-3 mt-6">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                        <CheckCircle2 size={14} /> Free Cancellation
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold">
                        <CheckCircle2 size={14} className="text-primary" /> Damage Waiver
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold">
                        <CheckCircle2 size={14} className="text-primary" /> Instant Confirmation
                      </div>
                    </div>
                  </div>

                  {/* Billing Profile Summary */}
                  <div>
                    <h3 className="font-heading text-2xl text-white mb-6">Billing Profile</h3>
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users size={24} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg">{user?.name || 'Verified Customer'}</h4>
                          <p className="text-sm text-primary">{user?.role === 'ADMIN' ? 'Administrator Account' : 'Premium Member Account'}</p>
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                          <p className="text-white font-medium">{user?.email || 'Not Provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Phone Number</p>
                          <p className="text-white font-medium">{user?.phone || 'Not Provided'}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck size={16} className="text-green-400" />
                        Using your verified primary profile details for this booking.
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-heading text-2xl text-white mb-6">Payment Method</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div 
                        onClick={() => setPaymentMethod('card')}
                        className={`p-5 rounded-2xl cursor-pointer transition-all border ${paymentMethod === 'card' ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'bg-white/[0.02] border-white/10 hover:border-white/30'}`}
                      >
                        <CreditCard size={24} className={`mb-3 ${paymentMethod === 'card' ? 'text-primary' : 'text-white/60'}`} />
                        <h4 className="font-bold text-white mb-1">Credit / Debit Card</h4>
                        <p className="text-xs text-muted-foreground">Pay securely with card</p>
                      </div>
                      <div 
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-5 rounded-2xl cursor-pointer transition-all border ${paymentMethod === 'upi' ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'bg-white/[0.02] border-white/10 hover:border-white/30'}`}
                      >
                        <div className={`w-6 h-6 mb-3 font-bold text-lg leading-none ${paymentMethod === 'upi' ? 'text-primary' : 'text-white/60'}`}>UPI</div>
                        <h4 className="font-bold text-white mb-1">UPI</h4>
                        <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pb-12" /> {/* Bottom Spacing */}
                </div>

                {/* Right Column: Sticky Summary */}
                <div className="sticky top-32 space-y-6">
                  
                  {/* Price Summary */}
                  <div className="bg-black/60 backdrop-blur-xl border border-primary/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(212,175,55,0.08)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] -z-10" />
                    
                    <h4 className="font-heading text-2xl text-white mb-8">Price Summary</h4>
                    
                    {/* Itinerary Summary inside Price Card for cohesion */}
                    <div className="mb-8 space-y-6">
                      <div className="flex gap-4">
                        <MapPin className="text-primary shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Pick-up</p>
                          <p className="text-sm font-semibold text-white">{pickupDate || 'Tomorrow'}</p>
                          <p className="text-xs text-white/60">Gachibowli, HQ</p>
                        </div>
                      </div>
                      
                      {bookingType === 'rental' && (
                        <div className="flex gap-4">
                          <Flag className="text-primary shrink-0" size={20} />
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Drop-off</p>
                            <p className="text-sm font-semibold text-white">{returnDate || 'Next Sunday'}</p>
                            <p className="text-xs text-white/60">Gachibowli, HQ</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <hr className="border-white/10 my-6" />

                    {previewData ? (
                      <>
                        <div className="space-y-4 text-sm mb-6">
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
                        
                        <div className="flex flex-col mb-8">
                          <span className="block text-sm text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Total Amount</span>
                          <span className="text-4xl font-heading font-bold text-primary">
                            ₹{(previewData.total_amount - (previewData.total_amount * discountPercentage) / 100).toLocaleString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <p>Error loading price.</p>
                      </div>
                    )}

                    <div className="flex items-start gap-3 mb-8">
                      <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-primary checked:border-primary focus:ring-primary focus:ring-offset-background" />
                      <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                        I understand & agree with the <span className="text-primary hover:underline">Terms & Conditions</span> and cancellation policy.
                      </label>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-3">
                      <Button 
                        variant="ghost" 
                        onClick={prevStep} 
                        disabled={confirmingBooking}
                        className="h-14 flex-1 text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <ChevronLeft className="mr-1" size={18} /> Back
                      </Button>
                      <Button 
                        className="h-14 flex-[2] bg-primary text-black font-bold text-lg rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.5)] transition-all hover:-translate-y-[2px] disabled:opacity-50" 
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
                    <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-white/40 uppercase tracking-widest font-semibold">
                      <Lock size={12} /> Secure Checkout
                    </div>
                  </div>

                  {/* Trust Signals */}
                  <div className="grid grid-cols-2 gap-4 px-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield size={16} className="text-white/60" /> Secure Payment
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <HelpCircle size={16} className="text-white/60" /> 24/7 Support
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={16} className="text-white/60" /> No Hidden Fees
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CreditCard size={16} className="text-white/60" /> Flexible Options
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
              >
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-8 text-primary relative">
                  <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20" />
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="font-heading font-bold text-4xl text-white mb-4">Booking Confirmed!</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Your luxury vehicle has been reserved successfully. Booking ID: <strong className="text-white">#LD-789456</strong>
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-6 h-12 rounded-full">
                    <Download className="mr-2" size={18} /> Download Invoice
                  </Button>
                  <Button onClick={() => navigate('/profile')} className="bg-primary text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] px-8 h-12 rounded-full font-bold transition-all">
                    Go to Dashboard
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
