

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import StatCard from '../components/dashboard/StatCard.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { calculateInvoiceTotal } from '../utils.ts';
import { InvoiceData } from '../types.ts';
import RecentInvoices from '../components/dashboard/RecentInvoices.tsx';
import { ReceiptPercentIcon } from '../components/icons/ReceiptPercentIcon.tsx';
import { BanknotesIcon } from '../components/icons/BanknotesIcon.tsx';
import { UserGroupIcon } from '../components/icons/UserGroupIcon.tsx';
import { ChatBubbleLeftRightIcon } from '../components/icons/ChatBubbleLeftRightIcon.tsx';
import { SparklesIcon } from '../components/icons/SparklesIcon.tsx';

const DashboardPageSkeleton: React.FC = () => (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-10 bg-slate-200 rounded w-1/2"></div>
      
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-slate-200 rounded-2xl h-48 md:col-span-2 xl:col-span-2"></div>
          <div className="bg-slate-200 rounded-2xl h-48"></div>
          <div className="bg-slate-200 rounded-2xl h-48"></div>
      </div>

       {/* Recent Invoices Skeleton */}
       <div>
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-200 rounded-xl"></div>
                ))}
            </div>
       </div>
    </div>
);


const fromSupabaseToInvoiceDataForCalc = (inv: any): InvoiceData => {
    const jsonData = inv.invoice_data_json || {};
    return {
        id: inv.invoice_number || '',
        date: jsonData.date || '',
        dueDate: jsonData.dueDate || '',
        sender: jsonData.sender || { name: '', address: '' },
        recipient: jsonData.recipient || { name: '', address: '' },
        items: jsonData.items || [],
        taxRate: jsonData.taxRate || 0,
        discount: jsonData.discount || { type: 'percentage', value: 0 },
        currency: jsonData.currency || 'USD',
        selectedTemplateId: jsonData.selectedTemplateId || 'modern',
        type: inv.type || 'invoice',
        status: inv.status || 'draft',
    };
};


const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ unpaidInvoices: 0, totalRevenue: 0, totalClients: 0, totalQuotes: 0, unpaidAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [invoicesResponse, clientsResponse] = await Promise.all([
          supabase
            .from('invoices')
            .select('status, invoice_data_json, type, invoice_number')
            .eq('user_id', user.id),
          supabase
            .from('clients')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
        ]);

        if (invoicesResponse.error) throw invoicesResponse.error;
        if (clientsResponse.error) throw clientsResponse.error;

        const invoices = invoicesResponse.data || [];
        const clientCount = clientsResponse.count || 0;

        let unpaidCount = 0;
        let revenue = 0;
        let quoteCount = 0;
        let unpaidAmount = 0;

        invoices.forEach(inv => {
            const invoiceForCalc = fromSupabaseToInvoiceDataForCalc(inv);
            const total = calculateInvoiceTotal(invoiceForCalc);

            if (inv.type === 'invoice') {
                if (inv.status !== 'paid' && inv.status !== 'draft') {
                    unpaidCount++;
                    unpaidAmount += total;
                }
                if (inv.status === 'paid') {
                    revenue += total;
                }
            } else if (inv.type === 'quote') {
                quoteCount++;
            }
        });

        setStats({
          unpaidInvoices: unpaidCount,
          totalRevenue: revenue,
          totalClients: clientCount,
          totalQuotes: quoteCount,
          unpaidAmount: unpaidAmount,
        });
      } catch (e: any) {
        setError("Failed to load dashboard data. " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, authLoading]);


  const getFirstName = () => {
    if (!user || !user.email) return 'User'; 
    const emailName = user.email.split('@')[0];
    const firstName = emailName.split('.')[0] || emailName;
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  if (authLoading || loading) {
    return <DashboardPageSkeleton />;
  }

  if (error) {
    return <div className="text-center py-10 bg-red-50 text-red-700 rounded-lg">{error}</div>;
  }
  
  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center gap-4">
          <Link to="/settings" className="flex-shrink-0" title="Go to settings">
              <img 
                  src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.email || 'default'}`} 
                  alt="User Avatar" 
                  className="h-14 w-14 rounded-full border-2 border-white shadow-lg hover:ring-2 hover:ring-purple-400 transition-all"
              />
          </Link>
          <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 flex items-center gap-2">
                  Hello, {getFirstName()}! 
                  <SparklesIcon className="w-7 h-7 text-purple-500 opacity-80"/>
              </h1>
              <p className="text-neutral-500 mt-1">Here's your business overview for today.</p>
          </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          variant="primary"
          title="Unpaid Invoices"
          value={`$${stats.unpaidAmount.toFixed(2)}`}
          label={`${stats.unpaidInvoices} invoices awaiting payment`}
          icon={<ReceiptPercentIcon className="w-7 h-7" />}
          footerLink={{ to: '/invoices', text: 'View All Invoices' }}
          className="md:col-span-2 xl:col-span-2"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          label="From paid invoices"
          icon={<BanknotesIcon className="w-7 h-7" />}
          footerLink={{ to: '/reports', text: 'View Reports' }}
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients.toString()}
          label="Managed clients"
          icon={<UserGroupIcon className="w-7 h-7" />}
          footerLink={{ to: '/clients', text: 'View Clients' }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
            <h2 className="text-xl font-bold text-neutral-800 mb-4">Recent Invoices</h2>
            <RecentInvoices />
        </div>
        <div className="xl:col-span-1">
             <h2 className="text-xl font-bold text-neutral-800 mb-4">Quick Stats</h2>
             <div className="space-y-4">
                 <StatCard
                    title="Total Quotes"
                    value={stats.totalQuotes.toString()}
                    icon={<ChatBubbleLeftRightIcon className="w-7 h-7" />}
                    footerLink={{ to: '/quotes', text: 'View Quotes' }}
                />
                 {/* Can add more small cards here */}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;