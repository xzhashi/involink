
import React from 'react';
import { InvoiceTemplateProps } from '../../../types.ts';

const CyberpunkGlitchTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
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

  const font = "'VT323', monospace"; // Pixel/monospace font
  const neonPink = 'text-pink-400';
  const neonCyan = 'text-cyan-300';
  const glitchStyle = { textShadow: '2px 2px #ff0055, -2px -2px #00fff2' };

  return (
    <div className="p-6 font-[VT323,monospace] bg-black text-cyan-300 border-2 border-pink-500/50 print:p-0 print:bg-white print:text-black print:border-none" style={{fontFamily: font}}>
      <header className="flex justify-between items-start mb-8 pb-4 border-b-2 border-dashed border-cyan-400/50">
        <div>
          <h2 className={`text-3xl font-bold ${neonPink}`} style={glitchStyle}>{invoice.sender.name}</h2>
          <p className="text-xs">{invoice.sender.address}</p>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold uppercase" style={glitchStyle}>{isQuote ? 'QUOTE' : 'INVOICE'}</h1>
          <p className="text-sm">/ {invoice.id} /</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 mb-8 text-xs">
        <div className="border border-pink-500/50 p-3">
          <h3 className={`font-bold uppercase ${neonPink}`}>CLIENT_DATA:</h3>
          <p>&gt; {invoice.recipient.name}</p>
          <p>&gt; {invoice.recipient.address}</p>
        </div>
        <div className="border border-cyan-400/50 p-3 text-right">
          <p>&gt; DATE_ISSUED: {new Date(invoice.date).toLocaleDateString()}</p>
          <p>&gt; {isQuote ? 'VALID_UNTIL' : 'PAYMENT_DUE'}: {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </section>

      <section className="mb-8">
        <table className="w-full text-xs">
          <thead className="bg-slate-800 print:bg-slate-200">
            <tr>
              <th className={`p-2 text-left uppercase ${neonPink} border-r border-pink-500/30`}>LOG.ITEM</th>
              <th className={`p-2 text-center uppercase ${neonPink} border-r border-pink-500/30`}>QTY</th>
              <th className={`p-2 text-right uppercase ${neonPink} border-r border-pink-500/30`}>UNIT_PRICE</th>
              <th className={`p-2 text-right uppercase ${neonPink}`}>TOTAL</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900/50 divide-y divide-dashed divide-cyan-400/30 print:bg-white print:divide-slate-300">
            {invoice.items.map(item => (
              <tr key={item.id}>
                <td className="p-2">{item.description}</td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-right">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="p-2 text-right font-bold text-white print:text-black">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="w-full md:w-1/2">
          {!isQuote && (upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="border border-cyan-400/50 p-3 text-xs">
              <h3 className={`font-bold uppercase ${neonCyan}`}>PAYMENT_TERMINAL:</h3>
              {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="UPI QR Code" className="bg-white p-1 my-2" style={{width: '75px', height: '75px'}}/>}
              {upiLink && <a href={upiLink} target="_blank" rel="noopener noreferrer" className="block text-pink-400 hover:underline">&gt; EXECUTE_UPI_PAYMENT.EXE</a>}
              {invoice.manualPaymentLink && <a href={invoice.manualPaymentLink} target="_blank" rel="noopener noreferrer" className="block text-green-400 hover:underline mt-1">&gt; ACCESS_MANUAL_LINK</a>}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 text-right text-sm space-y-1">
          <p>SUBTOTAL: <span className="font-bold">{invoice.currency} {subtotal.toFixed(2)}</span></p>
          {invoice.taxRate > 0 && <p>SYSTEM_TAX ({invoice.taxRate}%): <span className="font-bold">{invoice.currency} {taxAmount.toFixed(2)}</span></p>}
          {invoice.discount.value > 0 && <p className={neonPink}>DISCOUNT: <span className="font-bold">- {invoice.currency} {discountAmount.toFixed(2)}</span></p>}
          <p className="text-xl font-bold border-t-2 border-pink-500 pt-1 mt-1">TOTAL_DUE: <span className={neonPink} style={glitchStyle}>{invoice.currency} {total.toFixed(2)}</span></p>
        </div>
      </section>

      <footer className="mt-8 pt-4 border-t-2 border-dashed border-cyan-400/50 text-xs text-cyan-400/70">
        {invoice.notes && <p className="mb-2">&gt; NOTE: {invoice.notes}</p>}
        {invoice.terms && <p>&gt; TERMS: {invoice.terms}</p>}
        <p className="text-center mt-6">TRANSACTION COMPLETE. AWAITING PAYMENT.</p>
        {userPlan?.has_branding && (
            <p className="text-center mt-4 text-gray-600 print:text-gray-400">
                Powered by Invoice Maker <span className="opacity-80">by LinkFC</span>
            </p>
        )}
      </footer>
    </div>
  );
};

export default CyberpunkGlitchTemplate;