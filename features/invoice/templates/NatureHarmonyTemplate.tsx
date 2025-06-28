

import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

const NatureHarmonyTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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
    // Intended background: Soft, blurred image of leaves or a forest canopy.
    // <div className="p-8 font-sans bg-[url('/placeholder-nature-bg.jpg')] bg-cover bg-center text-emerald-800 print:p-0">
    <div className="p-8 font-sans bg-gradient-to-br from-green-100 via-lime-50 to-emerald-100 text-emerald-800 print:p-0 print:bg-white print:from-white print:to-white print:text-black">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start mb-12 pb-6 border-b-2 border-emerald-300">
        <div>
          {invoice.sender.logoUrl ? (
            <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-20 mb-3 sm:mb-0 rounded" />
          ) : (
            <h2 className="text-3xl font-bold text-emerald-700">{invoice.sender.name}</h2>
          )}
          <p className="text-sm text-emerald-600">{invoice.sender.address}</p>
        </div>
        <div className="text-left sm:text-right mt-4 sm:mt-0">
          <h1 className="text-4xl font-extrabold uppercase tracking-tight text-emerald-600">Invoice</h1>
          <p className="text-md text-emerald-500"># {invoice.id}</p>
        </div>
      </header>

      {/* Client Info & Dates */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white/50 p-6 rounded-lg shadow-sm backdrop-blur-sm">
          <h3 className="text-xs uppercase font-semibold text-emerald-500 mb-2">Billed To</h3>
          <p className="font-bold text-lg text-emerald-700">{invoice.recipient.name}</p>
          <p className="text-sm text-emerald-600">{invoice.recipient.address}</p>
          {invoice.recipient.email && <p className="text-sm text-emerald-600">{invoice.recipient.email}</p>}
        </div>
        <div className="bg-white/50 p-6 rounded-lg shadow-sm backdrop-blur-sm text-left md:text-right">
          <p className="mb-1"><strong className="text-emerald-600 font-medium">Date Issued:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
          <p><strong className="text-emerald-600 font-medium">Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-10 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-emerald-600 text-white print:bg-slate-200 print:text-black">
            <tr>
              <th className="text-left p-3 font-semibold text-sm rounded-tl-md">Description</th>
              <th className="text-center p-3 font-semibold text-sm">Qty</th>
              <th className="text-right p-3 font-semibold text-sm">Unit Price</th>
              <th className="text-right p-3 font-semibold text-sm rounded-tr-md">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white/70 backdrop-blur-sm">
            {invoice.items.map((item, idx) => (
              <tr key={item.id} className={`border-b border-emerald-200 ${idx % 2 === 0 ? 'bg-emerald-50/50' : 'bg-transparent'} print:bg-transparent`}>
                <td className="p-3 text-emerald-700">{item.description}</td>
                <td className="text-center p-3 text-emerald-700">{item.quantity}</td>
                <td className="text-right p-3 text-emerald-700">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right p-3 text-emerald-800 font-semibold">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
        <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
          {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="bg-white/60 p-4 rounded-lg shadow-sm backdrop-blur-sm space-y-3 text-center md:text-left">
              <h4 className="font-semibold text-emerald-700 mb-2 text-md">Payment Options</h4>
              {qrCodeDataUrl && (
                <div>
                  <p className="text-xs text-emerald-500 mb-1">Scan to Pay (UPI):</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="border-2 border-emerald-300 p-1 rounded-md inline-block bg-white" style={{width: '90px', height: '90px'}}/>
                </div>
              )}
              {upiLink && (
                <div>
                  <a
                    href={upiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2 bg-emerald-500 text-white text-sm font-medium rounded-md shadow-md hover:bg-emerald-600 transition-colors"
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
                        className="inline-block px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-md hover:bg-green-700 transition-colors"
                    >
                        Pay Online (Custom Link)
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 lg:w-1/3 space-y-2 text-sm bg-white/60 p-4 rounded-lg shadow-sm backdrop-blur-sm">
          <div className="flex justify-between">
            <span className="text-emerald-600">Subtotal:</span>
            <span className="text-emerald-800 font-medium">{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between">
              <span className="text-emerald-600">Tax ({invoice.taxRate}%):</span>
              <span className="text-emerald-800 font-medium">{invoice.currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.discount.value > 0 && (
             <div className="flex justify-between">
              <span className="text-emerald-600">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
              <span className="text-red-600 font-medium">- {invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t-2 border-emerald-400 mt-3">
            <span className="font-bold text-xl text-emerald-700">Total Due:</span>
            <span className="font-bold text-xl text-emerald-700">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-10 pt-6 border-t border-emerald-300 text-xs text-emerald-600">
        {invoice.notes && (
          <div className="mb-4 bg-white/50 p-4 rounded-lg shadow-sm backdrop-blur-sm">
            <h4 className="font-semibold text-emerald-700 mb-1">Notes:</h4>
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div className="bg-white/50 p-4 rounded-lg shadow-sm backdrop-blur-sm">
            <h4 className="font-semibold text-emerald-700 mb-1">Terms & Conditions:</h4>
            <p className="whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-emerald-500 mt-12 pt-6 border-t border-emerald-300">
        <p>Thank you for choosing {invoice.sender.name || "our services"}!</p>
        {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-400 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default NatureHarmonyTemplate;
