import React from 'react';
import { InvoiceTemplateProps } from '../../../types'; 

const ElegantTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  let discountAmount = 0;
  if (invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage' 
      ? (subtotal * invoice.discount.value) / 100 
      : invoice.discount.value;
  }
  const total = subtotal + taxAmount - discountAmount;

  return (
    <div className="p-10 font-serif bg-stone-50 text-stone-700 print:p-0 print:bg-white print:text-black">
      {/* Header */}
      <header className="text-center mb-12 border-b-2 border-stone-300 pb-8">
        {invoice.sender.logoUrl && (
          <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-24 mx-auto mb-4" />
        )}
        <h1 className="text-5xl font-bold text-stone-800 tracking-tight">{invoice.sender.name}</h1>
        <p className="text-sm text-stone-500 mt-1">{invoice.sender.address}</p>
        {invoice.sender.email && <p className="text-sm text-stone-500">{invoice.sender.email}</p>}
        {invoice.sender.phone && <p className="text-sm text-stone-500">{invoice.sender.phone}</p>}
      </header>

      <div className="flex justify-between items-start mb-10">
        <h2 className="text-3xl font-semibold text-stone-800 uppercase tracking-wider">Invoice</h2>
        <div className="text-right">
            <p className="text-lg text-stone-600"># {invoice.id}</p>
            <p className="text-sm text-stone-500"><span className="font-medium">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
            <p className="text-sm text-stone-500"><span className="font-medium">Due:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Client Info */}
      <section className="mb-12">
        <h3 className="text-xs uppercase font-semibold text-stone-500 mb-1 tracking-wider">Billed To</h3>
        <p className="font-bold text-lg text-stone-800">{invoice.recipient.name}</p>
        <p className="text-sm text-stone-600">{invoice.recipient.address}</p>
        {invoice.recipient.email && <p className="text-sm text-stone-600">{invoice.recipient.email}</p>}
        {invoice.recipient.phone && <p className="text-sm text-stone-600">{invoice.recipient.phone}</p>}
      </section>

      {/* Items Table */}
      <section className="mb-12">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-stone-400">
              <th className="text-left py-3 px-1 text-sm font-semibold uppercase text-stone-600 tracking-wider">Description</th>
              <th className="text-right py-3 px-1 text-sm font-semibold uppercase text-stone-600 tracking-wider">Quantity</th>
              <th className="text-right py-3 px-1 text-sm font-semibold uppercase text-stone-600 tracking-wider">Unit Price</th>
              <th className="text-right py-3 px-1 text-sm font-semibold uppercase text-stone-600 tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id} className="border-b border-stone-200">
                <td className="py-4 px-1 text-stone-700">{item.description}</td>
                <td className="text-right py-4 px-1 text-stone-700">{item.quantity}</td>
                <td className="text-right py-4 px-1 text-stone-700">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right py-4 px-1 text-stone-800 font-medium">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
        <div className="w-full md:w-auto mt-6 md:mt-0 order-last md:order-first">
            {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="border border-stone-200 p-4 rounded-md bg-stone-100 print:bg-stone-50 space-y-3">
                <h4 className="font-semibold text-stone-700 mb-2 text-md tracking-wider uppercase">Payment Information</h4>
                {qrCodeDataUrl && (
                <div className="text-center md:text-left">
                    <p className="text-xs text-stone-500 mb-1">Scan for UPI Payment:</p>
                    <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-stone-300 p-1 rounded-sm inline-block" style={{width: '90px', height: '90px'}}/>
                </div>
                )}
                {upiLink && (
                <div>
                    <a 
                    href={upiLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2 bg-stone-700 text-white text-xs font-medium rounded-sm shadow-sm hover:bg-stone-800 transition-colors tracking-wider"
                    >
                    PAY INVOICE (UPI)
                    </a>
                </div>
                )}
                {invoice.manualPaymentLink && (
                 <div>
                    <a 
                        href={invoice.manualPaymentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-5 py-2 bg-stone-600 text-white text-xs font-medium rounded-sm shadow-sm hover:bg-stone-700 transition-colors tracking-wider"
                    >
                        PAY ONLINE (CUSTOM LINK)
                    </a>
                </div>
              )}
            </div>
            )}
        </div>
        <div className="w-full sm:w-1/2 md:w-2/5 lg:w-1/3 text-sm ml-auto">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-600">Subtotal:</span>
              <span className="text-stone-800 font-medium">{invoice.currency} {subtotal.toFixed(2)}</span>
            </div>
            {invoice.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-stone-600">Tax ({invoice.taxRate}%):</span>
                <span className="text-stone-800 font-medium">{invoice.currency} {taxAmount.toFixed(2)}</span>
              </div>
            )}
            {invoice.discount.value > 0 && (
               <div className="flex justify-between">
                <span className="text-stone-600">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
                <span className="text-red-700 font-medium">- {invoice.currency} {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t-2 border-stone-400 mt-3">
              <span className="font-bold text-xl text-stone-800">Total:</span>
              <span className="font-bold text-xl text-stone-800">{invoice.currency} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-12 pt-8 border-t border-stone-300 text-xs text-stone-600">
        {invoice.notes && (
          <div className="mb-6">
            <h4 className="font-semibold text-stone-700 mb-2 uppercase tracking-wider">Notes:</h4>
            <p className="whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <h4 className="font-semibold text-stone-700 mb-2 uppercase tracking-wider">Terms & Conditions:</h4>
            <p className="whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-stone-500 mt-16 pt-8 border-t border-stone-300">
        <p>Your trust in our services is greatly appreciated.</p>
        {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-400 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default ElegantTemplate;
