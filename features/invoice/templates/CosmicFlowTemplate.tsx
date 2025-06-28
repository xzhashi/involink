

import React from 'react';
import { InvoiceTemplateProps } from '../../../types';

const CosmicFlowTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, upiLink, qrCodeDataUrl, userPlan }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  let discountAmount = 0;
  if (invoice.discount.value > 0) {
    discountAmount = invoice.discount.type === 'percentage'
      ? (subtotal * invoice.discount.value) / 100
      : invoice.discount.value;
  }
  const total = subtotal + taxAmount - discountAmount;

  // Define glow styles for reusability and clarity
  const purpleGlow = { textShadow: '0 0 8px #c084fc' }; // purple-400
  const cyanGlow = { textShadow: '0 0 10px #67e8f9' }; // cyan-300
  const cyanGlowTable = { textShadow: '0 0 5px rgba(34, 211, 238, 0.7)' }; // cyan-400 with opacity

  return (
    // Intended background: Dark blue/purple nebula or starfield image.
    // <div className="p-8 font-sans bg-indigo-900 bg-[url('/placeholder-cosmic-bg.jpg')] bg-cover text-slate-100 print:p-0">
    <div className="p-8 font-sans bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-slate-100 print:p-0 print:bg-white print:from-white print:to-white print:text-black">
      {/* Header with Glowing Effect */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-12 pb-6 border-b-2 border-purple-500/50">
        <div>
          {invoice.sender.logoUrl ? (
            <img src={invoice.sender.logoUrl} alt={`${invoice.sender.name} logo`} className="max-h-16 mb-3 sm:mb-0 filter brightness-0 invert print:filter-none" />
          ) : (
            <h2 className="text-4xl font-black tracking-tighter text-white print:text-black print:text-shadow-none" style={purpleGlow}>{invoice.sender.name}</h2>
          )}
          <p className="text-xs text-slate-300 print:text-slate-600">{invoice.sender.address}</p>
        </div>
        <div className="text-left sm:text-right mt-4 sm:mt-0">
          <h1 className="text-5xl font-extrabold uppercase text-white print:text-black print:text-shadow-none" style={cyanGlow}>Invoice</h1>
          <p className="text-md text-slate-200 print:text-slate-700">Transmission ID: {invoice.id}</p>
        </div>
      </header>

      {/* Client Info & Dates in Panels */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-800/60 p-4 rounded-lg shadow-lg border border-purple-500/30 print:bg-slate-100 print:border-slate-300">
          <h3 className="text-xs uppercase font-semibold text-purple-300 mb-1 print:text-purple-600">Recipient Network Node:</h3>
          <p className="font-semibold text-lg text-slate-50 print:text-slate-800">{invoice.recipient.name}</p>
          <p className="text-sm text-slate-300 print:text-slate-600">{invoice.recipient.address}</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-lg shadow-lg border border-cyan-500/30 text-left md:text-right print:bg-slate-100 print:border-slate-300">
          <p className="mb-1"><strong className="text-slate-400 font-medium print:text-slate-500">Signal Origination:</strong> <span className="text-slate-50 print:text-slate-800">{new Date(invoice.date).toLocaleDateString()}</span></p>
          <p><strong className="text-slate-400 font-medium print:text-slate-500">Response Deadline:</strong> <span className="text-slate-50 print:text-slate-800">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
        </div>
      </section>

      {/* Items Table with Glow Effect on Headers */}
      <section className="mb-10 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-slate-700/50 print:bg-slate-200">
            <tr>
              <th className="text-left p-3 text-sm font-semibold uppercase text-cyan-300 print:text-cyan-700 print:text-shadow-none" style={cyanGlowTable}>Data Packet / Service Unit</th>
              <th className="text-center p-3 text-sm font-semibold uppercase text-cyan-300 print:text-cyan-700 print:text-shadow-none" style={cyanGlowTable}>Count</th>
              <th className="text-right p-3 text-sm font-semibold uppercase text-cyan-300 print:text-cyan-700 print:text-shadow-none" style={cyanGlowTable}>Value per Unit</th>
              <th className="text-right p-3 text-sm font-semibold uppercase text-cyan-300 print:text-cyan-700 print:text-shadow-none" style={cyanGlowTable}>Sub-Total Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/30">
            {invoice.items.map(item => (
              <tr key={item.id} className="hover:bg-purple-800/40 print:hover:bg-slate-50">
                <td className="p-3 text-slate-200 print:text-slate-700">{item.description}</td>
                <td className="text-center p-3 text-slate-300 print:text-slate-600">{item.quantity}</td>
                <td className="text-right p-3 text-slate-300 print:text-slate-600">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                <td className="text-right p-3 text-slate-100 font-medium print:text-slate-800">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals & Payment Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
        <div className="w-full md:w-auto order-last md:order-first mt-6 md:mt-0">
          {(upiLink || qrCodeDataUrl || invoice.manualPaymentLink) && (
            <div className="bg-slate-800/60 border border-purple-500/30 p-4 rounded-lg shadow-lg space-y-3 text-center md:text-left print:bg-slate-100 print:border-slate-300">
              <h4 className="font-semibold text-purple-300 mb-2 text-md print:text-purple-600">Payment Matrix</h4>
              {qrCodeDataUrl && (
                <div>
                  <p className="text-xs text-slate-400 mb-1 print:text-slate-500">Scan Access Node (UPI):</p>
                  <img src={qrCodeDataUrl} alt="UPI QR Code" className="border-2 border-purple-400 p-0.5 rounded-sm inline-block bg-white" style={{width: '90px', height: '90px'}}/>
                </div>
              )}
              {upiLink && (
                <div>
                  <a
                    href={upiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-sm font-semibold rounded-md shadow-lg hover:from-purple-600 hover:to-fuchsia-600 transition-all"
                  >
                    Engage UPI Protocol
                  </a>
                </div>
              )}
              {invoice.manualPaymentLink && (
                 <div>
                    <a
                        href={invoice.manualPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-5 py-2 bg-gradient-to-r from-cyan-500 to-sky-500 text-white text-sm font-semibold rounded-md shadow-lg hover:from-cyan-600 hover:to-sky-600 transition-all"
                    >
                        External Payment Hyperlink
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 lg:w-1/3 space-y-1 text-sm ml-auto">
          <div className="flex justify-between p-2 rounded bg-slate-800/70 print:bg-slate-100">
            <span className="text-slate-400 print:text-slate-600">Aggregated Value:</span>
            <span className="text-slate-100 font-medium print:text-slate-800">{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between p-2 rounded bg-slate-800/70 print:bg-slate-100">
              <span className="text-slate-400 print:text-slate-600">System Levy ({invoice.taxRate}%):</span>
              <span className="text-slate-100 font-medium print:text-slate-800">{invoice.currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.discount.value > 0 && (
             <div className="flex justify-between p-2 rounded bg-slate-800/70 print:bg-slate-100">
              <span className="text-slate-400 print:text-slate-600">Value Adjustment ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `${invoice.currency} ${invoice.discount.value.toFixed(2)}`}):</span>
              <span className="text-pink-400 font-medium print:text-pink-600">- {invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between p-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-md mt-2 shadow-2xl print:from-cyan-500 print:to-purple-600">
            <span className="font-bold text-xl uppercase [text-shadow:0_0_6px_rgba(0,0,0,0.5)] print:text-shadow-none">Total Due:</span>
            <span className="font-bold text-xl [text-shadow:0_0_6px_rgba(0,0,0,0.5)] print:text-shadow-none">{invoice.currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
      <section className="mt-10 pt-6 border-t border-purple-500/30 text-xs text-slate-300 print:border-slate-300 print:text-slate-600">
        {invoice.notes && (
          <div className="mb-4 p-4 rounded bg-slate-800/50 border border-purple-500/20 print:bg-slate-100 print:border-slate-200">
            <h4 className="font-semibold text-purple-300 mb-1 print:text-purple-600">Transmission Log:</h4>
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div className="p-4 rounded bg-slate-800/50 border border-purple-500/20 print:bg-slate-100 print:border-slate-200">
            <h4 className="font-semibold text-purple-300 mb-1 print:text-purple-600">Service Protocol:</h4>
            <p className="whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}
      </section>
      )}

      <footer className="text-center text-xs text-slate-500 mt-12 pt-6 border-t border-purple-500/30 print:border-slate-300 print:text-slate-500">
        <p>End of Transmission /// {invoice.sender.name}</p>
         {userPlan === 'free' && (
          <div className="text-center text-xs text-gray-600 mt-2 print:text-gray-400">
            Powered by Invoice Maker <span className="text-[0.6rem] opacity-80">by LinkFC</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default CosmicFlowTemplate;