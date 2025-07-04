


import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { InvoiceData } from '../../types.ts';
import { calculateInvoiceTotal } from '../../utils.ts';
import StatusBadge from '../common/StatusBadge.tsx';
import { DEFAULT_CURRENCY } from '../../constants.ts';

const { Link } = ReactRouterDOM;

const fromSupabaseInvoiceFormatForList = (row: any): InvoiceData => {
  const jsonData = row.invoice_data_json || {};
  return {
    db_id: row.id,
    user_id: row.user_id,
    id: row.invoice_number,
    date: jsonData.date,
    dueDate: jsonData.dueDate,
    sender: jsonData.sender || { name: '', address: '' },
    recipient: jsonData.recipient || { name: '', address: '' },
    items: Array.isArray(jsonData.items) ? jsonData.items : [],
    taxes: Array.isArray(jsonData.taxes) ? jsonData.taxes : [],
    discount: jsonData.discount || { type: 'percentage', value: 0 },
    currency: jsonData.currency || 'USD',
    selectedTemplateId: jsonData.selectedTemplateId || 'modern',
    type: row.type || 'invoice',
    status: row.status || 'draft',
    client_id: row.client_id,
    is_public: row.is_public
  };
};

const RecentInvoicesSkeleton: React.FC = () => (
    <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg animate-pulse">
                <div className="space-y-1.5">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-20"></div>
            </div>
        ))}
    </div>
);


const RecentInvoices: React.FC = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchRecentInvoices = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('invoices')
                .select('id, invoice_number, status, invoice_data_json, type, client_id, is_public, created_at')
                .eq('user_id', user.id)
                .eq('type', 'invoice')
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) {
                setInvoices(data.map(fromSupabaseInvoiceFormatForList));
            }
            setLoading(false);
        };

        fetchRecentInvoices();
    }, [user]);

    if (loading) {
        return <RecentInvoicesSkeleton />;
    }

    if (invoices.length === 0) {
        return (
            <div className="text-center py-8 bg-white rounded-xl border border-neutral-200/80">
                <p className="text-neutral-500">No recent invoices found.</p>
                <Link to="/create">
                    <span className="text-primary hover:underline font-medium mt-2 inline-block">Create one now</span>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {invoices.map(invoice => (
                <Link to={`/invoice/${invoice.db_id}`} key={invoice.db_id} className="block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-neutral-200/80">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-2">
                        <div>
                            <p className="font-semibold text-neutral-800">{invoice.id}</p>
                            <p className="text-sm text-neutral-500">To: {invoice.recipient.name}</p>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end sm:gap-y-1">
                           <p className="font-semibold text-neutral-800">{invoice.currency || DEFAULT_CURRENCY} {calculateInvoiceTotal(invoice).toFixed(2)}</p>
                           <StatusBadge status={invoice.status} onStatusChange={() => {}} />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default RecentInvoices;