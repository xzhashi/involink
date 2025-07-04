import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';
import { INITIAL_CUSTOMIZATION_STATE } from '../../../constants.ts';

export const CustomTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan, customization }) => {
  const custom = customization || INITIAL_CUSTOMIZATION_STATE;

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalTaxAmount = (invoice.taxes || []).reduce((acc, tax) => acc + (subtotal * tax.rate) / 100, 0);
  let discountAmount = 0;
  if (invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage' 
      ? (subtotal * invoice.discount.value) / 100 
      : invoice.discount.value;
  }
  const total = subtotal + totalTaxAmount - discountAmount;

  const customStyles = {
    '--primary-color': custom.primaryColor,
    '--accent-color': custom.accentColor,
    '--text-color': custom.textColor,
    '--bg-color': custom.backgroundColor,
    '--heading-font': custom.headingFont,
    '--body-font': custom.bodyFont,
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-color)',
    fontFamily: 'var(--body-font)',
  } as React.CSSProperties;

  return (
    <div className="p-8 print:p-0" style={customStyles}>
      {/* Header */}
      <header className="flex justify-between items-start mb-10 pb-4" style={{ borderBottom: `2px solid ${custom.primaryColor}`}}>
        <div>
          {custom.showLogo && invoice.sender.logoUrl && (
            <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="mb-2" style={{ maxHeight: `${custom.logoSize}px` }} />
          )}
          <h2 className="text-2xl font-bold" style={{ color: `var(--primary-color)`, fontFamily: `var(--heading-font)` }}>
            {invoice.sender.name}
          </h2>
          <p className="text-sm" style={{ color: `var(--text-color)` }}>{invoice.sender.address}</p>
          {invoice.sender.email && <p className="text-sm" style={{ color: `var(--text-color)` }}>{invoice.sender.email}</p>}
          {invoice.sender.phone && <p className="text-sm" style={{ color: `var(--text-color)` }}>{invoice.sender.phone}</p>}
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-extrabold" style={{ color: `var(--primary-color)`, fontFamily: `var(--heading-font)` }}>INVOICE</h1>
          <p className="text-lg"># {invoice.id}</p>
        </div>
      </header>

      {/* Client Info & Dates */}
      <section className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="text-xs uppercase font-semibold mb-1" style={{ color: `var(--accent-color)` }}>Bill To</h3>
          <p className="font-bold">{invoice.recipient.name}</p>
          <p className="text-sm">{invoice.recipient.address}</p>
        </div>
        <div className="text-right">
          <p><strong>Date Issued:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-10">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: custom.primaryColor, color: custom.backgroundColor }}>
              <th className="text-left py-2 px-3 text-sm font-semibold uppercase">Description</th>
              <th className="text-center py-2 px-3 text-sm font-semibold uppercase">Qty</th>
              <th className="text-right py-2 px-3 text-sm font-semibold uppercase">Unit Price</th>
              <th className="text-right py-2 px-3 text-sm font-semibold uppercase">Amount</th>
            </tr>
          </thead>
          <tbody style={{ borderBottom: `1px solid ${custom.accentColor}` }}>
            {invoice.items.map(item => (
              <tr key={item.id} style={{ borderBottom: `1px solid ${custom.primaryColor}20`}}>
                <td className="py-3 px-3">{item.description}</td>
                <td className="text-center py-3 px-3">{item.quantity}</td>
                <td className="text-right py-3 px-3">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right py-3 px-3 font-medium">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
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
              <h4 className="font-semibold mb-2 text-md" style={{ color: `var(--primary-color)` }}>Payment Details:</h4>
              {qrCodeDataUrl && (
                <div className="mb-3 text-center md:text-left">
                  <p className="text-xs mb-1">Scan to Pay (UPI):</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="p-1 rounded-md inline-block bg-white" style={{border: `1px solid ${custom.accentColor}`, width: '100px', height: '100px'}}/>
                </div>
              )}
              {upiLink && (
                 <a href={upiLink} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors" style={{ backgroundColor: custom.primaryColor, color: custom.backgroundColor }}>
                    Pay Now via UPI
                </a>
              )}
              {invoice.manualPaymentLink && (
                 <a href={invoice.manualPaymentLink} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors mt-2" style={{ backgroundColor: custom.accentColor, color: custom.backgroundColor }}>
                    Pay Online
                </a>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-auto md:min-w-[280px]">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-medium">{invoice.currency} {subtotal.toFixed(2)}</span></div>
            {(invoice.taxes || []).map(tax => (
                <div key={tax.id} className="flex justify-between">
                    <span>{tax.name} ({tax.rate}%):</span>
                    <span className="font-medium">{invoice.currency} {((subtotal * tax.rate) / 100).toFixed(2)}</span>
                </div>
            ))}
            {invoice.discount.value > 0 && (<div className="flex justify-between" style={{color: custom.accentColor}}><span>Discount:</span><span className="font-medium">- {invoice.currency} {discountAmount.toFixed(2)}</span></div>)}
            <div className="flex justify-between pt-2 mt-2" style={{borderTop: `2px solid ${custom.primaryColor}`}}>
              <span className="font-bold text-lg" style={{fontFamily: `var(--heading-font)`, color: `var(--primary-color)`}}>Total:</span>
              <span className="font-bold text-lg" style={{fontFamily: `var(--heading-font)`, color: `var(--primary-color)`}}>{invoice.currency} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      {(custom.showNotes && invoice.notes) && (
        <section className="mt-10 pt-6 text-sm" style={{ borderTop: `1px dashed ${custom.accentColor}` }}>
            <h4 className="font-semibold mb-1" style={{ color: `var(--primary-color)` }}>Notes:</h4>
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
        </section>
      )}
      {(custom.showTerms && invoice.terms) && (
        <section className="mt-4 pt-4 text-sm" style={{ borderTop: `1px dashed ${custom.accentColor}` }}>
            <h4 className="font-semibold mb-1" style={{ color: `var(--primary-color)` }}>Terms & Conditions:</h4>
            <p className="whitespace-pre-wrap">{invoice.terms}</p>
        </section>
      )}

      <footer className="text-center text-xs mt-12 pt-6" style={{ borderTop: `1px solid ${custom.accentColor}` }}>
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
