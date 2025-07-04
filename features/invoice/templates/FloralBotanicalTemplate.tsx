
import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

export const FloralBotanicalTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalTaxAmount = (invoice.taxes || []).reduce((acc, tax) => acc + (subtotal * tax.rate) / 100, 0);
  let discountAmount = 0;
  if (invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage' 
      ? (subtotal * invoice.discount.value) / 100 
      : invoice.discount.value;
  }
  const total = subtotal + totalTaxAmount - discountAmount;

  // Fonts: 'Dancing Script' for headings, 'Lora' for body.
  const headingFont = "'Dancing Script', cursive";
  const bodyFont = "'Lora', serif";

  return (
    // Intended background: A very subtle, light watercolor floral pattern in corners.
    // Using a very light gradient to simulate a soft background.
    <div className="p-8 font-['Lora',serif] bg-rose-50 text-neutral-700 print:p-0 print:bg-white" style={{fontFamily: bodyFont}}>
      <div className="relative border border-rose-200 p-6">
        {/* Decorative floral elements would be positioned absolutely here */}
        
        <header className="text-center mb-12">
          {invoice.sender.logoUrl && <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-16 mx-auto mb-4" />}
          <h2 className="text-4xl text-rose-800" style={{fontFamily: headingFont}}>{invoice.sender.name}</h2>
          <p className="text-sm text-neutral-500">{invoice.sender.address}</p>
        </header>

        <section className="grid grid-cols-2 gap-8 mb-10 text-sm">
          <div>
            <h3 className="text-rose-700 font-semibold mb-1">Invoice For:</h3>
            <p className="font-bold text-lg">{invoice.recipient.name}</p>
            <p className="text-neutral-600">{invoice.recipient.address}</p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-rose-800 mb-2">INVOICE</h1>
            <p><strong className="text-neutral-600">No.</strong> {invoice.id}</p>
            <p><strong className="text-neutral-600">Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
            <p><strong className="text-neutral-600">Due:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </section>

        <section className="mb-10">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-rose-300">
              <tr>
                <th className="py-2 text-left font-semibold text-rose-800">Item Description</th>
                <th className="py-2 text-center font-semibold text-rose-800">Quantity</th>
                <th className="py-2 text-right font-semibold text-rose-800">Price</th>
                <th className="py-2 text-right font-semibold text-rose-800">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map(item => (
                <tr key={item.id} className="border-b border-rose-100">
                  <td className="py-3 pr-2">{item.description}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-right font-medium">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="flex flex-col md:flex-row justify-between items-start gap-6">
           <div className="w-full md:w-1/2">
            {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
              <div className="bg-white/70 p-4 rounded border border-rose-200">
                <h3 className="text-rose-700 font-semibold mb-2">Payment Details</h3>
                {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="UPI QR Code" className="border p-1 mb-2" style={{width: '80px', height: '80px'}}/>}
                {upiLink && <a href={upiLink} target="_blank" rel="noopener noreferrer" className="block text-sm text-rose-600 hover:underline">Pay via UPI</a>}
                {invoice.manualPaymentLink && <a href={invoice.manualPaymentLink} target="_blank" rel="noopener noreferrer" className="block text-sm text-green-600 hover:underline mt-1">Pay Online</a>}
              </div>
            )}
           </div>
          <div className="w-full md:w-2/5 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-neutral-600">Subtotal</span> <span>{invoice.currency} {subtotal.toFixed(2)}</span></div>
            {(invoice.taxes || []).map(tax => (
                <div key={tax.id} className="flex justify-between">
                    <span className="text-neutral-600">{tax.name} ({tax.rate}%)</span>
                    <span>{invoice.currency} {((subtotal * tax.rate) / 100).toFixed(2)}</span>
                </div>
            ))}
            {invoice.discount.value > 0 && <div className="flex justify-between text-red-600"><span>Discount</span> <span>- {invoice.currency} {discountAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-xl font-bold text-rose-800 border-t-2 border-rose-300 pt-2 mt-2">
              <span style={{fontFamily: headingFont}}>Total</span>
              <span style={{fontFamily: headingFont}}>{invoice.currency} {total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-8 border-t border-dotted border-rose-300 text-xs text-neutral-500">
            {invoice.notes && <div className="mb-4"><strong>Notes:</strong> {invoice.notes}</div>}
            {invoice.terms && <div><strong>Terms:</strong> {invoice.terms}</div>}
            <div className="text-center mt-8">
                <p className="text-lg" style={{fontFamily: headingFont}}>With heartfelt thanks,</p>
                <p className="text-lg" style={{fontFamily: headingFont}}>{invoice.sender.name}</p>
            </div>
            {userPlan?.has_branding && (
              <p className="text-center mt-4 print:text-gray-400">
                Powered by Invoice Maker <span className="opacity-80">by LinkFC</span>
              </p>
            )}
        </footer>
      </div>
    </div>
  );
};
