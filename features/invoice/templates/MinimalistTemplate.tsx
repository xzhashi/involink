import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts'; 

const MinimalistTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  let discountAmount = 0;
  if (invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage' 
      ? (subtotal * invoice.discount.value) / 100 
      : invoice.discount.value;
  }
  const total = subtotal + taxAmount - discountAmount;

  return (
    <div className="p-8 font-sans bg-white text-gray-800 print:p-0">
      {/* Header */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wider">Invoice</h1>
          <p className="text-gray-600"># {invoice.id}</p>
        </div>
        <div className="text-right">
          {invoice.sender.logoUrl ? (
            <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-20 mb-2 ml-auto" />
          ) : (
            <h2 className="text-2xl font-semibold text-gray-800">{invoice.sender.name}</h2>
          )}
          <p className="text-sm text-gray-600">{invoice.sender.address}</p>
          {invoice.sender.email && <p className="text-sm text-gray-600">{invoice.sender.email}</p>}
          {invoice.sender.phone && <p className="text-sm text-gray-600">{invoice.sender.phone}</p>}
        </div>
      </header>

      {/* Client Info & Dates */}
      <section className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="text-xs uppercase font-semibold text-gray-500 mb-1">Bill To</h3>
          <p className="font-bold text-gray-700">{invoice.recipient.name}</p>
          <p className="text-sm text-gray-600">{invoice.recipient.address}</p>
          {invoice.recipient.email && <p className="text-sm text-gray-600">{invoice.recipient.email}</p>}
          {invoice.recipient.phone && <p className="text-sm text-gray-600">{invoice.recipient.phone}</p>}
        </div>
        <div className="text-right">
          <p><strong className="text-gray-600 font-medium">Date Issued:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
          <p><strong className="text-gray-600 font-medium">Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-10">
        <table className="w-full">
          <thead className="border-b-2 border-gray-300">
            <tr>
              <th className="text-left py-2 px-1 text-sm font-semibold uppercase text-gray-600">Description</th>
              <th className="text-right py-2 px-1 text-sm font-semibold uppercase text-gray-600">Qty</th>
              <th className="text-right py-2 px-1 text-sm font-semibold uppercase text-gray-600">Unit Price</th>
              <th className="text-right py-2 px-1 text-sm font-semibold uppercase text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3 px-1 text-sm text-gray-700">{item.description}</td>
                <td className="text-right py-3 px-1 text-sm text-gray-700">{item.quantity}</td>
                <td className="text-right py-3 px-1 text-sm text-gray-700">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right py-3 px-1 text-sm text-gray-800 font-medium">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start mb-10">
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="mt-4 pr-4">
              <h4 className="font-semibold text-gray-700 mb-2 text-md">Payment Details:</h4>
              {qrCodeDataUrl && (
                <div className="mb-3 text-center md:text-left">
                  <p className="text-xs text-gray-600 mb-1">Scan to Pay (UPI):</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-gray-300 p-1 rounded-md inline-block" style={{width: '100px', height: '100px'}}/>
                </div>
              )}
              {upiLink && (
                <div className="mb-3">
                  <a 
                    href={upiLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-700 transition-colors"
                  >
                    Pay Now via UPI
                  </a>
                </div>
              )}
              {invoice.manualPaymentLink && (
                 <div className="mt-2">
                    <a 
                        href={invoice.manualPaymentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-500 transition-colors"
                    >
                        Pay Online
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-auto md:min-w-[280px]">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-800 font-medium">{invoice.currency} {subtotal.toFixed(2)}</span>
            </div>
            {invoice.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                <span className="text-gray-800 font-medium">{invoice.currency} {taxAmount.toFixed(2)}</span>
              </div>
            )}
            {invoice.discount.value > 0 && (
               <div className="flex justify-between">
                <span className="text-gray-600">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
                <span className="text-red-600 font-medium">- {invoice.currency} {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-300 mt-2">
              <span className="font-bold text-lg text-gray-900">Total:</span>
              <span className="font-bold text-lg text-gray-900">{invoice.currency} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-10 pt-6 border-t border-gray-200 text-sm text-gray-600">
        {invoice.notes && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-1">Notes:</h4>
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Terms & Conditions:</h4>
            <p className="whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-gray-500 mt-12 pt-6 border-t border-gray-200">
        <p>Thank you for your business!</p>
         {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-400 mt-3 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default MinimalistTemplate;