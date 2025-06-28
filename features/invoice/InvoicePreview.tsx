import React from 'react';
import { InvoiceData, InvoiceTemplateProps, PlanData } from '../../types.ts';
import { AVAILABLE_TEMPLATES } from '../../constants.ts';

interface InvoicePreviewProps {
  invoice: InvoiceData;
  upiLink?: string;
  qrCodeDataUrl?: string;
  temporaryLogoUrl?: string | null; 
  userPlan?: PlanData | null; // New prop for user plan
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, upiLink, qrCodeDataUrl, temporaryLogoUrl, userPlan }) => {
  const selectedTemplateInfo = AVAILABLE_TEMPLATES.find(t => t.id === invoice.selectedTemplateId);

  if (!selectedTemplateInfo) {
    return <div className="p-8 text-red-600 bg-red-100 border border-red-300 rounded-lg">Error: Selected template not found. Please choose a template.</div>;
  }

  const TemplateComponent = selectedTemplateInfo.component;

  // Determine the effective logo URL
  // If temporaryLogoUrl is a string (user uploaded/pasted new), use it.
  // If temporaryLogoUrl is null (user cleared custom logo), fall back to invoice.sender.logoUrl (default from settings).
  // If both are null/undefined, effectiveLogoUrl will be undefined.
  const effectiveLogoUrl = temporaryLogoUrl ?? invoice.sender.logoUrl;

  // Create a modified invoice object for the template, ensuring sender details are robust
  const invoiceForTemplate: InvoiceData = {
    ...invoice,
    sender: {
      ...invoice.sender, // invoice.sender is CompanyDetails, guaranteed to have name, address.
      logoUrl: effectiveLogoUrl, // effectiveLogoUrl is string | undefined, matching CompanyDetails.logoUrl
    },
  };
  
  const templateProps: InvoiceTemplateProps = {
    invoice: invoiceForTemplate,
    upiLink,
    qrCodeDataUrl,
    userPlan, // Pass userPlan to the template
  };

  return (
    <div id="invoice-preview-content" className="bg-white shadow-xl rounded-lg print:shadow-none print:rounded-none">
      {/* This outer div helps with consistent padding/margin for the preview area, distinct from template's own padding */}
      <div className="p-2 md:p-4 print:p-0"> 
          <TemplateComponent {...templateProps} />
      </div>
    </div>
  );
};

export default InvoicePreview;