



import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

const IndustrialGritTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  let discountAmount = 0;
  if (invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage'
      ? (subtotal * invoice.discount.value) / 100
      : invoice.discount.value;
  }
  const total = subtotal + taxAmount - discountAmount;
  const isQuote = invoice.type === 'quote';

  // Using a stencil-like or strong sans-serif font
  const mainFont = "'Roboto Condensed', sans-serif"; // Example, ensure loaded if specific

  return (
    // Intended background: Dark concrete or brushed metal texture.
    // Using a dark gray gradient for simulation.
    <div className="p-8 font-[Roboto Condensed,sans-serif] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 text-slate-300 print:p-0 print:bg-white print:from-white print:to-white print:text-black" style={{fontFamily: mainFont}}>
      {/* Header */}
      <header className="flex justify-between items-center mb-10 pb-4 border-b-2 border-orange-500">
        <div>
          {invoice.sender.logoUrl ? (
            <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-12 mb-2 filter grayscale brightness-150 print:filter-none" />
          ) : (
            <h2 className="text-3xl font-black uppercase tracking-wider text-slate-100 print:text-black">{invoice.sender.name}</h2>
          )}
          <p className="text-xs text-slate-400 print:text-slate-600">{invoice.sender.address}</p>
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-extrabold uppercase text-orange-400 print:text-orange-600">{isQuote ? 'Quote' : 'Invoice'}</h1>
          <p className="text-md text-slate-300 print:text-slate-700">REF: {invoice.id}</p>
        </div>
      </header>

      {/* Client Info & Dates */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-700/50 p-4 border border-slate-600 print:bg-slate-100 print:border-slate-300">
          <h3 className="text-xs uppercase font-semibold text-orange-400 mb-1 print:text-orange-600">CLIENT:</h3>
          <p className="font-semibold text-lg text-slate-100 print:text-black">{invoice.recipient.name}</p>
          <p className="text-sm text-slate-400 print:text-slate-600">{invoice.recipient.address}</p>
        </div>
        <div className="bg-slate-700/50 p-4 border border-slate-600 text-left md:text-right print:bg-slate-100 print:border-slate-300">
          <p className="mb-1"><strong className="text-slate-400 font-medium print:text-slate-500">ISSUE DATE:</strong> <span className="text-slate-100 print:text-black">{new Date(invoice.date).toLocaleDateString()}</span></p>
          <p><strong className="text-slate-400 font-medium print:text-slate-500">{isQuote ? 'VALID UNTIL:' : 'DUE DATE:'}</strong> <span className="text-slate-100 print:text-black">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-10 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-slate-600 print:bg-slate-200">
            <tr>
              <th className="text-left p-2 text-xs font-bold uppercase tracking-wider text-orange-300 print:text-orange-700">ITEM/SERVICE</th>
              <th className="text-center p-2 text-xs font-bold uppercase tracking-wider text-orange-300 print:text-orange-700">QTY</th>
              <th className="text-right p-2 text-xs font-bold uppercase tracking-wider text-orange-300 print:text-orange-700">UNIT COST</th>
              <th className="text-right p-2 text-xs font-bold uppercase tracking-wider text-orange-300 print:text-orange-700">TOTAL COST</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600 print:divide-slate-300">
            {invoice.items.map(item => (
              <tr key={item.id} className="hover:bg-slate-700/70 print:hover:bg-slate-50">
                <td className="p-2 text-slate-200 print:text-slate-700">{item.description}</td>
                <td className="text-center p-2 text-slate-300 print:text-slate-600">{item.quantity}</td>
                <td className="text-right p-2 text-slate-300 print:text-slate-600">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right p-2 text-slate-100 font-medium print:text-black">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
        <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
          {!isQuote && (upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="bg-slate-700/50 border border-slate-600 p-4 space-y-3 text-center md:text-left print:bg-slate-100 print:border-slate-300">
              <h4 className="font-semibold text-orange-400 mb-2 text-md print:text-orange-600">PAYMENT INFO</h4>
              {qrCodeDataUrl && (
                <div>
                  <p className="text-xs text-slate-400 mb-1 print:text-slate-500">UPI QR:</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-orange-500 p-0.5 bg-white inline-block" style={{width: '80px', height: '80px'}}/>
                </div>
              )}
              {upiLink && (
                <div>
                  <a
                    href={upiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-1.5 bg-orange-500 text-slate-900 text-xs font-bold uppercase shadow-sm hover:bg-orange-400 transition-colors"
                  >
                    UPI Transfer
                  </a>
                </div>
              )}
              {invoice.manualPaymentLink && (
                 <div>
                    <a
                        href={invoice.manualPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-1.5 bg-slate-500 text-white text-xs font-bold uppercase shadow-sm hover:bg-slate-400 transition-colors"
                    >
                        External Pay
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 lg:w-1/3 space-y-1 text-sm ml-auto">
          <div className="flex justify-between p-1">
            <span className="text-slate-400 print:text-slate-600">SUBTOTAL</span>
            <span className="text-slate-100 font-medium print:text-black">{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between p-1">
              <span className="text-slate-400 print:text-slate-600">TAX ({invoice.taxRate}%)</span>
              <span className="text-slate-100 font-medium print:text-black">{invoice.currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.discount.value > 0 && (
             <div className="flex justify-between p-1">
              <span className="text-slate-400 print:text-slate-600">DISCOUNT ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`})</span>
              <span className="text-yellow-400 font-medium print:text-yellow-600">- {invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between p-2 bg-orange-500 text-slate-900 mt-2 shadow-md print:bg-orange-500 print:text-black">
            <span className="font-black text-lg uppercase">{isQuote ? 'TOTAL:' : 'TOTAL DUE:'}</span>
            <span className="font-black text-lg">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-10 pt-6 border-t border-slate-600 text-xs text-slate-400 print:border-slate-300 print:text-slate-600">
        {invoice.notes && (
          <div className="mb-4 p-3 bg-slate-700/40 border border-slate-600/50 print:bg-slate-100 print:border-slate-200">
            <h4 className="font-semibold text-orange-400 mb-1 print:text-orange-600">NOTES:</h4>
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div className="p-3 bg-slate-700/40 border border-slate-600/50 print:bg-slate-100 print:border-slate-200">
            <h4 className="font-semibold text-orange-400 mb-1 print:text-orange-600">TERMS:</h4>
            <p className="whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-slate-500 mt-12 pt-6 border-t border-slate-600 print:border-slate-300 print:text-slate-500">
        <p>{invoice.sender.name} - BUILT TO LAST.</p>
        {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-500 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default IndustrialGritTemplate;
