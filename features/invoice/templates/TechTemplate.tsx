import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts'; 

export const TechTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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
    <div className="p-8 font-sans bg-gray-900 text-gray-100 rounded-lg shadow-2xl print:bg-white print:text-gray-800 print:p-0 print:shadow-none print:rounded-none">
      {/* Header with Gradient */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white p-8 rounded-t-lg -m-8 mb-8 print:from-slate-700 print:via-slate-600 print:to-slate-500 print:rounded-none">
        <div className="flex justify-between items-start">
          <div>
            {invoice.sender.logoUrl ? (
              <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-12 mb-3 filter brightness-0 invert print:filter-none" />
            ) : (
              <h2 className="text-4xl font-black tracking-tighter">{invoice.sender.name}</h2>
            )}
            <p className="text-xs opacity-80 max-w-xs">{invoice.sender.address}</p>
            {invoice.sender.email && <p className="text-xs opacity-80">{invoice.sender.email}</p>}
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-extrabold uppercase">{isQuote ? 'Quote' : 'Invoice'}</h1>
            <p className="text-md opacity-90 mt-1"># {invoice.id}</p>
          </div>
        </div>
      </header>

      {/* Client Info & Dates */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 pt-4">
        <div className="bg-gray-800 p-4 rounded print:bg-gray-100">
          <h3 className="text-xs uppercase font-semibold text-purple-400 print:text-purple-600 mb-1">Billed To:</h3>
          <p className="font-bold text-lg text-gray-50 print:text-gray-800">{invoice.recipient.name}</p>
          <p className="text-sm text-gray-300 print:text-gray-600">{invoice.recipient.address}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded text-left md:text-right print:bg-gray-100">
          <p className="mb-1"><strong className="text-gray-400 print:text-gray-500 font-medium">Date Issued:</strong> <span className="text-gray-50 print:text-gray-800">{new Date(invoice.date).toLocaleDateString()}</span></p>
          <p><strong className="text-gray-400 print:text-gray-500 font-medium">{isQuote ? 'Valid Until:' : 'Due Date:'}</strong> <span className="text-gray-50 print:text-gray-800">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-8">
        <table className="w-full">
          <thead className="bg-gray-700 print:bg-gray-200">
            <tr>
              <th className="text-left p-3 text-sm font-semibold uppercase text-purple-300 print:text-purple-700">Service / Product</th>
              <th className="text-center p-3 text-sm font-semibold uppercase text-purple-300 print:text-purple-700">Quantity</th>
              <th className="text-right p-3 text-sm font-semibold uppercase text-purple-300 print:text-purple-700">Unit Price</th>
              <th className="text-right p-3 text-sm font-semibold uppercase text-purple-300 print:text-purple-700">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 print:divide-gray-200">
            {invoice.items.map(item => (
              <tr key={item.id} className="hover:bg-gray-800 print:hover:bg-gray-50">
                <td className="p-3 text-gray-200 print:text-gray-700">{item.description}</td>
                <td className="text-center p-3 text-gray-300 print:text-gray-600">{item.quantity}</td>
                <td className="text-right p-3 text-gray-300 print:text-gray-600">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right p-3 text-gray-100 font-medium print:text-gray-800">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
         <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
          {!isQuote && (upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="bg-gray-800 p-4 rounded-lg shadow-md print:bg-gray-100 text-center md:text-left space-y-3">
              <h4 className="font-semibold text-pink-400 print:text-pink-600 mb-2 text-md">Digital Payment:</h4>
              {qrCodeDataUrl && (
                <div>
                  <p className="text-xs text-gray-400 print:text-gray-500 mb-1">Scan QR (UPI):</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="border-2 border-purple-500 p-1 rounded-md inline-block bg-white" style={{width: '90px', height: '90px'}}/>
                </div>
              )}
              {upiLink && (
                <div>
                  <a 
                    href={upiLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2 bg-gradient-to-r from-purple-400 to-purple-700 text-white text-sm font-semibold rounded-md shadow-lg hover:from-purple-500 hover:to-purple-800 transition-all"
                  >
                    Pay via UPI Link
                  </a>
                </div>
              )}
               {invoice.manualPaymentLink && (
                 <div>
                    <a 
                        href={invoice.manualPaymentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-md shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
                    >
                        Custom Pay Link
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 lg:w-1/3 space-y-2 text-sm">
          <div className="flex justify-between p-2 rounded bg-gray-800 print:bg-gray-100">
            <span className="text-gray-400 print:text-gray-600">Subtotal:</span>
            <span className="text-gray-100 font-medium print:text-gray-800">{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {(invoice.taxes || []).map(tax => (
            <div key={tax.id} className="flex justify-between p-2 rounded bg-gray-800 print:bg-gray-100">
                <span className="text-gray-400 print:text-gray-600">{tax.name} ({tax.rate}%):</span>
                <span className="text-gray-100 font-medium print:text-gray-800">{invoice.currency} {((subtotal * tax.rate) / 100).toFixed(2)}</span>
            </div>
          ))}
          {invoice.discount.value > 0 && (
             <div className="flex justify-between p-2 rounded bg-gray-800 print:bg-gray-100">
              <span className="text-gray-400 print:text-gray-600">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
              <span className="text-pink-400 font-medium print:text-pink-600">- {invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md mt-2 shadow-lg print:from-purple-600 print:to-pink-600">
            <span className="font-bold text-xl uppercase">{isQuote ? 'Total:' : 'Due:'}</span>
            <span className="font-bold text-xl">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {invoice.attachments && invoice.attachments.length > 0 && (
        <section className="mt-8 pt-6 border-t border-gray-700 print:border-gray-300">
          <h4 className="font-semibold text-purple-400 print:text-purple-600 mb-2 text-md">Attached Files</h4>
           <ul className="list-disc list-inside text-sm text-gray-300 print:text-gray-700 space-y-1">
            {invoice.attachments.map(att => (
              <li key={att.name}>
                <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline print:text-pink-600">
                  {att.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(invoice.notes || invoice.terms) && (
      <section className="mt-8 pt-6 border-t border-gray-700 print:border-gray-300 text-xs">
        {invoice.notes && (
          <div className="mb-4 p-4 rounded bg-gray-800 print:bg-gray-100">
            <h4 className="font-semibold text-purple-400 print:text-purple-600 mb-1">Notes:</h4>
            <p className="text-gray-300 print:text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div className="p-4 rounded bg-gray-800 print:bg-gray-100">
            <h4 className="font-semibold text-purple-400 print:text-purple-600 mb-1">Terms & Conditions:</h4>
            <p className="text-gray-300 print:text-gray-700 whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-gray-500 print:text-gray-500 mt-12 pt-6 border-t border-gray-700 print:border-gray-300">
        <p>Innovate. Create. Deliver. | {invoice.sender.name}</p>
         {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-600 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};