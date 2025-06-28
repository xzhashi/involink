import React from 'react';
import { InvoiceTemplateProps } from '../../../types'; 

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
      <header className="bg-primary-DEFAULT text-white p-8 rounded-t-lg -mx-6 -mt-6 md:-mx-10 md:-mt-10 print:bg-slate-700 print:text-white print:rounded-none print:-m-0">
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
          <thead className="bg-neutral-light rounded-md">
            <tr>
              <th className="text-left p-3 font-semibold text-neutral-darkest">Description</th>
              <th className="text-right p-3 font-semibold text-neutral-darkest">Qty</th>
              <th className="text-right p-3 font-semibold text-neutral-darkest">Unit Price</th>
              <th className="text-right p-3 font-semibold text-neutral-darkest">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id} className="border-b border-neutral-light">
                <td className="p-3 text-neutral-DEFAULT">{item.description}</td>
                <td className="text-right p-3 text-neutral-DEFAULT">{item.quantity}</td>
                <td className="text-right p-3 text-neutral-DEFAULT">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right p-3 text-neutral-darkest font-medium">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals Section & Payment */}
      <section className="flex flex-col md:flex-row justify-end items-start gap-6 mb-8">
        {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0 md:mr-auto bg-neutral-lightest p-4 rounded-md text-center md:text-left">
                <h4 className="font-semibold text-neutral-darkest mb-2 text-md">Easy Payment:</h4>
                {qrCodeDataUrl && (
                <div className="mb-3">
                    <p className="text-xs text-neutral-DEFAULT mb-1">Scan QR to Pay (UPI):</p>
                    <img src={qrCodeDataUrl} alt="UPI QR Code" className="border border-neutral-light p-1 rounded-md inline-block" style={{width: '100px', height: '100px'}}/>
                </div>
                )}
                {upiLink && (
                <div className="mb-3">
                    <a 
                    href={upiLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2.5 bg-secondary-DEFAULT hover:bg-secondary-dark text-white text-sm font-semibold rounded-md shadow hover:shadow-lg transition-colors"
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
                          className="inline-block px-5 py-2.5 bg-primary-DEFAULT hover:bg-primary-dark text-white text-sm font-semibold rounded-md shadow hover:shadow-lg transition-colors"
                      >
                          Pay Online Now
                      </a>
                  </div>
                )}
            </div>
        )}
        <div className="w-full md:w-2/5 lg:w-1/3 space-y-2">
          <div className="flex justify-between p-2 rounded bg-neutral-lightest">
            <span className="text-neutral-DEFAULT">Subtotal:</span>
            <span className="text-neutral-darkest font-medium">{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between p-2 rounded bg-neutral-lightest">
              <span className="text-neutral-DEFAULT">Tax ({invoice.taxRate}%):</span>
              <span className="text-neutral-darkest font-medium">{invoice.currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.discount.value > 0 && (
             <div className="flex justify-between p-2 rounded bg-neutral-lightest">
              <span className="text-neutral-DEFAULT">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
              <span className="text-red-500 font-medium">- {invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between p-3 bg-primary-DEFAULT text-white rounded-md mt-2 shadow-lg">
            <span className="font-bold text-lg">Total Due:</span>
            <span className="font-bold text-lg">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-8 pt-6 border-t border-neutral-light text-sm">
        {invoice.notes && (
          <div className="mb-4 bg-neutral-lightest p-4 rounded-md">
            <h4 className="font-semibold text-neutral-darkest mb-1">Notes:</h4>
            <p className="text-neutral-DEFAULT whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div className="bg-neutral-lightest p-4 rounded-md">
            <h4 className="font-semibold text-neutral-darkest mb-1">Terms & Conditions:</h4>
            <p className="text-neutral-DEFAULT whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}
      
      <footer className="text-center text-xs text-neutral-DEFAULT mt-12 pt-6 border-t border-neutral-light">
        <p>Thank you for choosing {invoice.sender.name || "us"}!</p>
        {userPlan === 'free' && (
          <div className="text-center text-xs text-gray-400 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default ModernTemplate;