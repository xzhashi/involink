

import React from 'react';
import { InvoiceData, InvoiceTemplateProps, PlanData, CustomizationState } from '../../types.ts';
import { AVAILABLE_TEMPLATES } from '../../constants.ts';

interface InvoicePreviewProps {
  invoice: InvoiceData;
  upiLink?: string;
  qrCodeDataUrl?: string;
  temporaryLogoUrl?: string | null; 
  userPlan?: PlanData | null; // New prop for user plan
  customization?: CustomizationState;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, upiLink, qrCodeDataUrl, temporaryLogoUrl, userPlan, customization }) => {
  const selectedTemplateInfo = AVAILABLE_TEMPLATES.find(t => t.id === invoice.selectedTemplateId);

  if (!selectedTemplateInfo) {
    return <div className="p-8 text-red-600 bg-red-100 border border-red-300 rounded-lg">Error: Selected template not found. Please choose a template.</div>;
  }

  const TemplateComponent = selectedTemplateInfo.component;

  const effectiveLogoUrl = temporaryLogoUrl ?? invoice.sender.logoUrl;

  const invoiceForTemplate: InvoiceData = {
    ...invoice,
    sender: {
      ...invoice.sender,
      logoUrl: effectiveLogoUrl,
    },
  };
  
  // For public views, userPlan will be null. We create a mock plan object
  // from the `has_branding` flag saved on the invoice itself.
  const effectivePlan = userPlan ?? (invoice.has_branding !== undefined 
    ? { has_branding: invoice.has_branding } as PlanData 
    : null);
  
  const templateProps: InvoiceTemplateProps = {
    invoice: invoiceForTemplate,
    upiLink,
    qrCodeDataUrl,
    userPlan: effectivePlan, // Pass effective plan to the template
    customization: customization,
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