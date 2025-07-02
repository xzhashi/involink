




import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

const VintageScrollTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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
    // Intended background: Parchment texture image.
    // <div className="p-10 font-serif bg-[url('/placeholder-parchment-bg.jpg')] text-amber-900 print:p-0">
    <div className="p-10 font-serif bg-gradient-to-br from-orange-100 via-yellow-50 to-amber-100 text-amber-900 print:p-0 print:bg-white print:from-white print:to-white print:text-black">
      {/* Ornate Border (simulated) */}
      <div className="border-4 border-amber-700/50 p-2 print:border-none">
        <div className="border border-amber-600/70 p-6 print:border-none">
          {/* Header */}
          <header className="text-center mb-12 border-b-2 border-dashed border-amber-500 pb-6">
            {invoice.sender.logoUrl && (
              <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-20 mx-auto mb-3 opacity-80" />
            )}
            <h1 className="text-4xl font-bold tracking-wider text-amber-800" style={{ fontFamily: "'Times New Roman', Times, serif" }}>{invoice.sender.name}</h1>
            <p className="text-sm text-amber-700 italic">{invoice.sender.address}</p>
          </header>

          <div className="flex justify-between items-start mb-10">
            <h2 className="text-3xl font-semibold text-amber-800 uppercase" style={{ fontFamily: "'Georgia', serif" }}>{isQuote ? 'Quotation' : 'Invoice'}</h2>
            <div className="text-right text-sm text-amber-700">
                <p><strong>{isQuote ? 'Quote No.:' : 'Invoice No.:'}</strong> {invoice.id}</p>
                <p><strong>Date Issued:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
                <p><strong>{isQuote ? 'Valid Until:' : 'Payment Due:'}</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Client Info */}
          <section className="mb-10">
            <h3 className="text-md font-semibold text-amber-700 mb-1 tracking-wide">Addressed To:</h3>
            <p className="font-bold text-lg text-amber-800">{invoice.recipient.name}</p>
            <p className="text-sm text-amber-600 italic">{invoice.recipient.address}</p>
          </section>

          {/* Items Table */}
          <section className="mb-10">
            <table className="w-full border-collapse border border-amber-400">
              <thead>
                <tr className="bg-amber-600/20 print:bg-slate-200">
                  <th className="border border-amber-400 p-2 text-left text-sm font-semibold uppercase text-amber-700 print:text-black">Description of Services/Goods</th>
                  <th className="border border-amber-400 p-2 text-center text-sm font-semibold uppercase text-amber-700 print:text-black">Qty.</th>
                  <th className="border border-amber-400 p-2 text-right text-sm font-semibold uppercase text-amber-700 print:text-black">Unit Price</th>
                  <th className="border border-amber-400 p-2 text-right text-sm font-semibold uppercase text-amber-700 print:text-black">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map(item => (
                  <tr key={item.id} className="bg-amber-500/5 print:bg-transparent">
                    <td className="border border-amber-400 p-2 text-amber-700">{item.description}</td>
                    <td className="border border-amber-400 p-2 text-center text-amber-700">{item.quantity}</td>
                    <td className="border border-amber-400 p-2 text-right text-amber-700">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                    <td className="border border-amber-400 p-2 text-right text-amber-800 font-medium">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Totals & Payment Section */}
          <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
              {!isQuote && (upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
                <div className="border border-amber-400 p-4 bg-amber-600/10 space-y-3 text-center md:text-left print:bg-slate-50">
                  <h4 className="font-semibold text-amber-700 mb-2 text-md tracking-wide">Remittance Advice</h4>
                  {qrCodeDataUrl && (
                    <div>
                      <p className="text-xs text-amber-600 mb-1 italic">Scan Seal for UPI Payment:</p>
                      <img src={qrCodeDataUrl} alt="UPI QR Code" className="border-2 border-amber-500 p-1 bg-white inline-block" style={{width: '80px', height: '80px'}}/>
                    </div>
                  )}
                  {upiLink && (
                    <div>
                      <a
                        href={upiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-1.5 bg-amber-700 text-white text-xs font-medium shadow-sm hover:bg-amber-800 transition-colors tracking-wider"
                      >
                        PAY via UPI System
                      </a>
                    </div>
                  )}
                  {invoice.manualPaymentLink && (
                     <div>
                        <a
                            href={invoice.manualPaymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-1.5 bg-yellow-700 text-white text-xs font-medium shadow-sm hover:bg-yellow-800 transition-colors tracking-wider"
                        >
                            External Payment Portal
                        </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="w-full md:w-2/5 lg:w-1/3 space-y-1 text-sm ml-auto">
              <div className="flex justify-between">
                <span className="text-amber-700">Subtotal:</span>
                <span className="text-amber-800 font-medium">{invoice.currency} {subtotal.toFixed(2)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-amber-700">Tax ({invoice.taxRate}%):</span>
                  <span className="text-amber-800 font-medium">{invoice.currency} {taxAmount.toFixed(2)}</span>
                </div>
              )}
              {invoice.discount.value > 0 && (
                 <div className="flex justify-between">
                  <span className="text-amber-700">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
                  <span className="text-red-700 font-medium">- {invoice.currency} {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-amber-600 mt-3">
                <span className="font-bold text-xl text-amber-800">{isQuote ? 'Grand Total:' : 'Total Due:'}</span>
                <span className="font-bold text-xl text-amber-800">{invoice.currency} {total.toFixed(2)}</span>
              </div>
            </div>
          </section>

           {invoice.attachments && invoice.attachments.length > 0 && (
            <section className="mt-10 pt-6 border-t border-dashed border-amber-500 text-xs text-amber-700">
                <h4 className="font-semibold text-amber-800 mb-1 tracking-wide">Accompanying Documents:</h4>
                <ul className="list-disc list-inside space-y-1">
                    {invoice.attachments.map(att => (
                    <li key={att.name}>
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-amber-800 hover:text-black hover:underline">
                        {att.name}
                        </a>
                    </li>
                    ))}
                </ul>
            </section>
          )}

          {(invoice.notes || invoice.terms) && (
          <section className="mt-10 pt-6 border-t border-dashed border-amber-500 text-xs text-amber-700">
            {invoice.notes && (
              <div className="mb-4">
                <h4 className="font-semibold text-amber-800 mb-1 tracking-wide">Notations:</h4>
                <p className="whitespace-pre-wrap italic">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 className="font-semibold text-amber-800 mb-1 tracking-wide">Terms & Stipulations:</h4>
                <p className="whitespace-pre-wrap italic">{invoice.terms}</p>
              </div>
            )}
          </section>
          )}

          <footer className="text-center text-xs text-amber-600 mt-12 pt-6 border-t-2 border-dashed border-amber-500">
            <p>We appreciate your patronage.</p>
            {/* You could add a placeholder for a signature image here if desired */}
            {/* <div className="mt-4">_________________________</div> */}
            {/* <p>Authorised Signature</p> */}
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

export default VintageScrollTemplate;