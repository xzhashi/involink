

import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

const RetroPixelTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  let discountAmount = 0;
  if (invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage'
      ? (subtotal * invoice.discount.value) / 100
      : invoice.discount.value;
  }
  const total = subtotal + taxAmount - discountAmount;

  // Font: "Press Start 2P" or similar pixel font. Fallback to monospace.
  const pixelFont = "'Press Start 2P', monospace"; // Ensure this font is loaded or use a common monospace.

  return (
    // Intended background: Pixelated pattern or simple grid.
    // Using a dark background with bright accents.
    <div className="p-6 font-[monospace] bg-slate-800 text-lime-300 print:p-0 print:bg-white print:text-black" style={{ fontFamily: pixelFont, imageRendering: 'pixelated' }}>
      {/* Header - Pixel Border Effect */}
      <div className="border-4 border-lime-300 p-1 mb-8" style={{ boxShadow: '4px 4px 0px #65a30d, -4px -4px 0px #65a30d, 4px -4px 0px #65a30d, -4px 4px 0px #65a30d' /* lime-600 */ }}>
        <header className="flex justify-between items-center bg-slate-700 p-4 print:bg-slate-100">
          <div>
            {invoice.sender.logoUrl ? (
              <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-12 mb-1 filter grayscale contrast-200 print:filter-none" />
            ) : (
              <h2 className="text-xl font-bold text-yellow-300 print:text-yellow-600">{invoice.sender.name}</h2>
            )}
            <p className="text-xs text-lime-400 print:text-lime-700">{invoice.sender.address}</p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold uppercase text-red-400 print:text-red-600">INVOICE</h1>
            <p className="text-sm text-cyan-300 print:text-cyan-600">ID: {invoice.id}</p>
          </div>
        </header>
      </div>

      {/* Client Info & Dates */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
        <div className="bg-slate-700 p-3 border-2 border-cyan-400 print:bg-slate-50 print:border-cyan-500">
          <h3 className="font-bold text-yellow-300 mb-1 print:text-yellow-600">TO PLAYER:</h3>
          <p className="text-lime-300 print:text-black">{invoice.recipient.name}</p>
          <p className="text-lime-400 print:text-slate-600">{invoice.recipient.address}</p>
        </div>
        <div className="bg-slate-700 p-3 border-2 border-red-400 text-left md:text-right print:bg-slate-50 print:border-red-500">
          <p><strong className="text-yellow-300 print:text-yellow-600">DATE:</strong> <span className="text-lime-300 print:text-black">{new Date(invoice.date).toLocaleDateString()}</span></p>
          <p><strong className="text-yellow-300 print:text-yellow-600">DUE:</strong> <span className="text-lime-300 print:text-black">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-6 overflow-x-auto">
        <table className="w-full min-w-[500px] text-xs border-collapse">
          <thead className="bg-slate-600 print:bg-slate-200">
            <tr>
              <th className="p-2 text-left font-bold uppercase text-yellow-300 border-2 border-lime-400 print:text-yellow-600 print:border-lime-500">ITEM</th>
              <th className="p-2 text-center font-bold uppercase text-yellow-300 border-2 border-lime-400 print:text-yellow-600 print:border-lime-500">QTY</th>
              <th className="p-2 text-right font-bold uppercase text-yellow-300 border-2 border-lime-400 print:text-yellow-600 print:border-lime-500">COST</th>
              <th className="p-2 text-right font-bold uppercase text-yellow-300 border-2 border-lime-400 print:text-yellow-600 print:border-lime-500">TOTAL</th>
            </tr>
          </thead>
          <tbody className="bg-slate-700/80 print:bg-white">
            {invoice.items.map(item => (
              <tr key={item.id}>
                <td className="p-2 text-lime-300 border-2 border-lime-400 print:text-black print:border-lime-500">{item.description}</td>
                <td className="p-2 text-center text-lime-300 border-2 border-lime-400 print:text-slate-600 print:border-lime-500">{item.quantity}</td>
                <td className="p-2 text-right text-lime-300 border-2 border-lime-400 print:text-slate-600 print:border-lime-500">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="p-2 text-right text-lime-200 font-bold border-2 border-lime-400 print:text-black print:border-lime-500">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div className="w-full md:w-auto order-last md:order-first mt-4 md:mt-0">
          {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="bg-slate-700 border-2 border-cyan-400 p-3 space-y-2 text-xs text-center md:text-left print:bg-slate-50 print:border-cyan-500">
              <h4 className="font-bold text-yellow-300 mb-1 print:text-yellow-600">PAYMENT PORTAL:</h4>
              {qrCodeDataUrl && (
                <div>
                  <p className="text-lime-400 mb-1 print:text-lime-700">SCAN QR (UPI):</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-lime-300 p-0.5 bg-white inline-block" style={{width: '70px', height: '70px'}}/>
                </div>
              )}
              {upiLink && (
                <div>
                  <a
                    href={upiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3 py-1 bg-red-400 text-slate-800 text-xs font-bold hover:bg-red-300 transition-colors print:bg-red-500 print:text-white"
                  >
                    PAY (UPI)
                  </a>
                </div>
              )}
              {invoice.manualPaymentLink && (
                 <div>
                    <a
                        href={invoice.manualPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 bg-cyan-400 text-slate-800 text-xs font-bold hover:bg-cyan-300 transition-colors print:bg-cyan-500 print:text-white"
                    >
                        EXTERNAL LINK
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 lg:w-1/3 space-y-0.5 text-xs ml-auto bg-slate-700 p-3 border-2 border-red-400 print:bg-slate-50 print:border-red-500">
          <div className="flex justify-between">
            <span className="text-lime-400 print:text-slate-600">SUBTOTAL:</span>
            <span className="text-lime-200 font-bold print:text-black">{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between">
              <span className="text-lime-400 print:text-slate-600">TAX ({invoice.taxRate}%):</span>
              <span className="text-lime-200 font-bold print:text-black">{invoice.currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.discount.value > 0 && (
             <div className="flex justify-between">
              <span className="text-lime-400 print:text-slate-600">DISCOUNT ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
              <span className="text-yellow-300 font-bold print:text-yellow-600">- {invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t-2 border-dashed border-lime-400 mt-1 print:border-lime-500">
            <span className="font-bold text-lg text-red-400 print:text-red-600">TOTAL:</span>
            <span className="font-bold text-lg text-red-400 print:text-red-600">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-6 pt-3 border-t-2 border-dashed border-lime-400 text-xs text-lime-400 print:border-lime-500 print:text-slate-600">
        {invoice.notes && (
          <div className="mb-2">
            <h4 className="font-bold text-yellow-300 mb-0.5 print:text-yellow-600">NOTES:</h4>
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <h4 className="font-bold text-yellow-300 mb-0.5 print:text-yellow-600">TERMS:</h4>
            <p className="whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-lime-500 mt-8 pt-3 border-t-2 border-dashed border-lime-400 print:border-lime-500 print:text-slate-500">
        <p>THANK YOU! GAME ON!</p>
        {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-500 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default RetroPixelTemplate;
