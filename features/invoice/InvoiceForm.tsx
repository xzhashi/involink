



import React, { useState, ChangeEvent } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { InvoiceData, InvoiceItem, Attachment, Tax, Client } from '../../types.ts';
import Input from '../../components/common/Input.tsx';
import Textarea from '../../components/common/Textarea.tsx';
import Button from '../../components/common/Button.tsx';
import InvoiceItemRow from './InvoiceItemRow.tsx';
import { PlusIcon } from '../../components/icons/PlusIcon.tsx';
import Select from '../../components/common/Select.tsx';
import { DEFAULT_CURRENCY, AVAILABLE_TEMPLATES } from '../../constants.ts';
import PaymentTools from './PaymentTools.tsx'; 
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon.tsx'; 
import { ChevronUpIcon } from '../../components/icons/ChevronUpIcon.tsx'; 
import { UploadIcon } from '../../components/icons/UploadIcon.tsx'; 
import { LinkIcon } from '../../components/icons/LinkIcon.tsx'; 
import { WrenchScrewdriverIcon } from '../../components/icons/WrenchScrewdriverIcon.tsx';
import { CURRENCY_OPTIONS } from '../../currencies.ts';
import { TrashIcon } from '../../components/icons/TrashIcon.tsx';
import { CubeIcon } from '../../components/icons/CubeIcon.tsx';
import { ArrowRightIcon } from '../../components/icons/ArrowRightIcon.tsx';

const { Link } = ReactRouterDOM;

interface InvoiceFormProps {
  invoice: InvoiceData;
  invoiceTotal: number;
  clients: Client[];
  availableTaxes: Tax[];
  onInvoiceChange: <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => void;
  onCompanyDetailsChange: (party: 'sender' | 'recipient', key: string, value: string) => void;
  onItemChange: (itemId: string, key: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId:string) => void;
  onDiscountChange: (type: 'percentage' | 'fixed', value: number) => void;
  onUpiDetailsGenerated: (link: string, qrDataUrl: string) => void;
  onClientSelect: (clientId: string) => void;
  temporaryLogoUrl: string | null; 
  onTemporaryLogoChange: (logoDataUrl: string | null) => void; 
  onOpenTemplateModal: () => void;
  onOpenCustomizationModal: () => void;
  onOpenProductModal: () => void;
  onFileUpload: (files: FileList) => void;
  onFileDelete: (file: Attachment) => void;
  isUploading: boolean;
  uploadError: string | null;
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode; initialOpen?: boolean; isCollapsible?: boolean }> = ({ title, children, initialOpen = true, isCollapsible = true }) => { 
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className="bg-white rounded-lg shadow">
      <button 
        className="flex justify-between items-center w-full p-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`section-content-${title.replace(/\s+/g, '-')}`}
        disabled={!isCollapsible} 
      >
        <h2 className="text-xl font-semibold text-neutral-darkest">{title}</h2>
        {isCollapsible && (isOpen ? <ChevronUpIcon className="w-5 h-5 text-neutral-DEFAULT" /> : <ChevronDownIcon className="w-5 h-5 text-neutral-DEFAULT" />)}
      </button>
      {isOpen && (
        <div id={`section-content-${title.replace(/\s+/g, '-')}`} className="p-6 pt-0">
          {isCollapsible && <div className="border-t pt-4 -mt-2 mb-2"></div>}
          {children}
        </div>
      )}
    </div>
  );
};


const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  invoiceTotal,
  clients,
  availableTaxes,
  onInvoiceChange,
  onCompanyDetailsChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onDiscountChange,
  onUpiDetailsGenerated,
  onClientSelect,
  temporaryLogoUrl,
  onTemporaryLogoChange,
  onOpenTemplateModal,
  onOpenCustomizationModal,
  onOpenProductModal,
  onFileUpload,
  onFileDelete,
  isUploading,
  uploadError
}) => {
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [selectedTaxId, setSelectedTaxId] = useState('');

  const handleGenericChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, key: keyof InvoiceData) => {
    onInvoiceChange(key, e.target.value);
  };
  
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, party: 'sender' | 'recipient', key: string) => {
    onCompanyDetailsChange(party, key, e.target.value);
  };

  const handleLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert("File size cannot exceed 2MB.");
        event.target.value = ''; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onTemporaryLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseLogoUrl = () => {
    if (logoUrlInput.trim()) {
      if (!logoUrlInput.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i)) {
          alert("Please enter a valid image URL (ending in .jpg, .png, .gif, .svg)");
          return;
      }
      onTemporaryLogoChange(logoUrlInput);
    }
  };

  const handleAddTax = () => {
    if (!selectedTaxId) return;
    const taxToAdd = availableTaxes.find(t => t.id === selectedTaxId);
    if (taxToAdd && !invoice.taxes.find(t => t.id === taxToAdd.id)) {
        onInvoiceChange('taxes', [...invoice.taxes, taxToAdd]);
    }
    setSelectedTaxId('');
  };

  const handleRemoveTax = (taxId: string) => {
    onInvoiceChange('taxes', invoice.taxes.filter(t => t.id !== taxId));
  };

  const currentEffectiveLogo = temporaryLogoUrl || invoice.sender.logoUrl;
  const templateInfo = AVAILABLE_TEMPLATES.find(t => t.id === invoice.selectedTemplateId);

  return (
    <div className="space-y-6">
      <div 
          className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm"
          onClick={onOpenTemplateModal}
          role="button"
          tabIndex={0}
          aria-label="Change invoice template"
      >
          <div className="flex items-center gap-4">
              <img 
                  src={templateInfo?.thumbnailUrl || 'https://placehold.co/80x56'} 
                  alt={templateInfo?.name || 'Template preview'}
                  className="w-20 h-14 object-cover rounded-md bg-slate-100 flex-shrink-0"
              />
              <div className="flex-grow overflow-hidden">
                  <p className="font-semibold text-slate-800">Change Design</p>
                  <p className="text-sm text-slate-500 truncate">Current: {templateInfo?.name || 'Unknown'}</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
          </div>
      </div>
        {invoice.selectedTemplateId === 'custom' && (
          <Button 
            onClick={onOpenCustomizationModal} 
            variant="ghost" 
            className="w-full border-primary-light"
            leftIcon={<WrenchScrewdriverIcon className="w-5 h-5"/>}
          >
            Customize Template
          </Button>
        )}

      <SectionCard title="Invoice Details" initialOpen={true} isCollapsible={true}>
        <Input label="Invoice Number" id="invoiceId" value={invoice.id} onChange={(e) => handleGenericChange(e, 'id')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Issue Date" id="invoiceDate" type="date" value={invoice.date} onChange={(e) => handleGenericChange(e, 'date')} />
          <Input label="Due Date" id="invoiceDueDate" type="date" value={invoice.dueDate} onChange={(e) => handleGenericChange(e, 'dueDate')} />
        </div>
        <Select 
            label="Currency" 
            id="currency" 
            value={invoice.currency || DEFAULT_CURRENCY} 
            onChange={(e) => handleGenericChange(e, 'currency')}
            options={CURRENCY_OPTIONS}
        />
      </SectionCard>
      
      <SectionCard title="Logo Options" initialOpen={false} isCollapsible={true}>
        <div className="space-y-3">
          <div>
            <label htmlFor="logoUpload" className="block text-sm font-medium text-neutral-dark mb-1">Upload Logo</label>
            <div className="flex items-center space-x-2">
              <input 
                type="file" 
                id="logoUpload" 
                accept="image/png, image/jpeg, image/gif, image/svg+xml"
                onChange={handleLogoFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-lightest file:text-primary-dark hover:file:bg-primary-light/30"
              />
            </div>
            <p className="text-xs text-neutral-DEFAULT mt-1">Max 2MB. PNG, JPG, GIF, SVG.</p>
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-neutral-dark mb-1">Or Paste Image URL</label>
            <div className="flex items-center space-x-2">
                <Input 
                    id="logoUrl" 
                    type="url" 
                    value={logoUrlInput} 
                    onChange={(e) => setLogoUrlInput(e.target.value)} 
                    placeholder="https://example.com/logo.png" 
                    wrapperClassName="flex-grow !mb-0"
                    className="!mb-0"
                />
                <Button onClick={handleUseLogoUrl} variant="ghost" size="sm" leftIcon={<LinkIcon className="w-4 h-4"/>}>Use URL</Button>
            </div>
          </div>

          {currentEffectiveLogo && (
            <div className="mt-3">
              <p className="text-sm font-medium text-neutral-dark mb-1">Current Logo Preview:</p>
              <img src={currentEffectiveLogo} alt="Current Logo" className="max-h-20 max-w-full border border-neutral-light rounded p-1"/>
              <Button 
                onClick={() => onTemporaryLogoChange(null)} 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:bg-red-50 mt-2"
              >
                Clear Custom Logo (use default)
              </Button>
            </div>
          )}
          {!currentEffectiveLogo && <p className="text-xs text-neutral-DEFAULT mt-2">No logo selected. Will use default from Sender details if available, or no logo.</p>}
        </div>
      </SectionCard>

      <SectionCard title="Your Company (Sender)" initialOpen={false} isCollapsible={true}>
        <Input label="Company Name" id="senderName" value={invoice.sender.name} onChange={(e) => handleCompanyChange(e, 'sender', 'name')} />
        <Textarea label="Address" id="senderAddress" value={invoice.sender.address} onChange={(e) => handleCompanyChange(e, 'sender', 'address')} />
        <Input label="Email" id="senderEmail" type="email" value={invoice.sender.email || ''} onChange={(e) => handleCompanyChange(e, 'sender', 'email')} />
        <Input label="Phone" id="senderPhone" type="tel" value={invoice.sender.phone || ''} onChange={(e) => handleCompanyChange(e, 'sender', 'phone')} />
        <Input label="Default Logo URL (Optional)" id="senderLogoUrl" value={invoice.sender.logoUrl || ''} onChange={(e) => handleCompanyChange(e, 'sender', 'logoUrl')} placeholder="https://example.com/default-logo.png" />
      </SectionCard>

      <SectionCard title="Client Company (Recipient)" initialOpen={true} isCollapsible={true}>
        <div className="flex gap-2 items-end mb-4">
            <Select
                label="Select Existing Client"
                id="client-select"
                value={invoice.client_id || ''}
                onChange={(e) => onClientSelect(e.target.value)}
                options={[
                    { value: '', label: 'Enter details manually' },
                    ...clients.map(c => ({ value: c.id, label: c.name }))
                ]}
                wrapperClassName="flex-grow !mb-0"
            />
            <Link to="/clients?action=new" target="_blank" rel="noopener noreferrer">
                 <Button variant="ghost" size="md" className="!h-10">
                     New Client
                 </Button>
            </Link>
        </div>
        <div className="my-2 border-t"></div>
        <Input label="Company Name" id="recipientName" value={invoice.recipient.name} onChange={(e) => handleCompanyChange(e, 'recipient', 'name')} />
        <Textarea label="Address" id="recipientAddress" value={invoice.recipient.address} onChange={(e) => handleCompanyChange(e, 'recipient', 'address')} />
        <Input label="Email" id="recipientEmail" type="email" value={invoice.recipient.email || ''} onChange={(e) => handleCompanyChange(e, 'recipient', 'email')} />
        <Input label="Phone" id="recipientPhone" type="tel" value={invoice.recipient.phone || ''} onChange={(e) => handleCompanyChange(e, 'recipient', 'phone')} />
      </SectionCard>

      <SectionCard title="Invoice Items" initialOpen={true} isCollapsible={true}>
        {invoice.items.map((item, index) => (
          <InvoiceItemRow
            key={item.id}
            item={item}
            index={index}
            currency={invoice.currency || DEFAULT_CURRENCY}
            onItemChange={onItemChange}
            onRemoveItem={onRemoveItem}
          />
        ))}
        <div className="flex gap-2">
            <Button onClick={onAddItem} variant="ghost" leftIcon={<PlusIcon className="w-4 h-4" />}>Add Item</Button>
            <Button onClick={onOpenProductModal} variant="secondary" leftIcon={<CubeIcon className="w-4 h-4" />}>Add from Saved</Button>
        </div>
      </SectionCard>
      
      <SectionCard title="Attachments" isCollapsible={true} initialOpen={false}>
          <div className="space-y-3">
              <div>
                  <label htmlFor="attachments" className="block text-sm font-medium text-neutral-dark mb-1">Upload Files</label>
                   <input 
                    type="file" 
                    id="attachments" 
                    multiple
                    onChange={(e) => e.target.files && onFileUpload(e.target.files)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-lightest file:text-primary-dark hover:file:bg-primary-light/30"
                    disabled={isUploading}
                  />
                  <p className="text-xs text-neutral-DEFAULT mt-1">Attach contracts, timesheets, etc. Max 5MB per file.</p>
                  {isUploading && <p className="text-xs text-primary-DEFAULT mt-1 animate-pulse">Uploading...</p>}
                  {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
              </div>
              
              {invoice.attachments && invoice.attachments.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-neutral-dark mt-4">Attached Files:</h5>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    {invoice.attachments.map((file) => (
                      <li key={file.filePath} className="flex items-center justify-between">
                         <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary-DEFAULT hover:underline truncate" title={file.name}>
                           {file.name}
                         </a>
                         <Button variant="ghost" size="sm" className="!p-1 !text-red-500 hover:!bg-red-100" onClick={() => onFileDelete(file)}>
                            <TrashIcon className="w-4 h-4"/>
                         </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
      </SectionCard>
      
      <SectionCard title="Summary" initialOpen={false} isCollapsible={true}>
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium text-neutral-dark mb-1">Taxes</h4>
                {invoice.taxes.map(tax => (
                    <div key={tax.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md mb-2">
                        <span>{tax.name} ({tax.rate}%)</span>
                        <Button variant="ghost" size="sm" className="!p-1 text-red-500" onClick={() => handleRemoveTax(tax.id)}>
                            <TrashIcon className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                <div className="flex items-center gap-2">
                    <Select
                        label=""
                        id="tax-select"
                        value={selectedTaxId}
                        onChange={e => setSelectedTaxId(e.target.value)}
                        options={[
                            { value: '', label: 'Select a tax to add...' },
                            ...availableTaxes.map(t => ({ value: t.id, label: `${t.name} (${t.rate}%)` }))
                        ]}
                        wrapperClassName="flex-grow !mb-0"
                    />
                    <Button onClick={handleAddTax} variant="secondary" size="md" disabled={!selectedTaxId}>Add Tax</Button>
                </div>
            </div>
            <div>
                <h4 className="text-sm font-medium text-neutral-dark mb-1">Discount</h4>
                <div className="grid grid-cols-3 gap-2 items-end">
                    <Select 
                        label=""
                        id="discountType"
                        value={invoice.discount.type}
                        onChange={(e) => onDiscountChange(e.target.value as 'percentage' | 'fixed', invoice.discount.value)}
                        options={[
                            { value: 'percentage', label: 'Percentage (%)' },
                            { value: 'fixed', label: 'Fixed Amount' },
                        ]}
                        wrapperClassName="col-span-1 !mb-0"
                    />
                    <Input 
                        label="" 
                        id="discountValue" 
                        type="number" 
                        value={invoice.discount.value.toString()} 
                        onChange={(e) => onDiscountChange(invoice.discount.type, parseFloat(e.target.value) || 0)} 
                        placeholder="e.g. 5 or 50"
                        wrapperClassName="col-span-2 !mb-0"
                    />
                </div>
            </div>
        </div>
      </SectionCard>

      <SectionCard title="Notes & Terms" initialOpen={false} isCollapsible={true}>
        <Textarea label="Notes" id="notes" value={invoice.notes || ''} onChange={(e) => handleGenericChange(e, 'notes')} />
        <Textarea label="Terms & Conditions" id="terms" value={invoice.terms || ''} onChange={(e) => handleGenericChange(e, 'terms')} />
      </SectionCard>

      <SectionCard title="Custom Payment Link" initialOpen={false} isCollapsible={true}>
        <Input 
            label="Manual Payment Link (Optional)" 
            id="manualPaymentLink" 
            value={invoice.manualPaymentLink || ''} 
            onChange={(e) => handleGenericChange(e, 'manualPaymentLink')}
            placeholder="e.g., https://paypal.me/yourname or Stripe link"
            type="url"
        />
        <p className="text-xs text-neutral-DEFAULT mt-1">
            If you provide a link here, a "Pay Online" button will appear on the invoice.
        </p>
      </SectionCard>

      <SectionCard title="Payment Tools (UPI/QR)" isCollapsible={true} initialOpen={false}>
        <PaymentTools 
          invoiceTotal={invoiceTotal}
          invoiceId={invoice.id}
          defaultPayeeName={invoice.sender.name}
          invoiceCurrency={invoice.currency || DEFAULT_CURRENCY}
          upiId={invoice.upiId || ''}
          onUpiIdChange={(value) => onInvoiceChange('upiId', value)}
          onUpiDetailsGenerated={onUpiDetailsGenerated} 
        />
      </SectionCard>

    </div>
  );
};

export default InvoiceForm;