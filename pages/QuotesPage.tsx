

import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { fetchUserDocuments, deleteInvoiceFromSupabase, convertQuoteToInvoice } from '../services/supabaseClient.ts';
import { InvoiceData } from '../types.ts';
import Button from '../components/common/Button.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { ArrowPathIcon } from '../components/icons/ArrowPathIcon.tsx';
import StatusBadge from '../components/common/StatusBadge.tsx';

const { Link, useNavigate } = ReactRouterDOM;

const QuotesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth'); 
      return;
    }

    const loadQuotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserDocuments(user.id, 'quote');
        setQuotes(data);
      } catch (e: any) {
        setError(e.message || "Failed to load quotes.");
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, [user, authLoading, navigate]);

  const handleDelete = async (quoteId: string) => {
    if (!user || !window.confirm("Are you sure you want to delete this quote?")) return;
    setProcessingId(quoteId);
    await deleteInvoiceFromSupabase(quoteId);
    setQuotes(quotes.filter(q => q.db_id !== quoteId));
    setProcessingId(null);
  };
  
  const handleConvertToInvoice = async (quoteId: string) => {
      if (!user) return;
      setProcessingId(quoteId);
      try {
        const { data: newInvoice, error: conversionError } = await convertQuoteToInvoice(quoteId);
        if (conversionError || !newInvoice) {
            throw new Error(conversionError?.message || "Failed to convert quote.");
        }
        navigate(`/invoice/${newInvoice.db_id}`);
      } catch(e: any) {
          setError(e.message);
      } finally {
          setProcessingId(null);
      }
  };

  if (authLoading || loading) {
      return <div>Loading quotes...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-darkest">Quotes & Estimates</h1>
        <Link to="/create" state={{ defaultType: 'quote' }}>
          <Button variant="primary" leftIcon={<PlusIcon className="w-5 h-5"/>}>
            Create New Quote
          </Button>
        </Link>
      </div>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

      {quotes.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-md rounded-lg">
          <h3 className="text-lg font-medium text-neutral-darkest">No quotes yet</h3>
          <p className="mt-1 text-sm text-neutral-DEFAULT">Create a quote to send to a client.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <ul className="divide-y divide-neutral-light">
            {quotes.map((quote) => (
              <li key={quote.db_id} className="px-4 py-4 sm:px-6 hover:bg-neutral-lightest">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <Link to={`/invoice/${quote.db_id}`} className="text-primary-DEFAULT font-semibold">{quote.id}</Link>
                    <p className="text-sm text-neutral-DEFAULT">To: {quote.recipient.name}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 space-x-2">
                    <StatusBadge status={quote.status} onStatusChange={() => {}} /> 
                    <Button variant="secondary" size="sm" onClick={() => handleConvertToInvoice(quote.db_id!)} disabled={processingId === quote.db_id}>
                        <ArrowPathIcon className="w-4 h-4 mr-1.5"/> Convert
                    </Button>
                    <Link to={`/invoice/${quote.db_id}`}><Button variant="ghost" size="sm"><PencilIcon className="w-4 h-4"/></Button></Link>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(quote.db_id!)} disabled={processingId === quote.db_id}><TrashIcon className="w-4 h-4"/></Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuotesPage;