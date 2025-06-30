

import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

const BohemianDreamTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  let discountAmount = 0;
  if (invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage'
      ? (subtotal * invoice.discount.value) / 100
      : invoice.discount.value;
  }
  const total = subtotal + taxAmount - discountAmount;

  // Fonts: 'Caveat', 'Satisfy' for headings, 'Lato' or 'Montserrat' for body
  const headingFont = "'Satisfy', cursive";
  const bodyFont = "'Lato', sans-serif";

  return (
    // Intended background: Subtle paisley or floral pattern, or a warm textured paper.
    // Using a warm gradient for simulation.
    <div className="p-8 font-[Lato,sans-serif] bg-gradient-to-br from-orange-100 via-rose-50 to-pink-100 text-neutral-700 print:p-0 print:bg-white print:from-white print:to-white print:text-black" style={{fontFamily: bodyFont}}>
      {/* Decorative Border (simulated with padding and inner border) */}
      <div className="border-2 border-dashed border-rose-300 p-1 print:border-none">
        <div className="border border-rose-200 p-6 print:border-none">
          {/* Header */}
          <header className="text-center mb-12 pb-6 border-b border-rose-300">
            {invoice.sender.logoUrl ? (
              <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-16 mx-auto mb-3 rounded-full opacity-90" />
            ) : (
              <h2 className="text-4xl font-bold text-rose-600" style={{ fontFamily: headingFont }}>{invoice.sender.name}</h2>
            )}
            <p className="text-sm text-neutral-500 italic">{invoice.sender.address}</p>
          </header>

          <div className="flex justify-between items-end mb-10">
            <h1 className="text-3xl font-semibold text-rose-700 uppercase tracking-wide">Invoice</h1>
            <div className="text-right text-sm">
                <p><strong className="text-neutral-600">No:</strong> {invoice.id}</p>
                <p><strong className="text-neutral-600">Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
                <p><strong className="text-neutral-600">Due:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Client Info */}
          <section className="mb-10 bg-white/50 p-4 rounded-md shadow-sm border-l-4 border-rose-400">
            <h3 className="text-xs uppercase font-semibold text-neutral-500 mb-1">Billed To</h3>
            <p className="font-bold text-lg text-neutral-800" style={{ fontFamily: headingFont }}>{invoice.recipient.name}</p>
            <p className="text-sm text-neutral-600">{invoice.recipient.address}</p>
          </section>

          {/* Items Table */}
          <section className="mb-10 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-rose-500/10 print:bg-slate-200">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold uppercase text-rose-700 print:text-black">Item Description</th>
                  <th className="p-3 text-center text-sm font-semibold uppercase text-rose-700 print:text-black">Qty</th>
                  <th className="p-3 text-right text-sm font-semibold uppercase text-rose-700 print:text-black">Unit Price</th>
                  <th className="p-3 text-right text-sm font-semibold uppercase text-rose-700 print:text-black">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white/60">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className={`border-b border-rose-200/80 ${idx % 2 === 0 ? 'bg-rose-500/5' : ''} print:bg-transparent`}>
                    <td className="p-3 text-neutral-700">{item.description}</td>
                    <td className="p-3 text-center text-neutral-600">{item.quantity}</td>
                    <td className="p-3 text-right text-neutral-600">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                    <td className="p-3 text-right text-neutral-700 font-semibold">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Totals & Payment Section */}
          <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
              {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
                <div className="border border-rose-300 bg-white/50 p-4 rounded-md shadow-sm space-y-3 text-center md:text-left print:bg-slate-50">
                  <h4 className="font-semibold text-rose-600 mb-2 text-md" style={{ fontFamily: headingFont }}>Send Your Payment</h4>
                  {qrCodeDataUrl && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-1 italic">Scan QR for UPI:</p>
                      <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-rose-400 p-1 bg-white inline-block rounded-md" style={{width: '85px', height: '85px'}}/>
                    </div>
                  )}
                  {upiLink && (
                    <div>
                      <a
                        href={upiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-1.5 bg-rose-400 text-white text-xs font-medium shadow-sm hover:bg-rose-500 transition-colors rounded-full"
                      >
                        Pay with UPI Magic
                      </a>
                    </div>
                  )}
                   {invoice.manualPaymentLink && (
                     <div>
                        <a
                            href={invoice.manualPaymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-1.5 bg-orange-400 text-white text-xs font-medium shadow-sm hover:bg-orange-500 transition-colors rounded-full"
                        >
                            Other Payment Portal
                        </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="w-full md:w-2/5 lg:w-1/3 space-y-1 text-sm ml-auto bg-white/50 p-4 rounded-md shadow-sm border-t-4 border-rose-400">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="text-neutral-700 font-medium">{invoice.currency} {subtotal.toFixed(2)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax ({invoice.taxRate}%):</span>
                  <span className="text-neutral-700 font-medium">{invoice.currency} {taxAmount.toFixed(2)}</span>
                </div>
              )}
              {invoice.discount.value > 0 && (
                 <div className="flex justify-between">
                  <span className="text-neutral-600">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
                  <span className="text-red-600 font-medium">- {invoice.currency} {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-dashed border-rose-300 mt-3">
                <span className="font-bold text-xl text-rose-600" style={{ fontFamily: headingFont }}>Total Due</span>
                <span className="font-bold text-xl text-rose-600" style={{ fontFamily: headingFont }}>{invoice.currency} {total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {(invoice.notes || invoice.terms) && (
          <section className="mt-10 pt-6 border-t border-dashed border-rose-300 text-xs text-neutral-600">
            {invoice.notes && (
              <div className="mb-4">
                <h4 className="font-semibold text-neutral-700 mb-1" style={{ fontFamily: headingFont }}>A Little Note...</h4>
                <p className="whitespace-pre-wrap italic">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 className="font-semibold text-neutral-700 mb-1">Kindly Note (Terms):</h4>
                <p className="whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </section>
          )}

          <footer className="text-center text-xs text-neutral-500 mt-12 pt-6 border-t border-dashed border-rose-300">
            <p style={{ fontFamily: headingFont }}>With gratitude from {invoice.sender.name}</p>
            {userPlan?.has_branding && (
              <div className="text-center text-xs text-gray-400 mt-2 print:text-gray-400">
                Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
              </div>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default BohemianDreamTemplate;