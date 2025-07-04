import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

export const BohemianDreamTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalTaxAmount = (invoice.taxes || []).reduce((acc, tax) => acc + (subtotal * tax.rate) / 100, 0);
  let discountAmount = 0;
  if (invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage'
      ? (subtotal * invoice.discount.value) / 100
      : invoice.discount.value;
  }
  const total = subtotal + totalTaxAmount - discountAmount;
  const isQuote = invoice.type === 'quote';

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
          <header className="text-center mb-12 pb-6 border-b-2 border-dotted border-rose-400">
            {invoice.sender.logoUrl ? (
              <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-20 mx-auto mb-3 rounded-full" />
            ) : (
              <h2 className="text-4xl font-bold text-rose-700" style={{ fontFamily: headingFont }}>{invoice.sender.name}</h2>
            )}
            <p className="text-sm text-neutral-600">{invoice.sender.address}</p>
          </header>

          <div className="flex justify-between items-start mb-10">
            <h1 className="text-3xl font-semibold text-rose-800 uppercase" style={{fontFamily: headingFont}}>{isQuote ? 'Quote' : 'Invoice'}</h1>
            <div className="text-right text-sm">
              <p><strong className="text-neutral-600">Ref:</strong> {invoice.id}</p>
              <p><strong className="text-neutral-600">Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
              <p><strong className="text-neutral-600">{isQuote ? 'Valid For:' : 'Due:'}</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          <section className="mb-10 bg-white/50 p-4 rounded-lg shadow-inner">
            <h3 className="text-sm font-semibold text-rose-600 mb-1">Prepared For:</h3>
            <p className="font-bold text-lg text-rose-800">{invoice.recipient.name}</p>
            <p className="text-sm text-neutral-600">{invoice.recipient.address}</p>
          </section>

          <section className="mb-10">
            <table className="w-full text-sm">
              <thead className="bg-rose-500/10 print:bg-slate-200">
                <tr>
                  <th className="py-2 px-1 text-left font-semibold text-rose-700">Service or Item</th>
                  <th className="py-2 px-1 text-center font-semibold text-rose-700">Quantity</th>
                  <th className="py-2 px-1 text-right font-semibold text-rose-700">Rate</th>
                  <th className="py-2 px-1 text-right font-semibold text-rose-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dotted divide-rose-200">
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-3 px-1">{item.description}</td>
                    <td className="py-3 px-1 text-center">{item.quantity}</td>
                    <td className="py-3 px-1 text-right">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-1 text-right font-medium">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
              {!isQuote && (upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
                <div className="bg-white/50 border border-rose-200 p-4 rounded-lg space-y-3 text-center md:text-left print:bg-slate-50">
                  <h4 className="font-semibold text-rose-700 mb-2 text-md" style={{ fontFamily: headingFont }}>Pay With Love</h4>
                  {qrCodeDataUrl && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Scan to Pay (UPI):</p>
                      <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-rose-300 p-1 bg-white inline-block rounded" style={{width: '85px', height: '85px'}}/>
                    </div>
                  )}
                  {upiLink && (
                    <div>
                      <a href={upiLink} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-1.5 bg-rose-400 text-white text-xs font-medium shadow-sm hover:bg-rose-500 transition-colors rounded-full">
                        UPI Payment
                      </a>
                    </div>
                  )}
                  {invoice.manualPaymentLink && (
                    <div>
                      <a href={invoice.manualPaymentLink} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-1.5 bg-pink-400 text-white text-xs font-medium shadow-sm hover:bg-pink-500 transition-colors rounded-full">
                        Online Portal
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="w-full md:w-2/5 lg:w-1/3 space-y-1 text-sm ml-auto">
              <div className="flex justify-between"><span className="text-neutral-600">Subtotal:</span><span className="text-neutral-800 font-medium">{invoice.currency} {subtotal.toFixed(2)}</span></div>
              {(invoice.taxes || []).map(tax => (
                <div key={tax.id} className="flex justify-between"><span className="text-neutral-600">{tax.name} ({tax.rate}%):</span><span className="text-neutral-800 font-medium">{invoice.currency} {((subtotal * tax.rate) / 100).toFixed(2)}</span></div>
              ))}
              {invoice.discount.value > 0 && (<div className="flex justify-between text-red-600"><span>Discount</span> <span>- {invoice.currency} {discountAmount.toFixed(2)}</span></div>)}
              <div className="flex justify-between pt-3 border-t-2 border-rose-400 mt-3">
                <span className="font-bold text-xl text-rose-800">{isQuote ? 'Total:' : 'Total Due'}</span>
                <span className="font-bold text-xl text-rose-800">{invoice.currency} {total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {(invoice.notes || invoice.terms) && (
            <section className="mt-10 pt-6 border-t border-dotted border-rose-300 text-xs text-neutral-600">
              {invoice.notes && (<div className="mb-4"><h4 className="font-semibold text-rose-700 mb-1">A Little Something Extra:</h4><p className="whitespace-pre-wrap italic">{invoice.notes}</p></div>)}
              {invoice.terms && (<div><h4 className="font-semibold text-rose-700 mb-1">Our Agreement:</h4><p className="whitespace-pre-wrap">{invoice.terms}</p></div>)}
            </section>
          )}

          <footer className="text-center text-xs text-neutral-500 mt-12 pt-6 border-t border-dotted border-rose-300">
            <p style={{ fontFamily: headingFont }}>With gratitude & good vibes,</p>
            <p style={{ fontFamily: headingFont }}>{invoice.sender.name}</p>
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
