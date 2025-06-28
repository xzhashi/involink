import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlans } from '../contexts/PlanContext';
import { fetchUserInvoicesFromSupabase, deleteInvoiceFromSupabase } from '../services/supabaseClient';
import { InvoiceData } from '../types';
import Button from '../components/common/Button';
import { PlusIcon } from '../components/icons/PlusIcon';
import { PencilIcon } from '../components/icons/PencilIcon'; 
import { TrashIcon } from '../components/icons/TrashIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { DEFAULT_CURRENCY } from '../constants';

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
        const userInvoices = await fetchUserInvoicesFromSupabase(user.id);
        setInvoices(userInvoices);
      } catch (e: any) {
        console.error("Error fetching user invoices:", e);
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
      const { error: deleteError } = await deleteInvoiceFromSupabase(invoiceToDelete.db_id!, user.id);
      if (deleteError) {
        throw deleteError;
      }
      setInvoices(prevInvoices => prevInvoices.filter(inv => inv.db_id !== invoiceToDelete.db_id));
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
    } catch (e: any) {
      console.error("Error deleting invoice:", e);
      setError(e.message || "Failed to delete invoice. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loadingInvoices) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <p className="text-xl text-neutral-dark">Loading your invoices...</p>
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
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
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
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <Link to={`/invoice/${invoice.db_id}`} className="text-primary-DEFAULT hover:text-primary-dark font-semibold text-md truncate" title={`View/Edit Invoice ${invoice.id}`}>
                      {invoice.id}
                    </Link>
                    <p className="text-sm text-neutral-DEFAULT truncate">
                      To: {invoice.recipient.name || 'N/A'}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2 sm:space-x-3">
                     <p className="text-sm text-neutral-darkest text-right hidden sm:block">
                       {invoice.currency || DEFAULT_CURRENCY} {(invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * (1 + (invoice.taxRate || 0)/100) - (invoice.discount?.type === 'fixed' ? invoice.discount.value : (invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * (invoice.discount?.value || 0))/100)).toFixed(2)}
                     </p>
                    <Link to={`/invoice/${invoice.db_id}`} className="inline-flex items-center">
                      <Button variant="ghost" size="sm" className="!px-2 !py-1" title="Edit Invoice">
                        <PencilIcon className="h-4 w-4 text-primary-DEFAULT sm:mr-1.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="!px-2 !py-1 !text-red-500 hover:!bg-red-50" 
                      onClick={() => handleDeleteClick(invoice)}
                      title="Delete Invoice"
                    >
                      <TrashIcon className="h-4 w-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-xs text-neutral-DEFAULT">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Issued: {new Date(invoice.date).toLocaleDateString()}
                    </p>
                    <p className="mt-1 flex items-center text-xs text-neutral-DEFAULT sm:mt-0 sm:ml-4">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                   <p className="text-xs text-neutral-darkest text-right mt-1 sm:hidden">
                       {invoice.currency || DEFAULT_CURRENCY} {(invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * (1 + (invoice.taxRate || 0)/100) - (invoice.discount?.type === 'fixed' ? invoice.discount.value : (invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * (invoice.discount?.value || 0))/100)).toFixed(2)}
                   </p>
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
