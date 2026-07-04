import React from 'react';
import { format } from 'date-fns';

interface InvoiceTemplateProps {
  bookingId: string;
  bookingData: any;
  carData: any;
  dates: { pickup: string; return: string };
  previewData: any;
  discount: number;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  bookingId,
  bookingData,
  carData,
  dates,
  previewData,
  discount
}) => {
  if (!previewData) return null;

  const invoiceDate = format(new Date(), 'dd MMM yyyy');
  const paidBy = bookingData?.paid_by || 'Customer';
  const totalAmount = previewData.total_amount;
  const finalAmount = totalAmount - discount;
  const bookingType = bookingData?.booking_type || 'rental';

  return (
    <div id="invoice-template" className="bg-[#111] text-white p-10 w-[800px] font-sans mx-auto relative overflow-hidden" style={{ minHeight: '1050px' }}>
      
      {/* Decorative Gold Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#8a7322] via-[#d4af37] to-[#8a7322]" />
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex justify-between items-start border-b border-white/10 pb-8 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center bg-black">
              <span className="text-primary font-heading font-bold text-xl">VT</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-3xl tracking-wide">Vibe <span className="text-primary">Travels</span></h1>
              <p className="text-[10px] text-primary tracking-[0.2em] uppercase">Premium Car Rentals</p>
            </div>
          </div>
          <div className="mt-6 text-sm text-muted-foreground leading-relaxed">
            <p>123 Luxury Avenue, Banjara Hills</p>
            <p>Hyderabad, TS 500034</p>
            <p>support@vibetravels.com</p>
            <p>+91 98765 43210</p>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-4xl font-heading text-white uppercase tracking-wider mb-2">Invoice</h2>
          <p className="text-primary font-medium text-lg">#{bookingId.toUpperCase()}</p>
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="mb-1"><span className="text-white">Date:</span> {invoiceDate}</p>
            <p><span className="text-white">Status:</span> <span className="text-green-500 font-bold">PAID</span></p>
          </div>
        </div>
      </div>

      {/* Customer & Vehicle Info */}
      <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-[11px] text-primary font-bold uppercase tracking-wider mb-4">Billed To</h3>
          <p className="text-lg font-bold text-white mb-1">{paidBy}</p>
          {bookingData?.customer_phone && <p className="text-sm text-muted-foreground mb-1">{bookingData.customer_phone}</p>}
          {bookingData?.customer_email && <p className="text-sm text-muted-foreground">{bookingData.customer_email}</p>}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-[11px] text-primary font-bold uppercase tracking-wider mb-4">Vehicle Details</h3>
          <p className="text-lg font-bold text-white mb-1">{carData?.brand} {carData?.model}</p>
          <p className="text-sm text-muted-foreground mb-1">Type: {bookingType === 'rental' ? 'Self Drive' : 'Chauffeur Driven'}</p>
          <div className="flex gap-4 mt-3 text-xs">
            <div>
              <p className="text-primary/70 mb-0.5">Pickup</p>
              <p className="text-white">{dates.pickup || 'N/A'}</p>
            </div>
            {bookingType === 'rental' && (
              <div>
                <p className="text-primary/70 mb-0.5">Return</p>
                <p className="text-white">{dates.return || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Bill */}
      <div className="mb-8 relative z-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-white/20">
              <th className="py-4 text-[11px] text-primary font-bold uppercase tracking-wider">Description</th>
              <th className="py-4 text-[11px] text-primary font-bold uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-white/5">
            <tr>
              <td className="py-4">
                <p className="text-white font-medium">Vehicle Rental Charges</p>
                <p className="text-muted-foreground text-xs mt-1">Base rate for {previewData.num_days} days</p>
              </td>
              <td className="py-4 text-right text-white font-medium">₹{previewData.car_price.toLocaleString()}</td>
            </tr>
            {previewData.driver_charges > 0 && (
              <tr>
                <td className="py-4">
                  <p className="text-white font-medium">Professional Chauffeur Fees</p>
                  <p className="text-muted-foreground text-xs mt-1">Driver allowance for {previewData.num_days} days</p>
                </td>
                <td className="py-4 text-right text-white font-medium">₹{previewData.driver_charges.toLocaleString()}</td>
              </tr>
            )}
            {discount > 0 && (
              <tr>
                <td className="py-4">
                  <p className="text-primary font-medium">Membership Discount</p>
                </td>
                <td className="py-4 text-right text-primary font-medium">- ₹{discount.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end relative z-10">
        <div className="w-64 bg-primary/10 border border-primary/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-white">₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-4 text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-primary">- ₹{discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center border-t border-primary/30 pt-4">
            <span className="text-lg font-bold text-white uppercase tracking-wide">Total</span>
            <span className="text-2xl font-bold text-primary font-heading">₹{finalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 left-10 right-10 border-t border-white/10 pt-6 text-center text-xs text-muted-foreground">
        <p className="mb-1">Thank you for choosing Vibe Travels for your luxury journey.</p>
        <p>For any queries regarding this invoice, please contact support@vibetravels.com</p>
        <p className="mt-4 font-heading text-primary/50 text-xl italic">Experience The Pinnacle.</p>
      </div>
      
      {/* "PAID" Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] pointer-events-none opacity-[0.03] flex items-center justify-center">
        <span className="text-[150px] font-bold text-white border-[10px] border-white p-8 rounded-3xl">PAID</span>
      </div>

    </div>
  );
};
