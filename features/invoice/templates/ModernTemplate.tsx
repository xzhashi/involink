import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts'; 

const ModernTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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
    <div className="p-6 md:p-10 font-sans bg-white text-neutral-darkest print:p-0">
      {/* Header with Background */}
      <header className="bg-primary-DEFAULT text-white p-8 rounded-t-lg -mx-6 -mt-6 md:-mx-10 md:-mt-10 print:bg-slate-700 print:text-white print:rounded-none print:m-0">
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
            <h1 className="text-4xl font-extrabold tracking-tight">INVOICE</h1>
            <p className="text-lg opacity-90"># {invoice.id}</p>
          </div>
        </div>
      </header>

      {/* Sender/Recipient & Dates */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8 pt-4">
        <div className="md:col-span-1">
          <h3 className="text-xs uppercase font-semibold text-neutral-DEFAULT mb-1">From:</h3>
          <p className="font-semibold text-neutral-darkest">{invoice.sender.name}</p>
          <p className="text-sm text-neutral-DEFAULT">{invoice.sender.address}</p>
          {invoice.sender.email && <p className="text-sm text-neutral-DEFAULT">{invoice.sender.email}</p>}
          {invoice.sender.phone && <p className="text-sm text-neutral-DEFAULT">{invoice.sender.phone}</p>}
        </div>
        <div className="md:col-span-1">
          <h3 className="text-xs uppercase font-semibold text-neutral-DEFAULT mb-1">To:</h3>
          <p className="font-semibold text-neutral-darkest">{invoice.recipient.name}</p>
          <p className="text-sm text-neutral-DEFAULT">{invoice.recipient.address}</p>
          {invoice.recipient.email && <p className="text-sm text-neutral-DEFAULT">{invoice.recipient.email}</p>}
          {invoice.recipient.phone && <p className="text-sm text-neutral-DEFAULT">{invoice.recipient.phone}</p>}
        </div>
        <div className="md:col-span-1 text-left md:text-right">
          <p><strong className="text-neutral-DEFAULT font-medium">Date Issued:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
          <p><strong className="text-neutral-DEFAULT font-medium">Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-8">
        <table className="w-full">
          <thead className="bg-neutral-lightest print:bg-slate-100">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold uppercase text-neutral-DEFAULT">Description</th>
              <th className="text-center py-3 px-4 text-sm font-semibold uppercase text-neutral-DEFAULT">Qty</th>
              <th className="text-right py-3 px-4 text-sm font-semibold uppercase text-neutral-DEFAULT">Unit Price</th>
              <th className="text-right py-3 px-4 text-sm font-semibold uppercase text-neutral-DEFAULT">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {invoice.items.map(item => (
              <tr key={item.id} className="hover:bg-neutral-lightest/50">
                <td className="py-3 px-4 text-neutral-darkest">{item.description}</td>
                <td className="text-center py-3 px-4 text-neutral-DEFAULT">{item.quantity}</td>
                <td className="text-right py-3 px-4 text-neutral-DEFAULT">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right py-3 px-4 text-neutral-darkest font-semibold">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8 mt-10">
        <div className="w-full md:w-1/2">
          {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="mt-4">
              <h4 className="font-semibold text-neutral-darkest mb-3 text-lg">Payment Details</h4>
              <div className="flex items-center gap-6">
                {qrCodeDataUrl && (
                  <div className="text-center">
                    <p className="text-xs text-neutral-DEFAULT mb-1">Scan to Pay (UPI)</p>
                    <img src={qrCodeDataUrl} alt="UPI QR Code" className="border-2 border-neutral-light p-1 rounded-md bg-white" style={{width: '100px', height: '100px'}}/>
                  </div>
                )}
                <div className="space-y-3">
                  {upiLink && (
                    <a 
                      href={upiLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block px-5 py-2 bg-primary-DEFAULT text-white text-sm font-medium rounded-md shadow-md hover:bg-primary-dark transition-colors"
                    >
                      Pay Now via UPI
                    </a>
                  )}
                  {invoice.manualPaymentLink && (
                    <a 
                        href={invoice.manualPaymentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-5 py-2 bg-secondary-DEFAULT text-white text-sm font-medium rounded-md shadow-md hover:bg-secondary-dark transition-colors"
                    >
                        Pay Online
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-auto md:min-w-[300px] bg-neutral-lightest p-6 rounded-lg">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-DEFAULT">Subtotal:</span>
              <span className="text-neutral-darkest font-semibold">{invoice.currency} {subtotal.toFixed(2)}</span>
            </div>
            {invoice.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-DEFAULT">Tax ({invoice.taxRate}%):</span>
                <span className="text-neutral-darkest font-semibold">{invoice.currency} {taxAmount.toFixed(2)}</span>
              </div>
            )}
            {invoice.discount.value > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-DEFAULT">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
                <span className="text-red-500 font-semibold">- {invoice.currency} {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t-2 border-primary-DEFAULT mt-3">
              <span className="font-bold text-xl text-primary-dark">Total Due:</span>
              <span className="font-bold text-xl text-primary-dark">{invoice.currency} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-10 pt-6 border-t border-neutral-light text-sm text-neutral-DEFAULT">
        {invoice.notes && (
          <div className="mb-4">
            <h4 className="font-semibold text-neutral-darkest mb-1">Notes:</h4>
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <h4 className="font-semibold text-neutral-darkest mb-1">Terms & Conditions:</h4>
            <p className="whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-neutral-DEFAULT mt-12 pt-6">
        <p>Thank you for your business. We look forward to working with you again!</p>
         {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-400 mt-3 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default ModernTemplate;
