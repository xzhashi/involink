

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePlans } from '../contexts/PlanContext.tsx';
import { fetchUserDocuments, deleteInvoiceFromSupabase, updateInvoiceStatus, makeInvoicePublic } from '../services/supabaseClient.ts';
import { InvoiceData, InvoiceStatus } from '../types.ts';
import Button from '../components/common/Button.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx'; 
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { XMarkIcon } from '../components/icons/XMarkIcon.tsx';
import { DEFAULT_CURRENCY } from '../constants.ts';
import StatusBadge from '../components/common/StatusBadge.tsx';
import { ShareIcon } from '../components/icons/ShareIcon.tsx';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon.tsx';

const UserInvoicesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isLimitReached } = usePlans();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth'); 
      return;
    }

    const loadInvoices = async () => {
      setLoadingInvoices(true);
      setError(null);
      try {
        const userInvoices = await fetchUserDocuments(user.id, 'invoice');
        setInvoices(userInvoices);
      } catch (e: any) {
        setError(e.message || "Failed to load invoices. Please try again.");
      } finally {
        setLoadingInvoices(false);
      }
    };

    loadInvoices();
  }, [user, authLoading, navigate]);

  const handleDeleteClick = (invoice: InvoiceData) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete || !user) return;
    setIsDeleting(true);
    setError(null);
    try {
      setProcessingId(invoiceToDelete.db_id!);
      const { error: deleteError } = await deleteInvoiceFromSupabase(invoiceToDelete.db_id!);
      if (deleteError) {
        throw deleteError;
      }
      setInvoices(prevInvoices => prevInvoices.filter(inv => inv.db_id !== invoiceToDelete.db_id));
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
    } catch (e: any) {
      setError(e.message || "Failed to delete invoice. Please try again.");
    } finally {
      setIsDeleting(false);
      setProcessingId(null);
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    const originalInvoices = [...invoices];
    // Optimistically update UI
    setInvoices(invoices.map(inv => inv.db_id === invoiceId ? { ...inv, status: newStatus } : inv));
    
    const { error } = await updateInvoiceStatus(invoiceId, newStatus);
    if (error) {
      setError(error.message);
      // Revert UI on error
      setInvoices(originalInvoices);
    }
  };
  
  const handleShare = async (invoice: InvoiceData) => {
      if (!user || !invoice.db_id) return;
      setProcessingId(invoice.db_id);
      setError(null);
      
      try {
          if (!invoice.is_public) {
              const { success, error } = await makeInvoicePublic(invoice.db_id);
              if (!success) throw error || new Error("Failed to make invoice public.");
              // Optimistically update local state so we don't need to refetch
              setInvoices(invoices.map(inv => inv.db_id === invoice.db_id ? { ...inv, is_public: true } : inv));
          }

          const shareUrl = `${window.location.origin}/#/view/invoice/${invoice.db_id}`;
          await navigator.clipboard.writeText(shareUrl);
          setCopiedId(invoice.db_id);
          setTimeout(() => setCopiedId(null), 2500);
      } catch (e: any) {
          setError(e.message || 'Failed to share invoice.');
      } finally {
          setProcessingId(null);
      }
  };

  if (authLoading || loadingInvoices) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="flex justify-between items-center mb-8">
          <div className="h-9 bg-slate-200 rounded w-1/4"></div>
          <div className="h-10 bg-slate-200 rounded w-48"></div>
        </div>
        <div className="bg-white shadow-lg rounded-lg divide-y divide-neutral-light">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 w-1/2">
                  <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 bg-slate-200 rounded w-20"></div>
                  <div className="h-8 bg-slate-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !showDeleteModal) { // Don't show page error if delete modal has its own error
     return (
      <div className="text-center py-10">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="secondary">Try Reloading</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-neutral-darkest">My Invoices</h1>
        <Link to={isLimitReached ? '/pricing' : '/create'}>
          <Button 
            variant="primary" 
            leftIcon={<PlusIcon className="w-5 h-5" />}
            title={isLimitReached ? "Free plan limit reached. Click to upgrade." : "Create a new invoice"}
          >
            {isLimitReached ? 'Upgrade to Create More' : 'Create New Invoice'}
          </Button>
        </Link>
      </div>

      {invoices.length === 0 && !loadingInvoices ? (
        <div className="text-center py-12 bg-white shadow-md rounded-lg">
          <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2-2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-neutral-darkest">No invoices yet</h3>
          <p className="mt-1 text-sm text-neutral-DEFAULT">
            Get started by creating your first invoice.
          </p>
          <div className="mt-6">
            <Link to={isLimitReached ? '/pricing' : '/create'}>
              <Button 
                variant="secondary" 
                leftIcon={<PlusIcon className="w-4 h-4 mr-1.5" />}
                disabled={isLimitReached}
              >
                {isLimitReached ? 'Plan Limit Reached' : 'Create Invoice'}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <ul role="list" className="divide-y divide-neutral-light">
            {invoices.map((invoice) => (
              <li key={invoice.db_id} className="px-4 py-4 sm:px-6 hover:bg-neutral-lightest transition-colors duration-150">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <div className="truncate">
                    <Link to={`/invoice/${invoice.db_id}`} className="text-primary hover:text-primary-dark font-semibold text-md truncate" title={`View/Edit Invoice ${invoice.id}`}>
                      {invoice.id}
                    </Link>
                    <p className="text-sm font-semibold text-neutral-700 truncate">
                      To: {invoice.recipient.name || 'N/A'}
                    </p>
                  </div>
                  <div className="ml-auto flex-shrink-0 flex items-center space-x-1 sm:space-x-2">
                     <StatusBadge status={invoice.status} onStatusChange={(newStatus) => handleStatusChange(invoice.db_id!, newStatus)} />
                     <Button variant="ghost" size="sm" className="!px-2" onClick={() => handleShare(invoice)} disabled={processingId === invoice.db_id} title="Copy public link">
                        {copiedId === invoice.db_id ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <ShareIcon className="h-5 w-5 text-neutral-600" />}
                     </Button>
                    <Link to={`/invoice/${invoice.db_id}`} className="inline-flex items-center">
                      <Button variant="ghost" size="sm" className="!px-2" title="Edit Invoice">
                        <PencilIcon className="h-5 w-5 text-neutral-600" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="!px-2 !text-red-500 hover:!bg-red-50" 
                      onClick={() => handleDeleteClick(invoice)}
                      title="Delete Invoice"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-xs text-neutral-500">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Issued: {new Date(invoice.date).toLocaleDateString()}
                    </p>
                     <p className="text-xs text-neutral-800 font-semibold ml-4">
                       {invoice.currency || DEFAULT_CURRENCY} {(invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * (1 + (invoice.taxRate || 0)/100) - (invoice.discount?.type === 'fixed' ? invoice.discount.value : (invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * (invoice.discount?.value || 0))/100)).toFixed(2)}
                   </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDeleteModal && invoiceToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70] no-print backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 id="delete-modal-title" className="text-xl font-semibold text-neutral-darkest">Confirm Deletion</h3>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="text-neutral-500 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-light"
                aria-label="Close delete confirmation modal"
                disabled={isDeleting}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <p className="text-neutral-DEFAULT mb-6">
              Are you sure you want to delete invoice <span className="font-semibold">{invoiceToDelete.id}</span> for <span className="font-semibold">{invoiceToDelete.recipient.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Invoice'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInvoicesPage;
