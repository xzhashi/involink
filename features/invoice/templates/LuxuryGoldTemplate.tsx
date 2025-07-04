import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

export const LuxuryGoldTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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

  // Font: "Playfair Display", "Cormorant Garamond" for headings, "Lato" for body.
  const headingFont = "'Playfair Display', serif";
  const bodyFont = "'Lato', sans-serif";
  const goldColor = "text-yellow-400"; // More of a rich gold, adjust as needed
  const darkBg = "bg-slate-900"; // Deep navy or black

  return (
    // Intended background: Black or deep navy with subtle gold marbling or specks.
    <div className={`p-8 font-[Lato,sans-serif] ${darkBg} text-slate-200 print:p-0 print:bg-white print:text-black`} style={{fontFamily: bodyFont}}>
      {/* Ornate Gold Border (simulated) */}
      <div className="border-2 border-yellow-500/50 p-1 print:border-none">
        <div className="border border-yellow-400/70 p-6 print:border-none">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-center mb-12 pb-6 border-b-2 border-yellow-500/30">
            <div>
              {invoice.sender.logoUrl ? (
                <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-16 mb-3 sm:mb-0 filter brightness-125 contrast-125 print:filter-none" />
              ) : (
                <h2 className={`text-3xl font-bold ${goldColor}`} style={{ fontFamily: headingFont }}>{invoice.sender.name}</h2>
              )}
              <p className="text-xs text-slate-400 print:text-slate-600 max-w-xs">{invoice.sender.address}</p>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0">
              <h1 className={`text-5xl font-extrabold uppercase ${goldColor}`} style={{ fontFamily: headingFont }}>{isQuote ? 'Quote' : 'Invoice'}</h1>
              <p className="text-md text-slate-300 print:text-slate-700">Ref: {invoice.id}</p>
            </div>
          </header>

          {/* Client Info & Dates */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-sm">
            <div className="bg-slate-800/50 p-4 rounded-sm border-l-2 border-yellow-500 print:bg-slate-100 print:border-slate-300">
              <h3 className={`text-xs uppercase font-semibold ${goldColor} mb-1 print:text-yellow-700`}>Client Details</h3>
              <p className="font-semibold text-lg text-slate-100 print:text-black">{invoice.recipient.name}</p>
              <p className="text-slate-300 print:text-slate-600">{invoice.recipient.address}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-sm text-left md:text-right print:bg-slate-100">
              <p className="mb-1"><strong className="text-slate-400 font-medium print:text-slate-500">Date Issued:</strong> <span className="text-slate-100 print:text-black">{new Date(invoice.date).toLocaleDateString()}</span></p>
              <p><strong className="text-slate-400 font-medium print:text-slate-500">{isQuote ? 'Valid Until:' : 'Payment Due:'}</strong> <span className="text-slate-100 print:text-black">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
            </div>
          </section>

          {/* Items Table */}
          <section className="mb-10 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="border-b-2 border-yellow-600/50 print:border-yellow-700/70">
                <tr>
                  <th className={`text-left p-3 text-xs font-semibold uppercase ${goldColor} tracking-wider print:text-yellow-700`}>Item Description</th>
                  <th className={`text-center p-3 text-xs font-semibold uppercase ${goldColor} tracking-wider print:text-yellow-700`}>Qty</th>
                  <th className={`text-right p-3 text-xs font-semibold uppercase ${goldColor} tracking-wider print:text-yellow-700`}>Unit Price</th>
                  <th className={`text-right p-3 text-xs font-semibold uppercase ${goldColor} tracking-wider print:text-yellow-700`}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-600/30">
                {invoice.items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-700/40 print:hover:bg-slate-50">
                    <td className="p-3 text-slate-200 print:text-slate-700">{item.description}</td>
                    <td className="text-center p-3 text-slate-300 print:text-slate-600">{item.quantity}</td>
                    <td className="text-right p-3 text-slate-300 print:text-slate-600">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                    <td className="text-right p-3 text-slate-100 font-medium print:text-black">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Totals & Payment Section */}
          <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
              {!isQuote && (upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
                <div className="bg-slate-800/50 border border-yellow-500/30 p-4 rounded-sm space-y-3 text-center md:text-left print:bg-slate-100 print:border-slate-300">
                  <h4 className={`font-semibold ${goldColor} mb-2 text-md print:text-yellow-700`}>Payment Methods</h4>
                  {qrCodeDataUrl && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1 print:text-slate-500">Scan UPI QR:</p>
                      <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-yellow-500 p-0.5 rounded-sm inline-block bg-white" style={{width: '90px', height: '90px'}}/>
                    </div>
                  )}
                  {upiLink && (
                    <div>
                      <a
                        href={upiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-block px-5 py-2 bg-yellow-500 text-slate-900 text-xs font-bold uppercase shadow-md hover:bg-yellow-400 transition-colors tracking-wider`}
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
                            className={`inline-block px-5 py-2 bg-slate-500 text-white text-xs font-bold uppercase shadow-md hover:bg-slate-400 transition-colors tracking-wider`}
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
                <span className="text-slate-400 print:text-slate-600">Subtotal</span>
                <span className="text-slate-100 font-medium print:text-black">{invoice.currency} {subtotal.toFixed(2)}</span>
              </div>
              {(invoice.taxes || []).map(tax => (
                <div key={tax.id} className="flex justify-between p-1">
                    <span className="text-slate-400 print:text-slate-600">{tax.name} ({tax.rate}%):</span>
                    <span className="text-slate-100 font-medium print:text-black">{invoice.currency} {((subtotal * tax.rate) / 100).toFixed(2)}</span>
                </div>
              ))}
              {invoice.discount.value > 0 && (
                 <div className="flex justify-between p-1">
                  <span className="text-slate-400 print:text-slate-600">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
                  <span className={`font-medium ${goldColor} print:text-yellow-600`}>- {invoice.currency} {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className={`flex justify-between p-3 bg-yellow-500 text-slate-900 rounded-sm mt-2 shadow-lg print:bg-yellow-500 print:text-black`}>
                <span className="font-black text-lg uppercase">{isQuote ? 'Total' : 'Total Due'}</span>
                <span className="font-black text-lg">{invoice.currency} {total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {(invoice.notes || invoice.terms) && (
          <section className="mt-10 pt-6 border-t border-yellow-500/30 text-xs text-slate-300 print:border-slate-300 print:text-slate-600">
            {invoice.notes && (
              <div className="mb-4">
                <h4 className={`font-semibold ${goldColor} mb-1 print:text-yellow-700`}>Notes of Importance:</h4>
                <p className="whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 className={`font-semibold ${goldColor} mb-1 print:text-yellow-700`}>Terms & Conditions:</h4>
                <p className="whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </section>
          )}

          <footer className="text-center text-xs text-slate-400 mt-12 pt-6 border-t border-yellow-500/30 print:border-slate-300 print:text-slate-500">
            <p>We appreciate your valued business.</p>
            <p className={`${goldColor} print:text-yellow-700`} style={{ fontFamily: headingFont }}>{invoice.sender.name}</p>
            {userPlan?.has_branding && (
              <div className="text-center text-xs text-gray-500 mt-2 print:text-gray-400">
                Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
              </div>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};
