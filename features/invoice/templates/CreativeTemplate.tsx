

import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts'; 

const CreativeTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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
    <div className="p-8 font-sans bg-neutral-lightest text-neutral-darkest shadow-2xl rounded-lg print:p-0 print:shadow-none print:rounded-none">
      {/* Decorative Header */}
      <div className="relative mb-8 p-8 bg-gradient-to-br from-accent-DEFAULT to-secondary-light rounded-lg text-white print:from-slate-600 print:to-slate-800">
        <div className="absolute top-0 left-0 w-16 h-16 bg-white/20 rounded-br-full print:hidden"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-tl-full print:hidden"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div>
            {invoice.sender.logoUrl ? (
                <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-12 mb-2 filter brightness-0 invert" />
              ) : (
                <h2 className="text-2xl font-bold">{invoice.sender.name}</h2>
            )}
            <p className="text-xs opacity-80 max-w-xs">{invoice.sender.address}</p>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-black tracking-tighter uppercase">{isQuote ? 'Quote' : 'Invoice'}</h1>
            <p className="text-md opacity-90"># {invoice.id}</p>
          </div>
        </div>
      </div>

      {/* Client Info & Dates */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-sm font-semibold text-accent-dark mb-1">BILLED TO:</h3>
          <p className="font-bold text-lg text-neutral-darkest">{invoice.recipient.name}</p>
          <p className="text-sm text-neutral-DEFAULT">{invoice.recipient.address}</p>
          {invoice.recipient.email && <p className="text-xs text-neutral-DEFAULT">{invoice.recipient.email}</p>}
        </div>
        <div className="bg-white p-4 rounded-md shadow text-right md:text-left">
          <div className="mb-2">
            <span className="text-sm font-semibold text-accent-dark block">ISSUE DATE:</span>
            <span className="text-neutral-darkest">{new Date(invoice.date).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-accent-dark block">{isQuote ? 'VALID UNTIL:' : 'DUE DATE:'}</span>
            <span className="text-neutral-darkest">{new Date(invoice.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-secondary-DEFAULT text-white print:bg-slate-700">
            <tr>
              <th className="text-left p-3 font-semibold text-sm">ITEM DESCRIPTION</th>
              <th className="text-center p-3 font-semibold text-sm">QTY</th>
              <th className="text-right p-3 font-semibold text-sm">PRICE</th>
              <th className="text-right p-3 font-semibold text-sm">TOTAL</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {invoice.items.map((item, idx) => (
              <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-secondary-light/10'} border-b border-neutral-light/50`}>
                <td className="p-3 text-neutral-darkest">{item.description}</td>
                <td className="text-center p-3 text-neutral-DEFAULT">{item.quantity}</td>
                <td className="text-right p-3 text-neutral-DEFAULT">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right p-3 text-neutral-darkest font-semibold">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
         <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
          {!isQuote && (upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="bg-white p-4 rounded-md shadow text-center space-y-3">
              <h4 className="font-semibold text-secondary-dark mb-2 text-md">Quick Pay</h4>
              {qrCodeDataUrl && (
                <div>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="border-2 border-accent-light p-1 rounded-md inline-block" style={{width: '110px', height: '110px'}}/>
                </div>
              )}
              {upiLink && (
                <div>
                  <a 
                    href={upiLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-2 bg-accent-DEFAULT text-white text-sm font-bold rounded-full shadow-lg hover:bg-accent-dark transition-all transform hover:scale-105"
                  >
                    Tap to Pay (UPI)
                  </a>
                </div>
              )}
              {invoice.manualPaymentLink && (
                 <div>
                    <a 
                        href={invoice.manualPaymentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-2 bg-secondary-dark text-white text-sm font-bold rounded-full shadow-lg hover:bg-secondary-DEFAULT transition-all transform hover:scale-105"
                    >
                        Make Payment Online
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 space-y-2 text-sm bg-white p-4 rounded-md shadow">
          <div className="flex justify-between">
            <span className="text-neutral-DEFAULT">Subtotal:</span>
            <span className="text-neutral-darkest font-medium">{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-DEFAULT">Tax ({invoice.taxRate}%):</span>
              <span className="text-neutral-darkest font-medium">{invoice.currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.discount.value > 0 && (
             <div className="flex justify-between">
              <span className="text-neutral-DEFAULT">Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
              <span className="text-red-500 font-medium">- {invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t border-neutral-light mt-2">
            <span className="font-bold text-xl text-accent-dark">{isQuote ? 'TOTAL:' : 'DUE:'}</span>
            <span className="font-bold text-xl text-accent-dark">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {invoice.attachments && invoice.attachments.length > 0 && (
        <section className="mt-8 bg-white p-4 rounded-md shadow">
          <h4 className="font-semibold text-secondary-dark mb-2 text-md">Attached Files</h4>
          <ul className="list-disc list-inside text-sm text-neutral-DEFAULT space-y-1">
            {invoice.attachments.map(att => (
              <li key={att.name}>
                <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-accent-dark hover:underline">
                  {att.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(invoice.notes || invoice.terms) && (
      <section className="mt-8 text-xs">
        {invoice.notes && (
          <div className="mb-4 bg-white p-4 rounded-md shadow">
            <h4 className="font-semibold text-secondary-dark mb-1">A Little Note:</h4>
            <p className="text-neutral-DEFAULT whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div className="bg-white p-4 rounded-md shadow">
            <h4 className="font-semibold text-secondary-dark mb-1">Our Terms:</h4>
            <p className="text-neutral-DEFAULT whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-neutral-DEFAULT mt-10 pt-4 border-t-2 border-dashed border-accent-light">
        <p>Questions? Reach out to {invoice.sender.email || invoice.sender.phone || 'us'}.</p>
        <p>Thanks for being awesome!</p>
         {userPlan?.has_branding && (
          <div className="text-center text-xs text-gray-400 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default CreativeTemplate;