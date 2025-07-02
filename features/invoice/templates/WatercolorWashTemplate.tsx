



import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

const WatercolorWashTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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

  return (
    // Intended background: Soft, blended watercolor splotches (e.g., light blues, pinks, yellows).
    // Using a gentle multi-stop gradient for simulation. Font: "Quicksand", "Dancing Script" for accents.
    <div className="p-8 font-[Quicksand,sans-serif] bg-gradient-to-br from-sky-100 via-pink-50 to-yellow-50 text-slate-700 print:p-0 print:bg-white print:from-white print:to-white print:text-black">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start mb-12 pb-6 border-b-2 border-pink-200">
        <div>
          {invoice.sender.logoUrl ? (
            <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-16 mb-3 sm:mb-0 rounded-md" />
          ) : (
            <h2 className="text-3xl font-bold text-sky-600" style={{ fontFamily: "'Dancing Script', cursive" }}>{invoice.sender.name}</h2>
          )}
          <p className="text-sm text-slate-500">{invoice.sender.address}</p>
        </div>
        <div className="text-left sm:text-right mt-4 sm:mt-0">
          <h1 className="text-4xl font-extrabold uppercase tracking-tight text-pink-500">{isQuote ? 'Quote' : 'Invoice'}</h1>
          <p className="text-md text-slate-600"># {invoice.id}</p>
        </div>
      </header>

      {/* Client Info & Dates */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white/60 p-5 rounded-lg shadow-sm backdrop-blur-sm border border-sky-200/50">
          <h3 className="text-xs uppercase font-semibold text-sky-500 mb-2">Billed To</h3>
          <p className="font-bold text-lg text-slate-700">{invoice.recipient.name}</p>
          <p className="text-sm text-slate-600">{invoice.recipient.address}</p>
        </div>
        <div className="bg-white/60 p-5 rounded-lg shadow-sm backdrop-blur-sm border border-pink-200/50 text-left md:text-right">
          <p className="mb-1"><strong className="text-slate-600 font-medium">Date Issued:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
          <p><strong className="text-slate-600 font-medium">{isQuote ? 'Valid Until:' : 'Payment Due:'}</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-10 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-sky-500/80 text-white print:bg-slate-200 print:text-black">
            <tr>
              <th className="text-left p-3 font-semibold text-sm rounded-tl-md">Description</th>
              <th className="text-center p-3 font-semibold text-sm">Quantity</th>
              <th className="text-right p-3 font-semibold text-sm">Unit Price</th>
              <th className="text-right p-3 font-semibold text-sm rounded-tr-md">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white/70 backdrop-blur-sm">
            {invoice.items.map((item, idx) => (
              <tr key={item.id} className={`border-b border-sky-200/70 ${idx % 2 === 0 ? 'bg-sky-50/40' : 'bg-transparent'} print:bg-transparent`}>
                <td className="p-3 text-slate-700">{item.description}</td>
                <td className="text-center p-3 text-slate-600">{item.quantity}</td>
                <td className="text-right p-3 text-slate-600">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right p-3 text-slate-700 font-semibold">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
        <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
          {!isQuote && (upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="bg-white/60 border border-pink-200/50 p-4 rounded-lg shadow-sm backdrop-blur-sm space-y-3 text-center md:text-left print:bg-slate-50">
              <h4 className="font-semibold text-pink-500 mb-2 text-md">Payment Details</h4>
              {qrCodeDataUrl && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Scan for UPI:</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-pink-300 p-1 bg-white inline-block rounded-md" style={{width: '90px', height: '90px'}}/>
                </div>
              )}
              {upiLink && (
                <div>
                  <a
                    href={upiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2 bg-pink-400 text-white text-sm font-medium rounded-full shadow-md hover:bg-pink-500 transition-colors"
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
                        className="inline-block px-5 py-2 bg-sky-400 text-white text-sm font-medium rounded-full shadow-md hover:bg-sky-500 transition-colors"
                    >
                        Custom Payment Link
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 lg:w-1/3 space-y-2 text-sm ml-auto bg-white/60 p-5 rounded-lg shadow-lg backdrop-blur-sm border-t-4 border-pink-400">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal:</span>
            <span className="text-slate-700 font-semibold">{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Tax ({invoice.taxRate}%):</span>
              <span className="text-slate-700 font-semibold">{invoice.currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.discount.value > 0 && (
             <div className="flex justify-between">
              <span className="text-slate-600">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
              <span className="text-red-600 font-medium">- {invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t-2 border-dashed border-pink-300 mt-3">
            <span className="font-bold text-xl text-pink-500">{isQuote ? 'Total:' : 'Total Due:'}</span>
            <span className="font-bold text-xl text-pink-500">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-10 pt-6 border-t border-dotted border-slate-400 text-xs text-slate-600">
        {invoice.notes && (
          <div className="mb-4">
            <h4 className="font-semibold text-slate-700 mb-1" style={{ fontFamily: "'Dancing Script', cursive" }}>A little note for you:</h4>
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Our Terms:</h4>
            <p className="whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-slate-500 mt-12 pt-6 border-t border-dotted border-slate-400">
        <p>Thank you for the lovely opportunity to work with you.</p>
        {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-400 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default WatercolorWashTemplate;
