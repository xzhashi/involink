import { InvoiceData } from './types';

export const calculateInvoiceTotal = (invoice: InvoiceData): number => {
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  const taxAmount = (subtotal * (invoice.taxRate || 0)) / 100;
  
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