import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import InvoiceForm from '../features/invoice/InvoiceForm.tsx';
import InvoicePreview from '../features/invoice/InvoicePreview.tsx';
import TemplateSwitcher from '../features/invoice/TemplateSwitcher.tsx';
import { InvoiceData, InvoiceItem, CompanyDetails, PlanData } from '../types.ts';
import { INITIAL_INVOICE_STATE, AVAILABLE_TEMPLATES, DEFAULT_CURRENCY } from '../constants.ts';
import Button from '../components/common/Button.tsx';
import { DownloadIcon } from '../components/icons/DownloadIcon.tsx';
import { ShareIcon } from '../components/icons/ShareIcon.tsx';
import { WhatsAppIcon } from '../components/icons/WhatsAppIcon.tsx';
import { calculateInvoiceTotal } from '../utils.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePlans } from '../contexts/PlanContext.tsx'; // Import usePlans
import { saveInvoiceToSupabase, fetchLatestInvoiceFromSupabase, fetchInvoiceByIdFromSupabase } from '../services/supabaseClient.ts';
import { XMarkIcon } from '../components/icons/XMarkIcon.tsx'; // For modal close
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import MobileActionsBar from '../components/MobileActionsBar.tsx'; // New: Mobile Actions
import { PaletteIcon } from '../components/icons/PaletteIcon.tsx'; // New: Palette Icon
import { SparklesIcon } from '../components/icons/SparklesIcon.tsx';

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
            <SparklesIcon className="w-12 h-12 mx-auto text-primary-DEFAULT mb-4" />
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
  const location = useLocation();
  const navigate = useNavigate();
  const { invoiceDbId } = useParams<{ invoiceDbId?: string }>();
  const initialTemplateIdFromState = location.state?.initialTemplateId as string | undefined;

  const [invoice, setInvoice] = useState<InvoiceData>(() => ({...INITIAL_INVOICE_STATE, id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`}));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'local_saved'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared' | 'error' | 'not_supported'>('idle');
  const [pageLoading, setPageLoading] = useState(true);
  const [isNewInvoice, setIsNewInvoice] = useState(true);
  const [generatedUpiLink, setGeneratedUpiLink] = useState<string | undefined>(undefined);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | undefined>(undefined);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWhatsAppOptionsModal, setShowWhatsAppOptionsModal] = useState(false);
  const [temporaryLogoUrl, setTemporaryLogoUrl] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);


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


    return fullBaseInvoice;
  }, [initialTemplateIdFromState, isNewInvoice]);

  useEffect(() => {
    if (authLoading) return; 

    // Plan limit check
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
            loadedInvoiceData = await fetchInvoiceByIdFromSupabase(invoiceDbId, user.id);
            if (!loadedInvoiceData && isMounted) {
                console.warn(`Invoice with db_id ${invoiceDbId} not found for user ${user.id} or general error. Redirecting to /create.`);
                navigate('/create', { replace: true });
                setPageLoading(false);
                return;
            }
            if (loadedInvoiceData) newInvoiceFlag = false;
          } else { 
            // Don't fetch latest for /create, always start new unless specific ID is given
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
              console.error("Corrupted 'currentInvoice' in localStorage, resetting. Error:", e);
              localStorage.removeItem('currentInvoice');
            }
          }
        }
        
        if (!isMounted) return;

        setIsNewInvoice(invoiceDbId ? newInvoiceFlag : true); // If invoiceDbId is present, newInvoiceFlag determines. Else, it's new.
        const baseState = {...INITIAL_INVOICE_STATE, id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`};
        const finalInvoiceState = sanitizeInvoiceData(loadedInvoiceData, baseState);
        
        if (user && !finalInvoiceState.user_id) {
          finalInvoiceState.user_id = user.id; 
        }

        setInvoice(finalInvoiceState);
        setGeneratedUpiLink(undefined);
        setQrCodeDataUrl(undefined);
        setTemporaryLogoUrl(null); // Reset temporary logo on load

      } catch (error) {
        console.error("Error during loadInvoice execution in CreateInvoicePage:", error);
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
  }, [user, authLoading, invoiceDbId, sanitizeInvoiceData, navigate, isLimitReached]);

  useEffect(() => {
    if (pageLoading || authLoading) return; 
    if (invoice.id === INITIAL_INVOICE_STATE.id && !invoice.db_id && invoiceDbId) {
        // Avoid saving initial state if we are loading an existing invoice but it hasn't loaded yet.
        return;
    }
    
    // Prevent auto-saving for new invoices if user is over their limit
    if (isLimitReached && !invoice.db_id) {
        setSaveStatus('error');
        return;
    }

    const autoSave = async () => {
      setSaveStatus('saving');
      try {
        if (user && invoice.user_id === user.id) { 
          const savedData = await saveInvoiceToSupabase(invoice);
          if (savedData) {
            if (savedData.db_id && savedData.db_id !== invoice.db_id) {
               setInvoice(prev => ({...prev, db_id: savedData.db_id}));
            }
            if (!invoiceDbId && savedData.db_id) { 
                navigate(`/invoice/${savedData.db_id}`, { replace: true });
            }
            setSaveStatus('saved');
          } else {
            setSaveStatus('error');  
          }
        } else if (!user) { 
          localStorage.setItem('currentInvoice', JSON.stringify(invoice));
          setSaveStatus('local_saved');
        } else {
          localStorage.setItem('currentInvoice', JSON.stringify(invoice));
          setSaveStatus('local_saved');
          console.warn("Invoice user_id mismatch or not set for logged-in user. Saved locally.");
        }
      } catch (e) {
        console.error("Error auto-saving invoice:", e);
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
    };
    
    if (JSON.stringify(invoice) !== JSON.stringify(INITIAL_INVOICE_STATE) || invoice.db_id) {
        const debounceTimer = setTimeout(autoSave, 1500);
        return () => clearTimeout(debounceTimer);
    }

  }, [invoice, user, pageLoading, authLoading, navigate, invoiceDbId, isLimitReached]); 
  
  const handleInvoiceChange = useCallback(<K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    setInvoice(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleTemplateSelect = useCallback((id: string) => {
    handleInvoiceChange('selectedTemplateId', id);
    setShowTemplateModal(false); // Close modal on selection
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

  const handleDownload = () => {
    window.print();
  };
  
  const invoiceTotal = useMemo(() => calculateInvoiceTotal(invoice), [invoice]);

  const getInvoiceSummaryForShare = () => {
    let summary = `Invoice #${invoice.id} from ${invoice.sender.name || 'My Business'} for ${invoice.currency || DEFAULT_CURRENCY} ${invoiceTotal.toFixed(2)}.`;
    summary += `\nView at: ${window.location.origin}${window.location.pathname}#${location.pathname.startsWith('/invoice/') ? location.pathname : `/invoice/${invoice.db_id || 'new'}`}`;
    if (generatedUpiLink) {
        summary += `\nPay via UPI: ${generatedUpiLink}`;
    }
    if(invoice.manualPaymentLink){
        summary += `\nOr pay online here: ${invoice.manualPaymentLink}`;
    }
    return summary;
  }

  const handleShareInvoiceLink = async () => {
    setShareStatus('idle');
    const shareData = {
      title: `Invoice #${invoice.id} from ${invoice.sender.name || 'My Business'}`,
      text: getInvoiceSummaryForShare(),
      url: `${window.location.origin}${window.location.pathname}#${location.pathname.startsWith('/invoice/') ? location.pathname : `/invoice/${invoice.db_id || 'new'}`}`, 
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareStatus('shared');
      } catch (err) {
        console.error('Error sharing:', err);
        setShareStatus('error');
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.text);
        setShareStatus('copied');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        setShareStatus('error');
      }
    } else {
      setShareStatus('not_supported');
    }
    setTimeout(() => setShareStatus('idle'), 3000); 
  };
  
  const handleShareOnWhatsApp = () => {
    const recipientPhone = invoice.recipient.phone;
    if (!recipientPhone || recipientPhone.trim() === '') {
      alert('Please enter the recipient\'s phone number in the invoice details to share on WhatsApp.');
      return;
    }
    setShowWhatsAppOptionsModal(true); 
  };

  const shareWhatsAppWithMessage = (messageType: 'link' | 'pdf_guide') => {
    const recipientPhone = invoice.recipient.phone;
    if (!recipientPhone || recipientPhone.trim() === '') {
      setShowWhatsAppOptionsModal(false);
      return;
    }

    let cleanedPhone = recipientPhone.replace(/[^\d+]/g, '');
    
    let message = getInvoiceSummaryForShare();

    if (messageType === 'pdf_guide') {
      message += `\n\nTo view/share the PDF: open the link above, use the 'Download/Print PDF' button to save it, then attach the PDF file in WhatsApp.`;
    }

    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsAppOptionsModal(false);
  };


  const handleCreateNew = () => {
    if (isLimitReached) {
        setShowLimitModal(true);
        return;
    }
    const newInvoiceState = sanitizeInvoiceData(null, {...INITIAL_INVOICE_STATE, id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`});
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

  const handleModalShareLink = () => {
    handleShareInvoiceLink();
    setShowShareModal(false);
  };

  const handleModalSharePdf = () => {
    handleDownload(); 
    setShowShareModal(false);
  };

  const handleTemporaryLogoChange = useCallback((logoDataUrl: string | null) => {
    setTemporaryLogoUrl(logoDataUrl);
  }, []);

  if (authLoading || pageLoading) {
    return <CreateInvoicePageSkeleton />;
  }

  const isSaveDisabled = isLimitReached && !invoice.db_id;

  return (
    <>
      {showLimitModal && <LimitReachedModal plan={currentUserPlan} onClose={() => setShowLimitModal(false)}/>}

      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 pb-16 lg:pb-0"> {/* Added pb for mobile nav */}
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
                onOpenTemplateModal={() => setShowTemplateModal(true)} // Pass handler to open modal
              />
              {/* Desktop Actions Panel - Hidden on small screens */}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      <Button 
                        onClick={handleDownload} 
                        variant="secondary" 
                        size="md" 
                        className="w-full" 
                        leftIcon={<DownloadIcon className="w-5 h-5"/>}
                        title="Open browser print dialog to print or save as PDF"
                      >
                        Download / Print PDF
                      </Button>
                      <Button 
                        onClick={() => setShowShareModal(true)} 
                        variant="primary" 
                        size="md" 
                        className="w-full" 
                        leftIcon={<ShareIcon className="w-5 h-5"/>}
                        title="Share invoice"
                      >
                        Share Invoice
                      </Button>
                  </div>
                   <Button 
                      onClick={handleShareOnWhatsApp}
                      variant="primary" 
                      size="md"
                      className="w-full !bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 !focus:ring-green-500 mb-2"
                      leftIcon={<WhatsAppIcon className="w-5 h-5" />}
                      title="Share invoice via WhatsApp"
                    >
                      Share on WhatsApp
                    </Button>
                   { shareStatus === 'not_supported' && <p className="text-xs text-neutral-DEFAULT mt-1 text-center">Native sharing not supported. Try copying link.</p>}
                   { shareStatus === 'error' && <p className="text-xs text-red-500 mt-1 text-center">Could not share or copy. Please try again.</p>}
                   { shareStatus === 'copied' && <p className="text-xs text-green-600 mt-1 text-center">Invoice link copied to clipboard!</p>}
                   { shareStatus === 'shared' && <p className="text-xs text-green-600 mt-1 text-center">Invoice shared successfully!</p>}
                   <Button 
                      onClick={handleCreateNew} 
                      variant="ghost" 
                      size="md" 
                      className="w-full mt-2 border-primary-light text-primary-dark hover:bg-primary-lightest"
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
                  userPlan={currentUserPlan} // Pass full plan object
               />
          </div>
        </div>
      </div>

      {/* Mobile Actions Bar */}
      <MobileActionsBar
        onDownload={handleDownload}
        onShare={() => setShowShareModal(true)}
        onWhatsApp={handleShareOnWhatsApp}
        onCreateNew={handleCreateNew}
      />

      {/* Template Chooser Modal */}
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
                isInitialChoice={true} // Style as initial choice for better modal presentation
              />
            </div>
             <div className="p-4 border-t text-right">
                <Button variant="ghost" onClick={() => setShowTemplateModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}


      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] no-print backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 id="share-modal-title" className="text-xl font-semibold text-neutral-darkest">Share Invoice</h3>
              <button 
                onClick={() => setShowShareModal(false)} 
                className="text-neutral-500 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-light"
                aria-label="Close share modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              <Button onClick={handleModalShareLink} variant="primary" className="w-full">
                Share Link
              </Button>
              <Button onClick={handleModalSharePdf} variant="secondary" className="w-full">
                Share as PDF (Print & Save)
              </Button>
            </div>
            <p className="text-xs text-neutral-DEFAULT mt-4 text-center">
              For PDF sharing, use your browser's print options to 'Save as PDF', then share the saved file.
            </p>
          </div>
        </div>
      )}

      {showWhatsAppOptionsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] no-print backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="whatsapp-options-title">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 id="whatsapp-options-title" className="text-lg font-semibold text-neutral-darkest">Share via WhatsApp</h3>
              <button
                onClick={() => setShowWhatsAppOptionsModal(false)}
                className="text-neutral-500 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-light"
                aria-label="Close WhatsApp options modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-neutral-DEFAULT mb-4">How would you like to share this invoice?</p>
            <div className="space-y-3">
              <Button onClick={() => shareWhatsAppWithMessage('link')} variant="primary" className="w-full">
                Share Link
              </Button>
              <Button onClick={() => shareWhatsAppWithMessage('pdf_guide')} variant="secondary" className="w-full">
                Share PDF (Guide)
              </Button>
            </div>
            <p className="text-xs text-neutral-DEFAULT mt-3 text-center">
              PDF guide will provide instructions to download and attach the PDF.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateInvoicePage;