

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePlans } from '../contexts/PlanContext.tsx';
import { fetchUserDocuments, deleteInvoiceFromSupabase, updateInvoiceStatus, makeInvoicePublic, fetchUserClients } from '../services/supabaseClient.ts';
import { InvoiceData, InvoiceStatus, Client } from '../types.ts';
import Button from '../components/common/Button.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx'; 
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { XMarkIcon } from '../components/icons/XMarkIcon.tsx';
import { DEFAULT_CURRENCY } from '../constants.ts';
import StatusBadge from '../components/common/StatusBadge.tsx';
import { ShareIcon } from '../components/icons/ShareIcon.tsx';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon.tsx';
import Select from '../components/common/Select.tsx';
import Input from '../components/common/Input.tsx';
import { calculateInvoiceTotal } from '../utils.ts';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon.tsx';
import { CopyIcon } from '../components/icons/CopyIcon.tsx';
import Checkbox from '../components/common/Checkbox.tsx';
import { SpinnerIcon } from '../components/icons/SpinnerIcon.tsx';

const { Link, useNavigate } = ReactRouterDOM;
const INVOICE_PAGE_SIZE = 15;

const UserInvoicesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isInvoiceLimitReached } = usePlans();
  const navigate = useNavigate();
  
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [invoiceToShare, setInvoiceToShare] = useState<InvoiceData | null>(null);
  
  // Action status states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchFilter, setSearchFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Bulk actions state
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  // Infinite scroll observer
  const observer = useRef<IntersectionObserver>();
  
  // Fetch clients for the filter dropdown
  const loadClientsForFilter = useCallback(async () => {
      if (!user) return;
      try {
          const userClients = await fetchUserClients();
          setClients(userClients);
      } catch (e) { console.error("Failed to load clients for filter", e); }
  }, [user]);

  useEffect(() => {
    loadClientsForFilter();
  }, [loadClientsForFilter]);

  // Main data fetching function for invoices
  const loadInvoices = useCallback(async (isNewFilter = false) => {
    if ((loadingMore && !isNewFilter) || !user) return;
    
    const currentOffset = isNewFilter ? 0 : page * INVOICE_PAGE_SIZE;
    
    // Prevent fetching more if we know there are no more pages
    if (!isNewFilter && !hasMore) return;

    if (isNewFilter) {
        setLoading(true);
    } else {
        setLoadingMore(true);
    }
    setError(null);

    try {
        const newInvoices = await fetchUserDocuments(user.id, 'invoice', {
            limit: INVOICE_PAGE_SIZE,
            offset: currentOffset,
            status: statusFilter,
            searchQuery: debouncedSearch,
            startDate: dateRange.start,
            endDate: dateRange.end,
            clientId: clientFilter,
        });
        
        setInvoices(prev => isNewFilter ? newInvoices : [...prev, ...newInvoices]);
        setHasMore(newInvoices.length === INVOICE_PAGE_SIZE);
        setPage(isNewFilter ? 1 : page + 1);

    } catch (e: any) {
        setError(e.message || "Failed to load invoices. Please try again.");
    } finally {
        if (isNewFilter) setLoading(false);
        setLoadingMore(false);
    }
  }, [user, page, loadingMore, hasMore, statusFilter, debouncedSearch, dateRange, clientFilter]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedSearch(searchFilter);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchFilter]);

  // Effect to reload invoices when filters change
  useEffect(() => {
    if (!authLoading && user) {
        loadInvoices(true);
    }
  }, [debouncedSearch, statusFilter, clientFilter, dateRange, user, authLoading]); // `loadInvoices` is stable due to useCallback

  // Intersection Observer for infinite scrolling
  const lastInvoiceElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
            loadInvoices(false);
        }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, loadInvoices]);

  const handleSelect = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) ? prev.filter(id => id !== invoiceId) : [...prev, invoiceId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoices(invoices.map(inv => inv.db_id!));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleDeleteClick = (invoice: InvoiceData) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete || !user) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteInvoiceFromSupabase(invoiceToDelete.db_id!);
      setInvoices(prev => prev.filter(inv => inv.db_id !== invoiceToDelete.db_id));
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
    } catch (e: any) {
      setError(e.message || "Failed to delete invoice.");
    } finally {
      setIsDeleting(false);
    }
  };

    const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    const originalInvoices = [...invoices];
    setInvoices(invoices.map(inv => inv.db_id === invoiceId ? { ...inv, status: newStatus } : inv));
    
    const { error } = await updateInvoiceStatus(invoiceId, newStatus);
    if (error) {
      setError(error.message);
      setInvoices(originalInvoices);
    }
  };

  const handleOpenShareModal = (invoice: InvoiceData) => {
    setInvoiceToShare(invoice);
    setShowShareModal(true);
    setError(null);
    setCopiedId(null);
  };
  
    const prepareShareableLink = async (): Promise<string | null> => {
    if (!user || !invoiceToShare?.db_id) {
        setError('Invoice must be selected to share.');
        return null;
    }
    setProcessingId(invoiceToShare.db_id);
    let publicInvoice = { ...invoiceToShare };
    if (!publicInvoice.is_public) {
        const { success, error } = await makeInvoicePublic(publicInvoice.db_id);
        if (error || !success) {
            setError(error?.message || "Failed to make invoice public.");
            setProcessingId(null);
            return null;
        }
        setInvoices(invoices.map(inv => inv.db_id === publicInvoice.db_id ? { ...inv, is_public: true } : inv));
        publicInvoice.is_public = true;
    }
    setProcessingId(null);
    return `${window.location.origin}/#/view/invoice/${publicInvoice.db_id}`;
  };
  
   const handleCopyLinkFromModal = async () => {
    const url = await prepareShareableLink();
    if (!url || !invoiceToShare) return;
    try {
        await navigator.clipboard.writeText(url);
        setCopiedId(invoiceToShare.db_id);
        setTimeout(() => {
            setShowShareModal(false);
            setInvoiceToShare(null);
            setCopiedId(null);
        }, 1500);
    } catch(err) {
        setError("Failed to copy link.");
    }
  };

  const handleSendEmailFromModal = async () => {
    const url = await prepareShareableLink();
    if (!url || !invoiceToShare) return;
    const subject = `Invoice ${invoiceToShare.id} from ${invoiceToShare.sender.name}`;
    const total = calculateInvoiceTotal(invoiceToShare);
    const body = `Hello ${invoiceToShare.recipient.name || ''},\n\nPlease find your invoice online at the link below:\n${url}\n\nTotal Amount Due: ${invoiceToShare.currency} ${total.toFixed(2)}\nDue Date: ${new Date(invoiceToShare.dueDate).toLocaleDateString()}\n\nThank you!\n\nBest regards,\n${invoiceToShare.sender.name}`;
    const mailtoLink = `mailto:${invoiceToShare.recipient.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setShowShareModal(false);
    setInvoiceToShare(null);
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'paid', label: 'Paid' },
    { value: 'partially_paid', label: 'Partially Paid' },
    { value: 'overdue', label: 'Overdue' },
  ];
  
    const handleClearFilters = () => {
        setStatusFilter('all');
        setClientFilter('all');
        setSearchFilter('');
        setDateRange({ start: '', end: ''});
    };
    
    const handleBulkDelete = async () => {
    if (selectedInvoices.length === 0 || !window.confirm(`Are you sure you want to delete ${selectedInvoices.length} selected invoice(s)? This cannot be undone.`)) {
      return;
    }
    setProcessingId('bulk-delete');
    try {
      const deletePromises = selectedInvoices.map(id => deleteInvoiceFromSupabase(id));
      await Promise.all(deletePromises);
      setInvoices(prev => prev.filter(inv => !selectedInvoices.includes(inv.db_id!)));
      setSelectedInvoices([]);
    } catch (e: any) {
      setError(e.message || "Failed to delete one or more invoices.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkStatusChange = async (newStatus: InvoiceStatus) => {
    if (selectedInvoices.length === 0) return;
    setProcessingId('bulk-status-change');
    try {
      const updatePromises = selectedInvoices.map(id => updateInvoiceStatus(id, newStatus));
      await Promise.all(updatePromises);
      setInvoices(prev => prev.map(inv => selectedInvoices.includes(inv.db_id!) ? { ...inv, status: newStatus } : inv));
      setSelectedInvoices([]);
    } catch (e: any) {
      setError(e.message || "Failed to update status on one or more invoices.");
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading) return <UserInvoicesPageSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-neutral-darkest">My Invoices</h1>
            <Link to={isInvoiceLimitReached ? '/pricing' : '/create'}>
            <Button 
                variant="primary" 
                leftIcon={<PlusIcon className="w-5 h-5" />}
                title={isInvoiceLimitReached ? "Free plan limit reached. Click to upgrade." : "Create a new invoice"}
            >
                {isInvoiceLimitReached ? 'Upgrade to Create' : 'New Invoice'}
            </Button>
            </Link>
        </div>
      
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                <Input label="Search" placeholder="Invoice # or Client" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} wrapperClassName="lg:col-span-2 !mb-0" />
                <Select label="Status" options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')} wrapperClassName="!mb-0" />
                <Select label="Client" options={[{ value: 'all', label: 'All Clients' }, ...clients.map(c => ({ value: c.id, label: c.name }))]} value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} wrapperClassName="!mb-0" />
                <div className="grid grid-cols-2 gap-2 md:col-span-2 lg:col-span-1">
                    <Input label="From" type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} wrapperClassName="!mb-0" />
                    <Input label="To" type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} wrapperClassName="!mb-0" />
                </div>
                <Button variant="ghost" onClick={handleClearFilters} disabled={statusFilter === 'all' && clientFilter === 'all' && searchFilter === '' && !dateRange.start && !dateRange.end} className="w-full md:col-span-1 lg:col-span-5 xl:col-span-1">
                    Clear
                </Button>
            </div>
        </div>

      {loading ? <UserInvoicesPageSkeleton /> : error ? (
        <div className="text-center py-10"><p className="text-red-600 text-lg mb-4">{error}</p></div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-md rounded-lg">
          <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2-2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-neutral-darkest">No invoices found</h3>
          <p className="mt-1 text-sm text-neutral-DEFAULT">Try adjusting your filters or create a new invoice.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="flex items-center px-4 py-2 border-b bg-slate-50">
                <Checkbox id="select-all" onChange={handleSelectAll} checked={invoices.length > 0 && selectedInvoices.length === invoices.length} indeterminate={selectedInvoices.length > 0 && selectedInvoices.length < invoices.length} />
                <label htmlFor="select-all" className="ml-3 text-sm font-medium text-slate-600">Select All</label>
            </div>
            <ul role="list" className="divide-y divide-neutral-light">
                {invoices.map((invoice, index) => (
                    <li key={invoice.db_id} ref={invoices.length === index + 1 ? lastInvoiceElementRef : null} className={`p-4 sm:px-6 transition-colors duration-150 ${selectedInvoices.includes(invoice.db_id!) ? 'bg-blue-50' : 'bg-white hover:bg-neutral-lightest'}`}>
                       <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                            <div className="flex items-center gap-x-3 flex-1 min-w-[200px]">
                                <Checkbox id={`select-${invoice.db_id!}`} checked={selectedInvoices.includes(invoice.db_id!)} onChange={() => handleSelect(invoice.db_id!)} aria-label={`Select invoice ${invoice.id}`} />
                                <div className="truncate">
                                    <Link to={`/invoice/${invoice.db_id}`} className="text-primary hover:text-primary-dark font-semibold text-md truncate" title={`View/Edit Invoice ${invoice.id}`}>{invoice.id}</Link>
                                    <p className="text-sm text-neutral-700 truncate">To: {invoice.recipient.name || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-2 sm:gap-x-4 text-sm text-neutral-600">
                                <p className="font-semibold text-neutral-800 w-24 text-right">{invoice.currency || DEFAULT_CURRENCY} {calculateInvoiceTotal(invoice).toFixed(2)}</p>
                                <p className="hidden md:block w-24 text-center">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                                <StatusBadge status={invoice.status} onStatusChange={(newStatus) => handleStatusChange(invoice.db_id!, newStatus)} />
                            </div>
                            <div className="flex items-center gap-x-1">
                                <Button variant="ghost" size="sm" className="!px-2" onClick={() => handleOpenShareModal(invoice)} disabled={processingId === invoice.db_id} title="Share Invoice"><ShareIcon className="h-5 w-5 text-neutral-600" /></Button>
                                <Link to={`/invoice/${invoice.db_id}`} className="inline-flex items-center"><Button variant="ghost" size="sm" className="!px-2" title="Edit Invoice"><PencilIcon className="h-5 w-5 text-neutral-600" /></Button></Link>
                                <Button variant="ghost" size="sm" className="!px-2 !text-red-500 hover:!bg-red-50" onClick={() => handleDeleteClick(invoice)} title="Delete Invoice"><TrashIcon className="h-5 w-5" /></Button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            {loadingMore && <div className="flex justify-center items-center py-4"><SpinnerIcon className="w-6 h-6 animate-spin text-primary" /> <span className="ml-2 text-neutral-500">Loading more...</span></div>}
        </div>
      )}

      {selectedInvoices.length > 0 && (
         <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg border-t z-20 transition-transform transform-gpu">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-700">{selectedInvoices.length} selected</span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleBulkStatusChange('paid')} disabled={!!processingId}>Mark as Paid</Button>
              <Button variant="secondary" size="sm" onClick={() => handleBulkStatusChange('sent')} disabled={!!processingId}>Mark as Sent</Button>
              <Button variant="danger" size="sm" onClick={handleBulkDelete} disabled={!!processingId}>Delete</Button>
              <button onClick={() => setSelectedInvoices([])} className="p-2 text-neutral-500 hover:text-neutral-700" title="Clear selection"><XMarkIcon className="w-5 h-5"/></button>
            </div>
          </div>
         </div>
      )}

      {showDeleteModal && invoiceToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70] no-print backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4"><h3 id="delete-modal-title" className="text-xl font-semibold text-neutral-darkest">Confirm Deletion</h3><button onClick={() => setShowDeleteModal(false)} className="text-neutral-500 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-light" aria-label="Close delete confirmation modal" disabled={isDeleting}><XMarkIcon className="w-6 h-6" /></button></div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <p className="text-neutral-DEFAULT mb-6">Are you sure you want to delete invoice <span className="font-semibold">{invoiceToDelete.id}</span> for <span className="font-semibold">{invoiceToDelete.recipient.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3"><Button variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</Button><Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete Invoice'}</Button></div>
          </div>
        </div>
      )}
      
      {showShareModal && invoiceToShare && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70] no-print backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold text-neutral-darkest">Share Invoice {invoiceToShare.id}</h3><button onClick={() => setShowShareModal(false)} className="text-neutral-500 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-light" disabled={processingId === invoiceToShare.db_id}><XMarkIcon className="w-6 h-6" /></button></div>
                {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-3 text-sm">{error}</p>}
                <div className="space-y-3">
                    <Button variant="secondary" className="w-full !justify-start !py-3" leftIcon={<CopyIcon className="w-5 h-5 mr-3 text-neutral-600"/>} onClick={handleCopyLinkFromModal} disabled={processingId === invoiceToShare.db_id}>{copiedId === invoiceToShare.db_id ? 'Copied to clipboard!' : 'Copy Public Link'}</Button>
                    <Button variant="secondary" className="w-full !justify-start !py-3" leftIcon={<EnvelopeIcon className="w-5 h-5 mr-3 text-neutral-600"/>} onClick={handleSendEmailFromModal} disabled={processingId === invoiceToShare.db_id}>Send Link via Email</Button>
                </div>
                 <div className="mt-4 text-right"><Button variant="ghost" onClick={() => setShowShareModal(false)} disabled={processingId === invoiceToShare.db_id}>Cancel</Button></div>
            </div>
        </div>
      )}
    </div>
  );
};

const UserInvoicesPageSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="bg-white shadow-lg rounded-lg divide-y divide-neutral-light">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                           <div className="h-5 w-5 bg-slate-200 rounded"></div>
                           <div className="space-y-2"><div className="h-5 bg-slate-200 rounded w-24"></div><div className="h-4 bg-slate-200 rounded w-32"></div></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-5 bg-slate-200 rounded w-20"></div>
                            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


export default UserInvoicesPage;