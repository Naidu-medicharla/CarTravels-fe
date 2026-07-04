import React, { useState } from 'react';
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#181818,#0b0b0b)] pt-28 pb-8 relative overflow-hidden flex flex-col items-center">
      <div className="container w-full max-w-[1120px] px-4 md:px-8 pt-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }}
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
            <p className="text-primary font-medium tracking-wide text-lg">#{bookingId?.toUpperCase()}</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-8 mb-8 text-center bg-white/5 border border-white/10">
            <h3 className="text-xl font-heading text-white mb-2">Your luxury ride is secured!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              We have sent a detailed confirmation email with your itinerary and receipt. 
              Our concierge team will contact you shortly to confirm any specific requirements.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Processing Driver Assignment
            </div>
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
                {isGenerating ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Download className="mr-2" size={18} />} 
                {isGenerating ? 'Generating PDF...' : 'Download Invoice'}
              </Button>
            )}
            <Button onClick={() => navigate('/profile', { replace: true })} className="w-full sm:w-auto bg-primary text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] px-10 h-12 rounded-xl font-bold transition-all">
              <Users className="mr-2" size={18} /> Back to Dashboard
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
