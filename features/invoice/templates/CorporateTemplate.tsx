import React from 'react';
import { InvoiceTemplateProps } from '../../../types'; 

const CorporateTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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
      <header className="bg-blue-700 text-white p-8 mb-10 print:bg-slate-700 print:text-white">
        <div className="flex justify-between items-center">
          <div>
            {invoice.sender.logoUrl ? (
              <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-16 mb-2 filter brightness-0 invert" />
            ) : (
              <h2 className="text-3xl font-bold">{invoice.sender.name}</h2>
            )}
            <p className="text-sm opacity-90">{invoice.sender.address}</p>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold uppercase tracking-tight">Invoice</h1>
            <p className="text-lg opacity-90"># {invoice.id}</p>
          </div>
        </div>
      </header>

      {/* Client Info & Dates */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 px-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase">Bill To:</h3>
          <p className="font-bold text-lg text-gray-700">{invoice.recipient.name}</p>
          <p className="text-gray-600">{invoice.recipient.address}</p>
          {invoice.recipient.email && <p className="text-sm text-gray-600">{invoice.recipient.email}</p>}
          {invoice.recipient.phone && <p className="text-sm text-gray-600">{invoice.recipient.phone}</p>}
        </div>
        <div className="md:text-right">
          <div className="mb-2">
            <strong className="text-gray-600 font-medium">Date Issued:</strong>
            <p className="text-gray-800">{new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          <div>
            <strong className="text-gray-600 font-medium">Due Date:</strong>
            <p className="text-gray-800">{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-10 px-2">
        <table className="w-full">
          <thead className="border-b-2 border-gray-300">
            <tr>
              <th className="text-left py-3 px-2 text-sm font-semibold uppercase text-gray-600">Description</th>
              <th className="text-right py-3 px-2 text-sm font-semibold uppercase text-gray-600">Qty</th>
              <th className="text-right py-3 px-2 text-sm font-semibold uppercase text-gray-600">Unit Price</th>
              <th className="text-right py-3 px-2 text-sm font-semibold uppercase text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-2 text-gray-700">{item.description}</td>
                <td className="text-right py-3 px-2 text-gray-700">{item.quantity}</td>
                <td className="text-right py-3 px-2 text-gray-700">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right py-3 px-2 text-gray-800 font-medium">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start mb-10 px-2 gap-6">
        <div className="w-full md:w-1/2 order-last md:order-first mt-6 md:mt-0">
          {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <h4 className="font-semibold text-gray-700 mb-2 text-md">Payment Options:</h4>
              {qrCodeDataUrl && (
                <div className="text-center md:text-left">
                  <p className="text-xs text-gray-600 mb-1">Scan to Pay (UPI):</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-gray-300 p-1 rounded-md inline-block" style={{width: '90px', height: '90px'}}/>
                </div>
              )}
              {upiLink && (
                <div>
                  <a 
                    href={upiLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    Pay Invoice via UPI
                  </a>
                </div>
              )}
              {invoice.manualPaymentLink && (
                 <div>
                    <a 
                        href={invoice.manualPaymentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-5 py-2 bg-gray-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-700 transition-colors"
                    >
                        Pay Using Other Link
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-auto md:min-w-[300px] space-y-2">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-800 font-medium">{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
              <span className="text-gray-800 font-medium">{invoice.currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.discount.value > 0 && (
             <div className="flex justify-between py-1">
              <span className="text-gray-600">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
              <span className="text-red-600 font-medium">- {invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t-2 border-blue-700 mt-2 print:border-slate-700">
            <span className="font-bold text-xl text-blue-700 print:text-slate-700">Total Due:</span>
            <span className="font-bold text-xl text-blue-700 print:text-slate-700">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-10 pt-6 border-t border-gray-200 text-sm text-gray-600 px-2">
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

      <footer className="text-center text-xs text-gray-500 mt-12 pt-6 border-t border-gray-300">
        <p>Thank you for your business, {invoice.recipient.name}.</p>
        <p>{invoice.sender.name} | {invoice.sender.email} | {invoice.sender.phone}</p>
        {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-400 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default CorporateTemplate;
