import { InvoiceData } from './types.ts';
import QRCode from 'qrcode';

export const calculateInvoiceTotal = (invoice: InvoiceData): number => {
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  
  const taxAmount = (invoice.taxes || []).reduce((acc, tax) => {
    return acc + (subtotal * (tax.rate || 0)) / 100;
  }, 0);
  
  let discountAmount = 0;
  if (invoice.discount && invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage'
      ? (subtotal * invoice.discount.value) / 100
      : invoice.discount.value;
  }
  
  return subtotal + taxAmount - discountAmount;
};

// Helper function to download a data URL
export const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// New helper function to generate UPI link and QR code
export const generateUpiDetails = async (
    upiId: string, 
    amount: number, 
    payeeName: string, 
    invoiceId: string,
    transactionNote?: string
): Promise<{ upiLink: string, qrCodeDataUrl: string } | null> => {
    if (!upiId || amount <= 0) {
        return null;
    }

    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: amount.toFixed(2),
      cu: 'INR',
      tr: invoiceId,
      tn: transactionNote || `Payment for Invoice #${invoiceId}`,
    });

    const upiLink = `upi://pay?${params.toString()}`;
    
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(upiLink, { errorCorrectionLevel: 'M', width: 256 });
        return { upiLink, qrCodeDataUrl };
    } catch (err) {
        console.error("Failed to generate QR code:", err);
        return { upiLink, qrCodeDataUrl: '' }; // Return link even if QR fails
    }
};