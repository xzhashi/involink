import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

const HandDrawnSketchTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  let discountAmount = 0;
  if (invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage' 
      ? (subtotal * invoice.discount.value) / 100 
      : invoice.discount.value;
  }
  const total = subtotal + taxAmount - discountAmount;

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
            <h1 className="text-5xl font-bold uppercase text-pink-500" style={{fontFamily: headingFont}}>Invoice!</h1>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 mb-10 text-sm">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 font-bold mb-1">For:</h3>
            <p className="font-semibold text-lg">{invoice.recipient.name}</p>
            <p>{invoice.recipient.address}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p><strong>Invoice #:</strong> {invoice.id}</p>
            <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
            <p><strong>Due By:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
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
          <div className="w-full md:w-1/2">
            {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-pink-600 text-lg mb-2" style={{fontFamily: headingFont}}>Pay Me Here!</h3>
                {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="UPI QR Code" className="border-2 border-gray-300 p-1 mb-2" style={{width: '90px', height: '90px'}}/>}
                {upiLink && <a href={upiLink} target="_blank" rel="noopener noreferrer" className="block text-blue-500 underline mb-1">UPI Link</a>}
                {invoice.manualPaymentLink && <a href={invoice.manualPaymentLink} target="_blank" rel="noopener noreferrer" className="block text-green-600 underline">Online Payment</a>}
              </div>
            )}
            {invoice.notes && (
                <div className="mt-4">
                  <h3 className="font-bold text-cyan-700">A little note:</h3>
                  <p className="text-gray-600 italic">{invoice.notes}</p>
                </div>
            )}
          </div>
          <div className="w-full md:w-2/5 text-right space-y-2">
            <p>Subtotal: <span>{invoice.currency} {subtotal.toFixed(2)}</span></p>
            {invoice.taxRate > 0 && <p>Tax ({invoice.taxRate}%): <span>{invoice.currency} {taxAmount.toFixed(2)}</span></p>}
            {invoice.discount.value > 0 && <p>Discount: <span className="text-red-500">- {invoice.currency} {discountAmount.toFixed(2)}</span></p>}
            <p className="text-2xl font-bold border-t-2 border-dashed border-gray-400 pt-2" style={{fontFamily: headingFont}}>Total: <span className="text-pink-600">{invoice.currency} {total.toFixed(2)}</span></p>
          </div>
        </section>

        <footer className="mt-12 pt-6 text-center text-gray-500 text-xs">
          {invoice.terms && <p className="mb-4"><strong>My Terms:</strong> {invoice.terms}</p>}
          <p className="text-xl" style={{fontFamily: headingFont}}>Thanks a bunch!</p>
          {userPlan?.has_branding && (
            <p className="mt-4 print:text-gray-400">
              Powered by Invoice Maker <span className="opacity-80">by LinkFC</span>
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default HandDrawnSketchTemplate;
