import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import InvoiceForm from '../features/invoice/InvoiceForm.tsx';
import InvoicePreview from '../features/invoice/InvoicePreview.tsx';
import TemplateSwitcher from '../features/invoice/TemplateSwitcher.tsx';
import { InvoiceData, InvoiceItem, CompanyDetails, PlanData, CustomizationState, Attachment } from '../types.ts';
import { INITIAL_INVOICE_STATE, AVAILABLE_TEMPLATES, DEFAULT_CURRENCY, INITIAL_CUSTOMIZATION_STATE } from '../constants.ts';
import Button from '../components/common/Button.tsx';
import { DownloadIcon } from '../components/icons/DownloadIcon.tsx';
import { WhatsAppIcon } from '../components/icons/WhatsAppIcon.tsx';
import { calculateInvoiceTotal } from '../utils.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePlans } from '../contexts/PlanContext.tsx'; 
import { useLocalization } from '../contexts/LocalizationContext.tsx';
import { saveInvoiceToSupabase, fetchInvoiceByIdFromSupabase, uploadAttachment, deleteAttachment } from '../services/supabaseClient.ts';
import { XMarkIcon } from '../components/icons/XMarkIcon.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import MobileActionsBar from '../components/MobileActionsBar.tsx';
import CustomizationPanel from '../features/invoice/CustomizationPanel.tsx';
import { SparklesIcon } from '../components/icons/SparklesIcon.tsx';
import { CopyIcon } from '../components/icons/CopyIcon.tsx';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon.tsx';

const CreateInvoicePageSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 animate-pulse">
            {/* Left side: Form Skeleton */}
            <div className="lg:w-2/5 xl:w-1/3 space-y-6">
                <div className="h-14 bg-slate-200 rounded-lg"></div>
                {/* Section Card Skeleton */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-10 bg-slate-200 rounded w-full"></div>
                    <div className="flex gap-4">
                        <div className="h-10 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-10 bg-slate-200 rounded w-1/2"></div>
                    </div>
                </div>
                {/* Another Section Card Skeleton */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-10 bg-slate-200 rounded w-full"></div>
                    <div className="h-20 bg-slate-200 rounded w-full"></div>
                </div>
                 {/* Items Section Card Skeleton */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-16 bg-slate-200 rounded w-full"></div>
                    <div className="h-16 bg-slate-200 rounded w-full"></div>
                </div>
            </div>

            {/* Right side: Preview Skeleton */}
            <div className="lg:w-3/5 xl:w-2/3">
                <div className="bg-white shadow-xl rounded-lg h-[80vh]">
                    <div className="p-4 md:p-8 space-y-6">
                        <div className="flex justify-between">
                            <div className="space-y-2 w-1/2">
                                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-12 bg-slate-200 rounded w-1/4"></div>
                        </div>
                        <div className="h-4 bg-slate-200 rounded w-full mt-10"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        <div className="h-40 bg-slate-200 rounded w-full mt-10"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const LimitReachedModal: React.FC<{ plan: PlanData | null, onClose: () => void }> = ({ plan, onClose }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[80] no-print backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="limit-modal-title">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md text-center p-8">
            <SparklesIcon className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 id="limit-modal-title" className="text-2xl font-bold text-neutral-darkest mb-3">Free Plan Limit Reached</h3>
            <p className="text-neutral-DEFAULT mb-6">
                You've created the maximum of {plan?.invoice_limit || 3} invoices for this month. Please upgrade to create unlimited invoices and unlock all premium features.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button variant="ghost" onClick={onClose}>Maybe Later</Button>
                <Link to="/pricing">
                  <Button variant="primary" className="w-full">View Plans & Upgrade</Button>
                </Link>
            </div>
        </div>
    </div>
);


const CreateInvoicePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isLimitReached, currentUserPlan } = usePlans();
  const { currency: userCurrency, loading: currencyLoading } = useLocalization();
  const location = useLocation();
  const navigate = useNavigate();
  const { invoiceDbId } = useParams<{ invoiceDbId?: string }>();
  const initialTemplateIdFromState = location.state?.initialTemplateId as string | undefined;

  const getNewInvoiceState = useCallback(() => {
    const baseState = {...INITIAL_INVOICE_STATE, id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`};
    
    // Override with user's saved preferences first
    if (user?.user_metadata) {
      if (user.user_metadata.company_details) {
        // Merge, so any missing details in saved profile don't break it
        baseState.sender = { ...baseState.sender, ...user.user_metadata.company_details };
      }
      // Set currency based on priority: user preference > location > default
      if (user.user_metadata.default_currency) {
        baseState.currency = user.user_metadata.default_currency;
      } else if (userCurrency && !currencyLoading) {
        baseState.currency = userCurrency;
      }
    } else if (userCurrency && !currencyLoading) { // Fallback for users without metadata object
      baseState.currency = userCurrency;
    }

    return baseState;
  }, [user, userCurrency, currencyLoading]);

  const [invoice, setInvoice] = useState<InvoiceData>(getNewInvoiceState());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'local_saved'>('idle');
  const [actionStatus, setActionStatus] = useState<'idle' | 'processing' | 'copied' | 'error'>('idle');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  const [pageLoading, setPageLoading] = useState(true);
  const [isNewInvoice, setIsNewInvoice] = useState(true);
  const [generatedUpiLink, setGeneratedUpiLink] = useState<string | undefined>(undefined);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | undefined>(undefined);
  const [showWhatsAppOptionsModal, setShowWhatsAppOptionsModal] = useState(false);
  const [temporaryLogoUrl, setTemporaryLogoUrl] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const beforePrintHandler = () => document.body.classList.add('printing');
    const afterPrintHandler = () => document.body.classList.remove('printing');

    window.addEventListener('beforeprint', beforePrintHandler);
    window.addEventListener('afterprint', afterPrintHandler);

    return () => {
        window.removeEventListener('beforeprint', beforePrintHandler);
        window.removeEventListener('afterprint', afterPrintHandler);
        document.body.classList.remove('printing'); 
    };
  }, []);

  const sanitizeInvoiceData = useCallback((data: Partial<InvoiceData> | null, baseState: InvoiceData): InvoiceData => {
    let fullBaseInvoice: InvoiceData = data ? { ...baseState, ...data } : { ...baseState };

    const defaultSelectedTemplateId = AVAILABLE_TEMPLATES.find(t => t.id === INITIAL_INVOICE_STATE.selectedTemplateId)
                                      ? INITIAL_INVOICE_STATE.selectedTemplateId
                                      : (AVAILABLE_TEMPLATES.length > 0 ? AVAILABLE_TEMPLATES[0].id : 'modern');
    
    let finalTemplateId = fullBaseInvoice.selectedTemplateId || defaultSelectedTemplateId;
    if (!AVAILABLE_TEMPLATES.find(t => t.id === finalTemplateId)) {
        finalTemplateId = defaultSelectedTemplateId; 
    }
    if (initialTemplateIdFromState && AVAILABLE_TEMPLATES.find(t => t.id === initialTemplateIdFromState) && isNewInvoice) {
      finalTemplateId = initialTemplateIdFromState;
    }
    fullBaseInvoice.selectedTemplateId = finalTemplateId;
    
    fullBaseInvoice.items = (Array.isArray(fullBaseInvoice.items) && fullBaseInvoice.items.length > 0)
        ? fullBaseInvoice.items.map((item: any) => ({
            id: typeof item.id === 'string' ? item.id : crypto.randomUUID(),
            description: typeof item.description === 'string' ? item.description : '',
            quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0,
            unitPrice: typeof item.unitPrice === 'number' && !isNaN(item.unitPrice) ? item.unitPrice : 0,
        }))
        : [{ id: crypto.randomUUID(), description: 'Sample Item or Service', quantity: 1, unitPrice: 100 }];

    fullBaseInvoice.discount = (fullBaseInvoice.discount && typeof fullBaseInvoice.discount.value === 'number' && !isNaN(fullBaseInvoice.discount.value) && (fullBaseInvoice.discount.type === 'percentage' || fullBaseInvoice.discount.type === 'fixed'))
        ? fullBaseInvoice.discount
        : { type: 'percentage', value: 0 };
    
    fullBaseInvoice.currency = (typeof fullBaseInvoice.currency === 'string' && fullBaseInvoice.currency.length === 3) ? fullBaseInvoice.currency : DEFAULT_CURRENCY;
    
    const sanitizeCompanyDetails = (details: any, defaultDetails: CompanyDetails): CompanyDetails => {
        if (typeof details === 'object' && details !== null) {
            return {
                name: typeof details.name === 'string' ? details.name : defaultDetails.name,
                address: typeof details.address === 'string' ? details.address : defaultDetails.address,
                phone: typeof details.phone === 'string' ? details.phone : defaultDetails.phone,
                email: typeof details.email === 'string' ? details.email : defaultDetails.email,
                logoUrl: typeof details.logoUrl === 'string' ? details.logoUrl : defaultDetails.logoUrl,
            };
        }
        return { ...defaultDetails };
    };
    fullBaseInvoice.sender = sanitizeCompanyDetails(fullBaseInvoice.sender, INITIAL_INVOICE_STATE.sender);
    fullBaseInvoice.recipient = sanitizeCompanyDetails(fullBaseInvoice.recipient, INITIAL_INVOICE_STATE.recipient);
    
    fullBaseInvoice.id = typeof fullBaseInvoice.id === 'string' && fullBaseInvoice.id.startsWith("INV-") ? fullBaseInvoice.id : `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    fullBaseInvoice.date = typeof fullBaseInvoice.date === 'string' ? fullBaseInvoice.date : baseState.date;
    fullBaseInvoice.dueDate = typeof fullBaseInvoice.dueDate === 'string' ? fullBaseInvoice.dueDate : baseState.dueDate;
    fullBaseInvoice.taxRate = typeof fullBaseInvoice.taxRate === 'number' && !isNaN(fullBaseInvoice.taxRate) ? fullBaseInvoice.taxRate : 0;
    fullBaseInvoice.notes = typeof fullBaseInvoice.notes === 'string' ? fullBaseInvoice.notes : '';
    fullBaseInvoice.terms = typeof fullBaseInvoice.terms === 'string' ? fullBaseInvoice.terms : '';
    fullBaseInvoice.manualPaymentLink = typeof fullBaseInvoice.manualPaymentLink === 'string' ? fullBaseInvoice.manualPaymentLink : '';
    fullBaseInvoice.has_branding = typeof fullBaseInvoice.has_branding === 'boolean' ? fullBaseInvoice.has_branding : true;
    fullBaseInvoice.is_public = typeof fullBaseInvoice.is_public === 'boolean' ? fullBaseInvoice.is_public : false;
    fullBaseInvoice.upiId = typeof fullBaseInvoice.upiId === 'string' ? fullBaseInvoice.upiId : '';
    fullBaseInvoice.customization = { ...INITIAL_CUSTOMIZATION_STATE, ...(fullBaseInvoice.customization || {}) };
    fullBaseInvoice.attachments = Array.isArray(fullBaseInvoice.attachments) ? fullBaseInvoice.attachments : [];


    return fullBaseInvoice;
  }, [initialTemplateIdFromState, isNewInvoice]);

  useEffect(() => {
    if (authLoading) return; 

    if (isLimitReached && !invoiceDbId && !pageLoading) {
      setShowLimitModal(true);
    }

    let isMounted = true;
    setPageLoading(true);

    const loadInvoice = async () => {
      try {
        let loadedInvoiceData: InvoiceData | null = null;
        let newInvoiceFlag = true;

        if (user) { 
          if (invoiceDbId) { 
            loadedInvoiceData = await fetchInvoiceByIdFromSupabase(invoiceDbId);
            if (!loadedInvoiceData && isMounted) {
                navigate('/create', { replace: true });
                setPageLoading(false);
                return;
            }
            if (loadedInvoiceData) newInvoiceFlag = false;
          }
        } else { 
          const savedInvoiceRaw = localStorage.getItem('currentInvoice');
          if (savedInvoiceRaw) {
            try {
              const parsed = JSON.parse(savedInvoiceRaw);
              if (typeof parsed === 'object' && parsed !== null) {
                loadedInvoiceData = parsed;
                newInvoiceFlag = false; 
              }
            } catch (e) {
              localStorage.removeItem('currentInvoice');
            }
          }
        }
        
        if (!isMounted) return;

        setIsNewInvoice(invoiceDbId ? newInvoiceFlag : true);
        const baseState = getNewInvoiceState();
        const finalInvoiceState = sanitizeInvoiceData(loadedInvoiceData, baseState);
        
        if (user && !finalInvoiceState.user_id) {
          finalInvoiceState.user_id = user.id; 
        }

        setInvoice(finalInvoiceState);
        setGeneratedUpiLink(undefined);
        setQrCodeDataUrl(undefined);
        setTemporaryLogoUrl(null);

      } catch (error) {
        // Error handling can be done here if needed
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    loadInvoice();

    return () => {
        isMounted = false;
    };
  }, [user, authLoading, invoiceDbId, sanitizeInvoiceData, navigate, isLimitReached, getNewInvoiceState]);
  
  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const invoiceWithBranding = {
        ...invoice,
        has_branding: currentUserPlan?.has_branding ?? true,
      };

      if (user && invoiceWithBranding.user_id === user.id) {
        const savedData = await saveInvoiceToSupabase(invoiceWithBranding);
        if (savedData) {
          if (savedData.db_id && savedData.db_id !== invoice.db_id) {
            setInvoice(prev => ({ ...prev, db_id: savedData.db_id, is_public: savedData.is_public }));
          }
          if (!invoiceDbId && savedData.db_id) {
            navigate(`/invoice/${savedData.db_id}`, { replace: true });
          }
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
        }
      } else {
        localStorage.setItem('currentInvoice', JSON.stringify(invoiceWithBranding));
        setSaveStatus('local_saved');
      }
    } catch (e) {
      setSaveStatus('error');
    } finally {
      const resetSaveStatusTimer = setTimeout(() => {
        setSaveStatus(currentStatus => {
          if (currentStatus === 'saved' || currentStatus === 'local_saved' || currentStatus === 'error') {
            return 'idle';
          }
          return currentStatus;
        });
      }, 3000);

      return () => clearTimeout(resetSaveStatusTimer);
    }
  }, [invoice, user, currentUserPlan, invoiceDbId, navigate]);

  useEffect(() => {
    if (pageLoading || authLoading) return;
    if (invoice.id === INITIAL_INVOICE_STATE.id && !invoice.db_id && invoiceDbId) {
        return;
    }
    
    if (isLimitReached && !invoice.db_id) {
        setSaveStatus('error');
        return;
    }
    
    if (JSON.stringify(invoice) !== JSON.stringify(INITIAL_INVOICE_STATE) || invoice.db_id) {
        const debounceTimer = setTimeout(handleSave, 1500);
        return () => clearTimeout(debounceTimer);
    }

  }, [invoice, pageLoading, authLoading, invoiceDbId, isLimitReached, handleSave]); 
  
  const handleManualSave = () => {
    handleSave();
  };

  const handleInvoiceChange = useCallback(<K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    setInvoice(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleTemplateSelect = useCallback((id: string) => {
    handleInvoiceChange('selectedTemplateId', id);
    setShowTemplateModal(false);
  }, [handleInvoiceChange]); 

  const handleCompanyDetailsChange = useCallback((party: 'sender' | 'recipient', key: string, value: string) => {
    setInvoice(prev => ({
      ...prev,
      [party]: {
        ...prev[party],
        [key]: value,
      }
    }));
  }, []);

  const handleItemChange = useCallback((itemId: string, key: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [key]: key === 'quantity' || key === 'unitPrice' ? Number(value) : value } : item
      ),
    }));
  }, []);

  const addItem = useCallback(() => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }],
    }));
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  }, []);
  
  const handleDiscountChange = useCallback((type?: 'percentage' | 'fixed', value?: number) => {
    if (type === undefined || value === undefined || isNaN(value) || value < 0) {
       setInvoice(prev => ({ ...prev, discount: { type: 'percentage', value: 0 } }));
    } else {
       setInvoice(prev => ({ ...prev, discount: { type, value } }));
    }
  }, []);

  const handleCustomizationChange = useCallback((newCustomization: Partial<CustomizationState>) => {
    setInvoice(prev => ({
      ...prev,
      customization: {
        ...(prev.customization || INITIAL_CUSTOMIZATION_STATE),
        ...newCustomization,
      },
    }));
  }, []);

  const handleDownload = () => {
    window.print();
  };
  
  const invoiceTotal = useMemo(() => calculateInvoiceTotal(invoice), [invoice]);

  const resetActionStatus = useCallback(() => {
    setTimeout(() => {
      setActionStatus('idle');
      setActionErrorMsg('');
    }, 3000);
  }, []);

  const prepareShareableLink = async (): Promise<string | null> => {
    setActionStatus('processing');
    setActionErrorMsg('');

    if (!user) {
      setActionStatus('error');
      setActionErrorMsg('Please log in to share or send invoices.');
      resetActionStatus();
      return null;
    }

    if (!invoice.db_id) {
      setActionStatus('error');
      setActionErrorMsg('Please wait for the invoice to be saved first.');
      resetActionStatus();
      return null;
    }
    
    let publicInvoice = { ...invoice };
    if (!publicInvoice.is_public) {
      try {
        const updatedInvoiceData = await saveInvoiceToSupabase({ ...publicInvoice, is_public: true });
        if (!updatedInvoiceData) throw new Error("Failed to make invoice public.");
        publicInvoice = updatedInvoiceData;
        setInvoice(publicInvoice); // Update local state with the now-public invoice
      } catch (error) {
        setActionStatus('error');
        setActionErrorMsg('Could not prepare a public link.');
        resetActionStatus();
        return null;
      }
    }
    
    return `${window.location.origin}/#/view/invoice/${publicInvoice.db_id}`;
  };

  const handleCopyLink = async () => {
    const url = await prepareShareableLink();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setActionStatus('copied');
    } catch (err) {
      setActionStatus('error');
      setActionErrorMsg('Failed to copy link.');
    } finally {
      setShowShareModal(false);
      resetActionStatus();
    }
  };

  const handleSendByEmail = async () => {
    const url = await prepareShareableLink();
    if (!url) return;

    setActionStatus('idle'); 
    setShowShareModal(false);
    
    const subject = `Invoice ${invoice.id} from ${invoice.sender.name}`;
    const body = `Hello ${invoice.recipient.name || ''},\n\nPlease find your invoice online at the link below:\n${url}\n\nTotal Amount Due: ${invoice.currency} ${invoiceTotal.toFixed(2)}\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\nThank you!\n\nBest regards,\n${invoice.sender.name}`;
    const mailtoLink = `mailto:${invoice.recipient.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
  };

  const getInvoiceSummaryForShare = (shareUrl: string) => {
    let summary = `Invoice #${invoice.id} from ${invoice.sender.name || 'My Business'} for ${invoice.currency || DEFAULT_CURRENCY} ${invoiceTotal.toFixed(2)}.`;
    summary += `\nView at: ${shareUrl}`;
    if (generatedUpiLink) {
        summary += `\nPay via UPI: ${generatedUpiLink}`;
    }
    if(invoice.manualPaymentLink){
        summary += `\nOr pay online here: ${invoice.manualPaymentLink}`;
    }
    return summary;
  }
  
  const handleShareOnWhatsApp = async () => {
    const shareUrl = await prepareShareableLink();
     if (!shareUrl) return;

    setActionStatus('idle');
    const recipientPhone = invoice.recipient.phone;
    if (!recipientPhone || recipientPhone.trim() === '') {
      setShowWhatsAppOptionsModal(true); 
      return;
    }
    setShowWhatsAppOptionsModal(true); 
  };

  const shareWhatsAppWithMessage = (messageType: 'link' | 'pdf_guide') => {
    const shareUrl = `${window.location.origin}/#/view/invoice/${invoice.db_id}`;
    if (!shareUrl) return;

    const recipientPhone = invoice.recipient.phone?.replace(/[^\d+]/g, '') || '';
    
    let message = getInvoiceSummaryForShare(shareUrl);

    if (messageType === 'pdf_guide') {
      message += `\n\nTo view/share the PDF: open the link above, use the 'Download/Print PDF' button to save it, then attach the PDF file in WhatsApp.`;
    }

    const whatsappUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsAppOptionsModal(false);
  };


  const handleCreateNew = () => {
    if (isLimitReached) {
        setShowLimitModal(true);
        return;
    }
    const newInvoiceState = sanitizeInvoiceData(null, getNewInvoiceState());
    if(user) newInvoiceState.user_id = user.id;
    setInvoice(newInvoiceState);
    setIsNewInvoice(true);
    setGeneratedUpiLink(undefined);
    setQrCodeDataUrl(undefined);
    setTemporaryLogoUrl(null); 
    navigate('/create', { replace: true }); 
  };
  
  const handleUpiDetailsGenerated = useCallback((link: string, qrData: string) => {
    setGeneratedUpiLink(link);
    setQrCodeDataUrl(qrData);
  }, []);

  const handleTemporaryLogoChange = useCallback((logoDataUrl: string | null) => {
    setTemporaryLogoUrl(logoDataUrl);
  }, []);
  
  const handleFileUpload = async (files: FileList) => {
    if (!user || !invoice.db_id) {
        setUploadError("Please save the invoice before adding attachments.");
        return;
    }
    setIsUploading(true);
    setUploadError(null);

    const uploadPromises = Array.from(files).map(file => uploadAttachment(file, user.id, invoice.db_id!));
    
    try {
        const newAttachments = await Promise.all(uploadPromises);
        setInvoice(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), ...newAttachments],
        }));
    } catch (error: any) {
        setUploadError(error.message || "Failed to upload one or more files.");
    } finally {
        setIsUploading(false);
    }
  };

  const handleFileDelete = async (attachmentToDelete: Attachment) => {
      if (!user) return;
      
      setInvoice(prev => ({
          ...prev,
          attachments: prev.attachments?.filter(att => att.filePath !== attachmentToDelete.filePath),
      }));

      const { success, error } = await deleteAttachment(attachmentToDelete.filePath);
      
      if (!success) {
          setUploadError(error.message || "Failed to delete file from storage.");
          setInvoice(prev => ({
              ...prev,
              attachments: [...(prev.attachments || []), attachmentToDelete],
          }));
      }
  };


  if (authLoading || pageLoading) {
    return <CreateInvoicePageSkeleton />;
  }

  const isSaveDisabled = isLimitReached && !invoice.db_id;
  const isActionProcessing = actionStatus === 'processing';

  return (
    <>
      {showLimitModal && <LimitReachedModal plan={currentUserPlan} onClose={() => setShowLimitModal(false)}/>}

      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 pb-20 lg:pb-0">
        <div className="lg:w-2/5 xl:w-1/3 no-print lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto thin-scrollbar p-1">
          <div className="space-y-6">
              {isSaveDisabled && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Plan Limit Reached</p>
                    <p className="text-sm">Please upgrade your plan to save new invoices. Changes will not be saved.</p>
                </div>
              )}
              <InvoiceForm
                invoice={invoice}
                invoiceTotal={invoiceTotal}
                onInvoiceChange={handleInvoiceChange}
                onCompanyDetailsChange={handleCompanyDetailsChange}
                onItemChange={handleItemChange}
                onAddItem={addItem}
                onRemoveItem={removeItem}
                onDiscountChange={handleDiscountChange}
                onUpiDetailsGenerated={handleUpiDetailsGenerated}
                temporaryLogoUrl={temporaryLogoUrl}
                onTemporaryLogoChange={handleTemporaryLogoChange}
                onOpenTemplateModal={() => setShowTemplateModal(true)}
                onOpenCustomizationModal={() => setShowCustomizationPanel(true)}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
                isUploading={isUploading}
                uploadError={uploadError}
              />
              <div className="bg-white p-4 rounded-lg shadow-md sticky bottom-0 hidden lg:block">
                  <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-neutral-darkest">Actions</h3>
                      <div className="text-sm">
                          {saveStatus === 'saving' && <span className="text-neutral-DEFAULT italic">Saving...</span>}
                          {saveStatus === 'saved' && <span className="text-green-600 italic">Saved!</span>}
                          {saveStatus === 'local_saved' && <span className="text-blue-600 italic">Saved locally.</span>}
                          {saveStatus === 'error' && <span className="text-red-500 italic">{isSaveDisabled ? "Limit Reached" : "Save error!"}</span>}
                          {saveStatus === 'idle' && !invoiceDbId && JSON.stringify(invoice) === JSON.stringify(INITIAL_INVOICE_STATE) &&  <span className="text-neutral-DEFAULT italic">Unsaved</span>}
                          {saveStatus === 'idle' && (invoiceDbId || JSON.stringify(invoice) !== JSON.stringify(INITIAL_INVOICE_STATE)) && <span className="text-neutral-DEFAULT italic">Auto-saves</span>}
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                      <Button onClick={handleDownload} variant="secondary" leftIcon={<DownloadIcon className="w-5 h-5"/>} title="Open browser print dialog to print or save as PDF">
                        Print / PDF
                      </Button>
                      <Button onClick={handleCopyLink} variant="secondary" leftIcon={<CopyIcon className="w-5 h-5"/>} disabled={isActionProcessing} title="Copy public link to clipboard">
                        {isActionProcessing ? '...' : actionStatus === 'copied' ? 'Copied!' : 'Copy Link'}
                      </Button>
                  </div>
                   <div className="grid grid-cols-1 gap-2">
                        <Button onClick={handleSendByEmail} variant="primary" disabled={isActionProcessing} leftIcon={<EnvelopeIcon className="w-5 h-5"/>} title="Send invoice link via email">
                            {isActionProcessing ? 'Preparing...' : 'Send by Email'}
                        </Button>
                        <Button onClick={handleShareOnWhatsApp} variant="primary" className="!bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 !focus:ring-green-500" leftIcon={<WhatsAppIcon className="w-5 h-5" />} disabled={isActionProcessing} title="Share invoice via WhatsApp">
                            {isActionProcessing ? 'Preparing...' : 'Share on WhatsApp'}
                        </Button>
                   </div>
                   
                   {actionStatus === 'error' && <p className="text-xs text-red-500 mt-2 text-center">{actionErrorMsg}</p>}

                   <Button 
                      onClick={handleCreateNew} 
                      variant="ghost" 
                      size="md" 
                      className="w-full mt-3 border border-primary text-primary-dark hover:bg-secondary"
                      title={isLimitReached ? "Plan limit reached" : "Create a new blank invoice"}
                      disabled={isLimitReached}
                    >
                      {isLimitReached ? "Plan Limit Reached" : "Create New Invoice"}
                    </Button>
              </div>
          </div>
        </div>
        <div className="lg:w-3/5 xl:w-2/3">
          <div className="lg:sticky lg:top-6 lg:self-start">
               <InvoicePreview 
                  invoice={invoice} 
                  upiLink={generatedUpiLink}
                  qrCodeDataUrl={qrCodeDataUrl}
                  temporaryLogoUrl={temporaryLogoUrl}
                  userPlan={currentUserPlan}
                  customization={invoice.customization}
               />
          </div>
        </div>
      </div>

      <MobileActionsBar
        onDownload={handleDownload}
        onSave={handleManualSave}
        onShare={() => setShowShareModal(true)}
        onWhatsApp={handleShareOnWhatsApp}
        onCreateNew={handleCreateNew}
        actionStatus={actionStatus}
        saveStatus={saveStatus}
      />

      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end no-print" onClick={() => setShowShareModal(false)}>
            <div className="bg-white w-full rounded-t-2xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="w-10 h-1 bg-neutral-light rounded-full mx-auto mb-3"></div>
                <h3 className="text-lg font-semibold text-center mb-4 text-neutral-darkest">Share Invoice</h3>
                <div className="space-y-3">
                    <Button 
                        onClick={handleCopyLink} 
                        variant="secondary" 
                        className="w-full !justify-start !py-3" 
                        leftIcon={<CopyIcon className="w-5 h-5 text-neutral-600" />}
                        disabled={isActionProcessing}
                    >
                      {actionStatus === 'copied' ? 'Link Copied!' : 'Copy Public Link'}
                    </Button>
                    <Button 
                        onClick={handleSendByEmail} 
                        variant="secondary" 
                        className="w-full !justify-start !py-3" 
                        leftIcon={<EnvelopeIcon className="w-5 h-5 text-neutral-600" />}
                        disabled={isActionProcessing}
                    >
                        Send via Email
                    </Button>
                </div>
                <Button variant="ghost" className="w-full mt-4 !py-3" onClick={() => setShowShareModal(false)} disabled={isActionProcessing}>
                    Cancel
                </Button>
            </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 no-print backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="template-modal-title">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 id="template-modal-title" className="text-2xl font-semibold text-neutral-darkest">Choose a Design</h3>
              <button 
                onClick={() => setShowTemplateModal(false)} 
                className="text-neutral-500 hover:text-neutral-700 p-2 rounded-full hover:bg-neutral-lightest transition-colors"
                aria-label="Close template chooser"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 thin-scrollbar">
              <TemplateSwitcher
                templates={AVAILABLE_TEMPLATES}
                selectedTemplateId={invoice.selectedTemplateId}
                onSelectTemplate={handleTemplateSelect}
                isInitialChoice={true}
              />
            </div>
             <div className="p-4 border-t text-right">
                <Button variant="ghost" onClick={() => setShowTemplateModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {showCustomizationPanel && invoice.selectedTemplateId === 'custom' && (
          <CustomizationPanel
              customization={invoice.customization || INITIAL_CUSTOMIZATION_STATE}
              onCustomizationChange={handleCustomizationChange}
              onClose={() => setShowCustomizationPanel(false)}
          />
      )}
    </>
  );
};

export default CreateInvoicePage;