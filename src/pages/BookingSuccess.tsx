import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoiceTemplate } from '@/components/InvoiceTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const BookingSuccess: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [driverAssigned, setDriverAssigned] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDriverAssigned(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Read data passed from BookingFlow
  const { booking, car, dates, discount, preview } = location.state || {};

  const handleDownloadInvoice = async () => {
    if (!booking || !car || !preview) return; // Silent fail if no data
    
    setIsGenerating(true);
    try {
      const element = document.getElementById('invoice-template');
      if (!element) return;

      // Ensure styles are loaded by waiting a tick
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#111111'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`VibeTravels_Invoice_${bookingId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#181818,#0b0b0b)] pt-32 pb-8 relative overflow-hidden flex flex-col items-center">
      {/* Very faint radial gold glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="container w-full max-w-[1120px] px-4 md:px-8 pt-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-10 pt-10 md:pt-14 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-w-2xl mx-auto"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary relative">
              <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20 duration-1000" />
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.05, 1.0] }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <CheckCircle2 size={40} className="stroke-[3]" />
              </motion.div>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-2">Reservation Confirmed</h2>
            <p className="text-primary font-medium tracking-wide text-lg">Reservation #VT-2026-{bookingId?.toUpperCase()?.substring(0, 4) || '0032'}</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-8 mb-10 text-center bg-white/5 border border-white/10">
            <p className="text-muted-foreground text-[15px] leading-relaxed mb-0">
              Your luxury ride has been reserved.<br/>
              A confirmation email and invoice have been sent.<br/>
              Our concierge team will contact you if any additional arrangements are required.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {location.state && (
              <Button 
                onClick={handleDownloadInvoice} 
                disabled={isGenerating}
                variant="outline" 
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 px-8 h-12 rounded-xl transition-all"
              >
                {isGenerating ? <Loader2 className="mr-2 animate-spin text-[#D4AF37]" size={18} /> : <Download className="mr-2 text-[#D4AF37]" size={18} />} 
                {isGenerating ? 'Generating PDF...' : 'Download Invoice'}
              </Button>
            )}
            <Button onClick={() => navigate('/profile', { replace: true })} className="group relative overflow-hidden w-full sm:w-auto bg-primary text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] px-10 h-12 rounded-xl font-bold transition-all">
              <motion.div 
                className="absolute inset-0 w-1/2 h-full bg-white/30 skew-x-12"
                initial={{ x: '-200%' }}
                animate={{ x: '300%' }}
                transition={{ duration: 1.5, delay: 0.8, ease: 'easeInOut' }}
              />
              <Users className="mr-2 relative z-10" size={18} /> <span className="relative z-10">Back to Dashboard</span>
            </Button>
          </div>

        </motion.div>
      </div>

      {/* Hidden Invoice Template for PDF Generation */}
      {location.state && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <InvoiceTemplate 
            bookingId={bookingId || ''}
            bookingData={booking}
            carData={car}
            dates={dates}
            discount={discount}
            previewData={preview}
          />
        </div>
      )}
    </div>
  );
};
