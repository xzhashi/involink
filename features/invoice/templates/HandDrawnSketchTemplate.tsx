
import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

export const HandDrawnSketchTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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

  const headingFont = "'Gochi Hand', cursive";
  const bodyFont = "'Indie Flower', cursive";

  return (
    <div className="p-8 font-[Indie Flower,cursive] bg-orange-50 text-neutral-800 print:p-0 print:bg-white" style={{fontFamily: bodyFont}}>
      {/* Doodle border effect */}
      <div className="border-2 border-dashed border-gray-400 p-6">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-cyan-600" style={{fontFamily: headingFont}}>{invoice.sender.name}</h2>
            <p className="text-sm text-gray-600">{invoice.sender.address}</p>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-bold uppercase text-pink-500" style={{fontFamily: headingFont}}>{isQuote ? 'Quote' : 'Invoice!'}</h1>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 mb-10 text-sm">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 font-bold mb-1">For:</h3>
            <p className="font-semibold text-lg">{invoice.recipient.name}</p>
            <p>{invoice.recipient.address}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p><strong>{isQuote ? 'Quote #:' : 'Invoice #:'}</strong> {invoice.id}</p>
            <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
            <p><strong>{isQuote ? 'Valid By:' : 'Due By:'}</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </section>

        <section className="mb-10">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-dashed border-gray-400">
                <th className="py-2 font-bold text-cyan-700">What I Did:</th>
                <th className="py-2 text-center font-bold text-cyan-700">How Many:</th>
                <th className="py-2 text-right font-bold text-cyan-700">Price Each:</th>
                <th className="py-2 text-right font-bold text-cyan-700">Total:</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map(item => (
                <tr key={item.id} className="border-b border-dotted border-gray-300">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-right font-semibold">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="flex flex-col-reverse md:flex-row justify-between items-start gap-6">
          <div className="w-full md:w-auto mt-6 md:mt-0">
            {!isQuote && (upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
              <div className="bg-white/70 p-4 rounded-lg shadow-sm border border-gray-200 text-center md:text-left">
                <h4 className="font-bold text-gray-600 mb-2" style={{fontFamily: headingFont}}>How to Pay:</h4>
                {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR Code" className="border p-1 inline-block bg-white mb-2" style={{width: '80px', height: '80px'}}/>}
                {upiLink && <a href={upiLink} target="_blank" rel="noopener noreferrer" className="block text-sm text-cyan-600 hover:underline">Pay with UPI</a>}
                {invoice.manualPaymentLink && <a href={invoice.manualPaymentLink} target="_blank" rel="noopener noreferrer" className="block text-sm text-pink-600 hover:underline mt-1">Other Payment Link</a>}
              </div>
            )}
          </div>
          <div className="w-full md:w-2/5 space-y-1 text-sm bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between"><span>Subtotal:</span><span>{invoice.currency} {subtotal.toFixed(2)}</span></div>
            {(invoice.taxes || []).map(tax => (
                <div key={tax.id} className="flex justify-between">
                    <span>{tax.name} ({tax.rate}%):</span>
                    <span>{invoice.currency} {((subtotal * tax.rate) / 100).toFixed(2)}</span>
                </div>
            ))}
            {invoice.discount.value > 0 && (<div className="flex justify-between text-red-500"><span>Discount:</span><span>- {invoice.currency} {discountAmount.toFixed(2)}</span></div>)}
            <div className="flex justify-between text-xl font-bold pt-2 mt-2 border-t-2 border-dashed border-gray-400">
              <span className="text-pink-600">Total:</span>
              <span className="text-pink-600">{invoice.currency} {total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-6 border-t-2 border-dashed border-gray-400 text-center text-xs text-gray-500">
          {invoice.notes && <p className="mb-2"><strong>Note:</strong> {invoice.notes}</p>}
          {invoice.terms && <p><strong>Terms:</strong> {invoice.terms}</p>}
          <p className="mt-6 text-lg" style={{fontFamily: headingFont}}>Thank you!</p>
          {userPlan?.has_branding && (
            <div className="text-center text-xs text-gray-400 mt-2 print:text-gray-400">
              Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};
