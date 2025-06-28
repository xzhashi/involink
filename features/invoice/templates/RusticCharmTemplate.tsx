

import React from 'react';
import { InvoiceTemplateProps } from '../../../types';

const RusticCharmTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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
    // Intended background: Wood texture or burlap. Using gradient for simulation.
    // Font: "Indie Flower", "Patrick Hand" or similar cursive/handwritten for accents.
    <div className="p-8 font-[Georgia,serif] bg-gradient-to-br from-yellow-100 via-orange-100 to-amber-200 text-stone-700 print:p-0 print:bg-white print:from-white print:to-white print:text-black">
      {/* Header */}
      <header className="text-center mb-12 pb-6 border-b-2 border-dashed border-stone-400">
        {invoice.sender.logoUrl ? (
          <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-20 mx-auto mb-3 rounded-sm opacity-90" />
        ) : (
          <h2 className="text-4xl font-bold text-stone-800" style={{ fontFamily: "'Indie Flower', cursive" }}>{invoice.sender.name}</h2>
        )}
        <p className="text-sm text-stone-600 italic">{invoice.sender.address}</p>
        {invoice.sender.email && <p className="text-xs text-stone-500">{invoice.sender.email}</p>}
      </header>

      <div className="flex justify-between items-start mb-10">
        <h1 className="text-3xl font-semibold text-stone-800 uppercase tracking-wider">Invoice</h1>
        <div className="text-right text-sm">
            <p><strong className="text-stone-600">Invoice No.:</strong> {invoice.id}</p>
            <p><strong className="text-stone-600">Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
            <p><strong className="text-stone-600">Due By:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Client Info */}
      <section className="mb-10 bg-white/40 p-4 rounded shadow-sm border border-stone-300/70">
        <h3 className="text-sm font-semibold text-stone-600 mb-1 tracking-wide">To Our Valued Client:</h3>
        <p className="font-bold text-lg text-stone-800">{invoice.recipient.name}</p>
        <p className="text-sm text-stone-600">{invoice.recipient.address}</p>
      </section>

      {/* Items Table */}
      <section className="mb-10 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead className="bg-stone-600/10 print:bg-slate-200">
            <tr>
              <th className="border border-stone-300 p-2 text-left text-sm font-semibold uppercase text-stone-700 print:text-black">Item/Service Provided</th>
              <th className="border border-stone-300 p-2 text-center text-sm font-semibold uppercase text-stone-700 print:text-black">Quantity</th>
              <th className="border border-stone-300 p-2 text-right text-sm font-semibold uppercase text-stone-700 print:text-black">Price Each</th>
              <th className="border border-stone-300 p-2 text-right text-sm font-semibold uppercase text-stone-700 print:text-black">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white/50">
            {invoice.items.map(item => (
              <tr key={item.id}>
                <td className="border border-stone-300 p-2 text-stone-700">{item.description}</td>
                <td className="border border-stone-300 p-2 text-center text-stone-700">{item.quantity}</td>
                <td className="border border-stone-300 p-2 text-right text-stone-700">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="border border-stone-300 p-2 text-right text-stone-800 font-medium">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
        <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
          {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="border border-stone-300 p-4 bg-white/50 rounded shadow-sm space-y-3 text-center md:text-left print:bg-slate-50">
              <h4 className="font-semibold text-stone-700 mb-2 text-md tracking-wide">Payment Methods</h4>
              {qrCodeDataUrl && (
                <div>
                  <p className="text-xs text-stone-600 mb-1 italic">Scan for UPI Payment:</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-stone-400 p-1 bg-white inline-block rounded-sm" style={{width: '85px', height: '85px'}}/>
                </div>
              )}
              {upiLink && (
                <div>
                  <a
                    href={upiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-1.5 bg-stone-500 text-white text-xs font-medium shadow-sm hover:bg-stone-600 transition-colors rounded"
                  >
                    Pay with UPI
                  </a>
                </div>
              )}
              {invoice.manualPaymentLink && (
                 <div>
                    <a
                        href={invoice.manualPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-1.5 bg-orange-500 text-white text-xs font-medium shadow-sm hover:bg-orange-600 transition-colors rounded"
                    >
                        Other Payment Link
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 lg:w-1/3 space-y-1 text-sm ml-auto bg-white/40 p-4 rounded shadow-sm border border-stone-300/70">
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
          <div className="flex justify-between pt-3 border-t-2 border-stone-500 mt-3">
            <span className="font-bold text-xl text-stone-800">Total Amount Due:</span>
            <span className="font-bold text-xl text-stone-800">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-10 pt-6 border-t border-dashed border-stone-400 text-xs text-stone-600">
        {invoice.notes && (
          <div className="mb-4">
            <h4 className="font-semibold text-stone-700 mb-1 tracking-wide">A Quick Note:</h4>
            <p className="whitespace-pre-wrap italic" style={{ fontFamily: "'Patrick Hand', cursive" }}>{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <h4 className="font-semibold text-stone-700 mb-1 tracking-wide">Our Terms:</h4>
            <p className="whitespace-pre-wrap italic">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-stone-500 mt-12 pt-6 border-t border-dashed border-stone-400">
        <p style={{ fontFamily: "'Indie Flower', cursive" }}>Thank you kindly for your business!</p>
        {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-400 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default RusticCharmTemplate;
