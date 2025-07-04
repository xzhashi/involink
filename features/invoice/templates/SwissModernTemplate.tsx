import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

export const SwissModernTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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

  return (
    <div className="p-10 font-[Inter,sans-serif] bg-white text-black print:p-0">
      {/* Header Grid */}
      <header className="grid grid-cols-2 gap-8 mb-16">
        <div>
           {invoice.sender.logoUrl ? (
            <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-12 mb-4" />
          ) : (
            <h2 className="text-2xl font-bold mb-1">{invoice.sender.name}</h2>
          )}
          <p className="text-xs leading-relaxed text-gray-600">{invoice.sender.address.split(',').join('\n')}</p>
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-extrabold uppercase tracking-tighter">{isQuote ? 'Quote' : 'Invoice'}</h1>
        </div>
      </header>

      {/* Info Grid */}
      <section className="grid grid-cols-3 gap-8 mb-12 text-sm">
        <div className="col-span-1">
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Billed To</h3>
          <p className="font-bold">{invoice.recipient.name}</p>
          <p className="text-gray-700">{invoice.recipient.address}</p>
        </div>
        <div className="col-span-1">
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">{isQuote ? 'Quote Number' : 'Invoice Number'}</h3>
          <p className="font-mono">{invoice.id}</p>
        </div>
        <div className="col-span-1">
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Date of Issue</h3>
          <p className="font-mono">{new Date(invoice.date).toLocaleDateString()}</p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-3 font-semibold uppercase">Description</th>
              <th className="text-center py-3 font-semibold uppercase">Qty</th>
              <th className="text-right py-3 font-semibold uppercase">Unit Price</th>
              <th className="text-right py-3 font-semibold uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-4 text-left">{item.description}</td>
                <td className="py-4 text-center font-mono">{item.quantity}</td>
                <td className="py-4 text-right font-mono">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="py-4 text-right font-mono font-semibold">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Total & Payment */}
      <section className="grid grid-cols-2 gap-8 items-start">
        <div className="text-sm">
          {!isQuote && (upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div>
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Payment Details</h3>
              {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-gray-300 p-1 mb-2" style={{width: '80px', height: '80px'}}/>}
              {upiLink && <a href={upiLink} target="_blank" rel="noopener noreferrer" className="block mb-1 text-blue-600 hover:underline">Pay via UPI</a>}
              {invoice.manualPaymentLink && <a href={invoice.manualPaymentLink} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">Pay Online</a>}
            </div>
          )}
        </div>
        <div className="text-right">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 pr-4 text-gray-600">Subtotal</td>
                <td className="py-1 font-mono">{invoice.currency} {subtotal.toFixed(2)}</td>
              </tr>
              {(invoice.taxes || []).map(tax => (
                <tr key={tax.id}>
                    <td className="py-1 pr-4 text-gray-600">{tax.name} ({tax.rate}%)</td>
                    <td className="py-1 font-mono">{invoice.currency} {((subtotal * tax.rate) / 100).toFixed(2)}</td>
                </tr>
              ))}
              {invoice.discount.value > 0 && (
                <tr>
                  <td className="py-1 pr-4 text-gray-600">Discount</td>
                  <td className="py-1 font-mono text-red-600">- {invoice.currency} {discountAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="font-bold text-lg border-t-2 border-black">
                <td className="pt-3 pr-4">{isQuote ? 'Total Estimate' : 'Total Due'}</td>
                <td className="pt-3 font-mono">{invoice.currency} {total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-200 text-xs text-gray-500">
        {invoice.notes && <div className="mb-4"><strong>Notes:</strong> {invoice.notes}</div>}
        {invoice.terms && <div><strong>Terms:</strong> {invoice.terms} Due by {new Date(invoice.dueDate).toLocaleDateString()}.</div>}
        {userPlan?.has_branding && (
          <div className="text-center text-gray-400 mt-6 print:text-gray-400">
            Powered by Invoice Maker <span className="opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};
