import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { downloadDataUrl } from '../../utils'; // Assuming utils.ts is in the root or accessible path
import { CopyIcon } from '../../components/icons/CopyIcon'; // Create this icon
import { QrCodeIcon } from '../../components/icons/QrCodeIcon'; // Create this icon
import { DownloadIcon } from '../../components/icons/DownloadIcon';

interface PaymentToolsProps {
  invoiceTotal: number;
  invoiceId: string;
  defaultPayeeName: string;
  invoiceCurrency: string;
  onUpiDetailsGenerated: (link: string, qrDataUrl: string) => void; // Callback prop
}

const PaymentTools: React.FC<PaymentToolsProps> = ({
  invoiceTotal,
  invoiceId,
  defaultPayeeName,
  invoiceCurrency,
  onUpiDetailsGenerated,
}) => {
  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState(defaultPayeeName);
  const [transactionNote, setTransactionNote] = useState(`Payment for Invoice #${invoiceId}`);
  const [generatedUpiLink, setGeneratedUpiLink] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setPayeeName(defaultPayeeName);
  }, [defaultPayeeName]);

  useEffect(() => {
    setTransactionNote(`Payment for Invoice #${invoiceId}`);
  }, [invoiceId]);

  const handleGenerateUpiLink = async () => {
    if (!upiId || invoiceTotal <= 0) {
      alert('Please enter a valid UPI ID and ensure the invoice total is greater than zero.');
      setGeneratedUpiLink('');
      setQrCodeDataUrl('');
      // Optionally call onUpiDetailsGenerated with empty strings if needed by parent
      // onUpiDetailsGenerated('', ''); 
      return;
    }

    const params = new URLSearchParams({
      pa: upiId, // Payee VPA
      pn: payeeName || defaultPayeeName, // Payee Name
      am: invoiceTotal.toFixed(2), // Amount
      cu: 'INR', // Currency (Hardcoded to INR for UPI)
      tr: invoiceId, // Transaction Reference (Invoice ID)
      tn: transactionNote, // Transaction Note
    });

    const upiLink = `upi://pay?${params.toString()}`;
    setGeneratedUpiLink(upiLink);

    try {
      const qrDataUrl = await QRCode.toDataURL(upiLink, { errorCorrectionLevel: 'M', width: 256 });
      setQrCodeDataUrl(qrDataUrl);
      onUpiDetailsGenerated(upiLink, qrDataUrl); // Call callback with generated details
    } catch (err) {
      console.error('Failed to generate QR code', err);
      alert('Failed to generate QR code. Please try again.');
      setQrCodeDataUrl(''); // Clear QR on error
      // Optionally call onUpiDetailsGenerated with link and empty QR string
      // onUpiDetailsGenerated(upiLink, '');
    }
  };

  const handleCopyLink = () => {
    if (generatedUpiLink) {
      navigator.clipboard.writeText(generatedUpiLink).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy UPI link: ', err);
        alert('Failed to copy link. Please copy it manually.');
      });
    }
  };
  
  const handleDownloadQr = () => {
    if (qrCodeDataUrl) {
        downloadDataUrl(qrCodeDataUrl, `invoice-${invoiceId}-upi-qr.png`);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        label="Your UPI ID (e.g., yourname@bank)"
        id="upiId"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        placeholder="yourvpa@oksbi"
      />
      <Input
        label="Payee Name (Optional)"
        id="payeeName"
        value={payeeName}
        onChange={(e) => setPayeeName(e.target.value)}
        placeholder="Your Company Name"
      />
       <Input
        label="Transaction Note (Optional)"
        id="transactionNote"
        value={transactionNote}
        onChange={(e) => setTransactionNote(e.target.value)}
        placeholder={`Payment for Invoice #${invoiceId}`}
      />

      {invoiceCurrency !== 'INR' && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
          Note: Your invoice currency is {invoiceCurrency}. UPI payments are typically processed in INR. The generated link will use INR with the invoice total amount ({invoiceTotal.toFixed(2)}).
        </p>
      )}

      <Button onClick={handleGenerateUpiLink} leftIcon={<QrCodeIcon className="w-5 h-5"/>} disabled={!upiId || invoiceTotal <= 0}>
        Generate UPI Link & QR Code
      </Button>

      {generatedUpiLink && (
        <div className="mt-4 space-y-3 p-3 bg-neutral-lightest rounded-md">
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">Generated UPI Link:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedUpiLink}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm bg-slate-100 cursor-not-allowed text-slate-700"
                aria-label="Generated UPI Link"
              />
              <Button onClick={handleCopyLink} variant="ghost" size="sm" title="Copy UPI Link">
                {isCopied ? 'Copied!' : <CopyIcon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          
          {qrCodeDataUrl && (
            <div className="text-center">
              <label className="block text-sm font-medium text-neutral-dark mb-1">Scan QR Code to Pay:</label>
              <img src={qrCodeDataUrl} alt={`UPI QR Code for Invoice ${invoiceId}`} className="mx-auto border border-neutral-DEFAULT/30 p-1 rounded-md" style={{width: '180px', height: '180px'}}/>
              <Button onClick={handleDownloadQr} variant="secondary" size="sm" className="mt-2" leftIcon={<DownloadIcon className="w-4 h-4"/>}>
                Download QR Code
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentTools;