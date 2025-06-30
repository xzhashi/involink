

import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

const GeometricPulseTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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
    // Intended background: Repeating geometric pattern or abstract shapes overlay.
    // <div className="p-8 font-sans bg-slate-900 bg-[url('/placeholder-geometric-pattern.svg')] text-slate-100 print:p-0">
    <div className="p-8 font-sans bg-gradient-to-br from-slate-800 via-slate-900 to-black text-slate-100 print:p-0 print:bg-white print:text-black">
      {/* Header with Geometric Accent */}
      {/* Intended: Add a subtle geometric pattern to this header background */}
      <header className="relative flex justify-between items-center mb-12 p-8 bg-slate-800/50 border-b-4 border-cyan-400 print:bg-slate-200 print:border-slate-500">
        <div>
          {invoice.sender.logoUrl ? (
            <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-16 mb-2 filter brightness-0 invert print:filter-none" />
          ) : (
            <h2 className="text-3xl font-bold text-white print:text-black">{invoice.sender.name}</h2>
          )}
          <p className="text-sm text-slate-300 print:text-slate-600">{invoice.sender.address}</p>
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-extrabold uppercase text-cyan-400 print:text-cyan-600">Invoice</h1>
          <p className="text-md text-slate-200 print:text-slate-700"># {invoice.id}</p>
        </div>
      </header>

      {/* Client Info & Dates */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="border border-slate-700 p-4 rounded print:border-slate-300">
          <h3 className="text-xs uppercase font-semibold text-cyan-400 mb-1 print:text-cyan-600">Client Details</h3>
          <p className="font-semibold text-lg text-slate-50 print:text-slate-800">{invoice.recipient.name}</p>
          <p className="text-sm text-slate-300 print:text-slate-600">{invoice.recipient.address}</p>
        </div>
        <div className="border border-slate-700 p-4 rounded text-left md:text-right print:border-slate-300">
          <p className="mb-1"><strong className="text-slate-400 font-medium print:text-slate-500">Issued:</strong> <span className="text-slate-50 print:text-slate-800">{new Date(invoice.date).toLocaleDateString()}</span></p>
          <p><strong className="text-slate-400 font-medium print:text-slate-500">Due:</strong> <span className="text-slate-50 print:text-slate-800">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-10 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-slate-700 print:bg-slate-200">
            <tr>
              <th className="text-left p-3 text-sm font-semibold uppercase text-cyan-300 print:text-cyan-700">Item / Service</th>
              <th className="text-center p-3 text-sm font-semibold uppercase text-cyan-300 print:text-cyan-700">Quantity</th>
              <th className="text-right p-3 text-sm font-semibold uppercase text-cyan-300 print:text-cyan-700">Rate</th>
              <th className="text-right p-3 text-sm font-semibold uppercase text-cyan-300 print:text-cyan-700">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 print:divide-slate-300">
            {invoice.items.map(item => (
              <tr key={item.id} className="hover:bg-slate-800/70 print:hover:bg-slate-50">
                <td className="p-3 text-slate-200 print:text-slate-700">{item.description}</td>
                <td className="text-center p-3 text-slate-300 print:text-slate-600">{item.quantity}</td>
                <td className="text-right p-3 text-slate-300 print:text-slate-600">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right p-3 text-slate-100 font-medium print:text-slate-800">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
        <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
          {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="border border-slate-700 p-4 rounded space-y-3 text-center md:text-left print:border-slate-300">
              <h4 className="font-semibold text-cyan-400 mb-2 text-md print:text-cyan-600">Payment Gateway</h4>
              {qrCodeDataUrl && (
                <div>
                  <p className="text-xs text-slate-400 mb-1 print:text-slate-500">Scan (UPI):</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="border-2 border-cyan-500 p-1 rounded-sm inline-block bg-white" style={{width: '90px', height: '90px'}}/>
                </div>
              )}
              {upiLink && (
                <div>
                  <a
                    href={upiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2 bg-cyan-500 text-slate-900 text-sm font-semibold rounded shadow-md hover:bg-cyan-400 transition-colors"
                  >
                    Pay Digitally (UPI)
                  </a>
                </div>
              )}
              {invoice.manualPaymentLink && (
                 <div>
                    <a
                        href={invoice.manualPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-5 py-2 bg-sky-500 text-white text-sm font-semibold rounded shadow-md hover:bg-sky-400 transition-colors"
                    >
                        Use Payment Link
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 lg:w-1/3 space-y-1 text-sm ml-auto">
          <div className="flex justify-between p-2 rounded bg-slate-800 print:bg-slate-100">
            <span className="text-slate-400 print:text-slate-600">Subtotal</span>
            <span className="text-slate-100 font-medium print:text-slate-800">{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between p-2 rounded bg-slate-800 print:bg-slate-100">
              <span className="text-slate-400 print:text-slate-600">Tax ({invoice.taxRate}%)</span>
              <span className="text-slate-100 font-medium print:text-slate-800">{invoice.currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.discount.value > 0 && (
             <div className="flex justify-between p-2 rounded bg-slate-800 print:bg-slate-100">
              <span className="text-slate-400 print:text-slate-600">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
              <span className="text-pink-400 font-medium print:text-pink-600">- {invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between p-3 bg-cyan-500 text-slate-900 rounded mt-2 shadow-lg print:bg-cyan-500 print:text-black">
            <span className="font-bold text-xl uppercase">Total</span>
            <span className="font-bold text-xl">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-10 pt-6 border-t border-slate-700 text-xs text-slate-300 print:border-slate-300 print:text-slate-600">
        {invoice.notes && (
          <div className="mb-4 p-4 rounded border border-slate-700 print:border-slate-300">
            <h4 className="font-semibold text-cyan-400 mb-1 print:text-cyan-600">Additional Notes:</h4>
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div className="p-4 rounded border border-slate-700 print:border-slate-300">
            <h4 className="font-semibold text-cyan-400 mb-1 print:text-cyan-600">Terms of Service:</h4>
            <p className="whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-slate-500 mt-12 pt-6 border-t border-slate-700 print:border-slate-300 print:text-slate-500">
        <p>{invoice.sender.name} - Modern Solutions, Expertly Delivered.</p>
        {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-600 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default GeometricPulseTemplate;
