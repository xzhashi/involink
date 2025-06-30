

import React from 'react';
import { InvoiceTemplateProps } from '../../../types';

const MonochromeFocusTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  let discountAmount = 0;
  if (invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage'
      ? (subtotal * invoice.discount.value) / 100
      : invoice.discount.value;
  }
  const total = subtotal + taxAmount - discountAmount;

  // Accent color can be customized here, e.g., 'text-red-500', 'border-blue-500'
  const accentColor = 'text-blue-500'; // Example accent: blue
  const accentBorderColor = 'border-blue-500';
  const accentBgColor = 'bg-blue-500';
  const accentHoverBgColor = 'hover:bg-blue-600';
  
  // For print, we'll generally revert to black/gray unless specific classes are used.
  // The goal is high contrast black & white.

  return (
    <div className="p-8 font-sans bg-white text-black print:p-0">
      {/* Header */}
      <header className={`flex justify-between items-start mb-10 pb-6 border-b-2 ${accentBorderColor} print:border-black`}>
        <div>
          {invoice.sender.logoUrl ? (
            <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-16 mb-2" /> // Assuming logo is suitable for white bg
          ) : (
            <h2 className={`text-3xl font-extrabold ${accentColor} print:text-black`}>{invoice.sender.name}</h2>
          )}
          <p className="text-sm text-gray-700 print:text-black">{invoice.sender.address}</p>
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-black uppercase text-black">Invoice</h1>
          <p className="text-md text-gray-600 print:text-black"># {invoice.id}</p>
        </div>
      </header>

      {/* Client Info & Dates */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="text-xs uppercase font-semibold text-gray-500 mb-1 print:text-black">Bill To</h3>
          <p className="font-bold text-lg text-black">{invoice.recipient.name}</p>
          <p className="text-sm text-gray-700 print:text-black">{invoice.recipient.address}</p>
        </div>
        <div className="text-left md:text-right">
          <p><strong className="text-gray-600 font-medium print:text-black">Date Issued:</strong> <span className="text-black">{new Date(invoice.date).toLocaleDateString()}</span></p>
          <p><strong className="text-gray-600 font-medium print:text-black">Due Date:</strong> <span className="text-black">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-10 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-100 print:bg-gray-200">
            <tr>
              <th className="text-left p-3 font-semibold uppercase text-xs tracking-wider text-black">Description</th>
              <th className="text-center p-3 font-semibold uppercase text-xs tracking-wider text-black">Qty</th>
              <th className="text-right p-3 font-semibold uppercase text-xs tracking-wider text-black">Unit Price</th>
              <th className="text-right p-3 font-semibold uppercase text-xs tracking-wider text-black">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id} className="border-b border-gray-200 print:border-gray-300">
                <td className="p-3 text-black">{item.description}</td>
                <td className="text-center p-3 text-gray-700 print:text-black">{item.quantity}</td>
                <td className="text-right p-3 text-gray-700 print:text-black">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right p-3 text-black font-semibold">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
        <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
          {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="border border-gray-200 p-4 rounded space-y-3 print:border-gray-300">
              <h4 className={`font-semibold ${accentColor} mb-2 text-md print:text-black`}>Payment</h4>
              {qrCodeDataUrl && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 print:text-black">Scan (UPI):</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className={`border ${accentBorderColor} p-0.5 rounded-sm inline-block bg-white print:border-black`} style={{width: '90px', height: '90px'}}/>
                </div>
              )}
              {upiLink && (
                <div>
                  <a
                    href={upiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block px-5 py-2 ${accentBgColor} text-white text-sm font-medium rounded-sm shadow-sm ${accentHoverBgColor} transition-colors print:bg-gray-700 print:text-white`}
                  >
                    Pay via UPI
                  </a>
                </div>
              )}
               {invoice.manualPaymentLink && (
                 <div>
                    <a
                        href={invoice.manualPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-block px-5 py-2 bg-gray-700 text-white text-sm font-medium rounded-sm shadow-sm hover:bg-gray-800 transition-colors`}
                    >
                        Custom Payment
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 lg:w-1/3 space-y-1 text-sm ml-auto">
          <div className="flex justify-between p-1">
            <span className="text-gray-600 print:text-black">Subtotal:</span>
            <span className="text-black font-medium">{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between p-1">
              <span className="text-gray-600 print:text-black">Tax ({invoice.taxRate}%):</span>
              <span className="text-black font-medium">{invoice.currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.discount.value > 0 && (
             <div className="flex justify-between p-1">
              <span className="text-gray-600 print:text-black">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
              <span className="text-red-600 font-medium">- {invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className={`flex justify-between p-3 border-t-2 ${accentBorderColor} mt-2 print:border-black`}>
            <span className="font-bold text-xl text-black">TOTAL DUE</span>
            <span className="font-bold text-xl text-black">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-10 pt-6 border-t border-gray-200 text-xs text-gray-700 print:border-gray-300 print:text-black">
        {invoice.notes && (
          <div className="mb-4">
            <h4 className="font-semibold text-black mb-1">Notes:</h4>
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <h4 className="font-semibold text-black mb-1">Terms:</h4>
            <p className="whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-gray-500 mt-12 pt-6 border-t border-gray-200 print:border-gray-300 print:text-black">
        <p>Thank you for your business.</p>
        {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-400 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default MonochromeFocusTemplate;