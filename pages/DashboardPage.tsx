
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import StatCard from '../components/dashboard/StatCard.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { calculateInvoiceTotal } from '../utils.ts';
import { InvoiceData } from '../types.ts';
import RecentInvoices from '../components/dashboard/RecentInvoices.tsx';
import RevenueChartCard from '../components/dashboard/RevenueChartCard.tsx';
import QuickActionsCard from '../components/dashboard/QuickActionsCard.tsx';
import { ReceiptPercentIcon } from '../components/icons/ReceiptPercentIcon.tsx';
import { BanknotesIcon } from '../components/icons/BanknotesIcon.tsx';
import { UserGroupIcon } from '../components/icons/UserGroupIcon.tsx';
import { ChatBubbleLeftRightIcon } from '../components/icons/ChatBubbleLeftRightIcon.tsx';
import { SparklesIcon } from '../components/icons/SparklesIcon.tsx';

const { Link } = ReactRouterDOM;

const DashboardPageSkeleton: React.FC = () => (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 bg-slate-200 rounded-full"></div>
        <div className="space-y-2">
            <div className="h-10 bg-slate-200 rounded w-48"></div>
            <div className="h-4 bg-slate-200 rounded w-64"></div>
        </div>
      </div>
      
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-200 rounded-2xl h-44"></div>
          <div className="bg-slate-200 rounded-2xl h-44"></div>
          <div className="bg-slate-200 rounded-2xl h-44"></div>
          <div className="bg-slate-200 rounded-2xl h-44"></div>
      </div>

       {/* Main Section Skeleton */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-200 rounded-2xl h-80"></div>
            <div className="space-y-8">
                <div className="bg-slate-200 rounded-2xl h-56"></div>
                <div className="space-y-3">
                    <div className="h-16 bg-slate-200 rounded-xl"></div>
                    <div className="h-16 bg-slate-200 rounded-xl"></div>
                </div>
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
        taxes: jsonData.taxes || [],
        discount: jsonData.discount || { type: 'percentage', value: 0 },
        currency: jsonData.currency || 'USD',
        selectedTemplateId: jsonData.selectedTemplateId || 'modern',
        type: inv.type || 'invoice',
        status: inv.status || 'draft',
    };
};


const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ 
      unpaidInvoices: 0, 
      totalRevenue: 0, 
      totalClients: 0, 
      totalQuotes: 0, 
      unpaidAmount: 0,
      quotesValue: 0,
      currencySymbol: '$' 
  });
  const [revenueForChart, setRevenueForChart] = useState<any>(null);
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
            .select('status, invoice_data_json, type, invoice_number, created_at')
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
        let quotesValue = 0;
        let currencySymbol = '$';
        let currencyCode = 'USD';
        let currencySet = false;

        const months = Array.from({ length: 12 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }).reverse();

        const monthlyRevenue: { [key: string]: number } = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

        invoices.forEach(inv => {
            const invoiceForCalc = fromSupabaseToInvoiceDataForCalc(inv);
            const total = calculateInvoiceTotal(invoiceForCalc);
            
            if (!currencySet && invoiceForCalc.currency) {
                currencyCode = invoiceForCalc.currency;
                if (invoiceForCalc.currency === 'INR') currencySymbol = '₹';
                else if (invoiceForCalc.currency === 'EUR') currencySymbol = '€';
                // else it remains '$'
                currencySet = true; // Set currency based on the first found invoice
            }

            if (inv.type === 'invoice') {
                if (inv.status !== 'paid' && inv.status !== 'draft') {
                    unpaidCount++;
                    unpaidAmount += total;
                }
                if (inv.status === 'paid') {
                    revenue += total;
                    if(inv.created_at) {
                      const date = new Date(inv.created_at);
                      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                      if (monthlyRevenue.hasOwnProperty(monthKey)) {
                          monthlyRevenue[monthKey] += total;
                      }
                    }
                }
            } else if (inv.type === 'quote') {
                quoteCount++;
                quotesValue += total;
            }
        });
        
        setRevenueForChart({
            labels: months.map(m => new Date(m + '-02').toLocaleString('default', { month: 'short' })),
            datasets: [{
                label: 'Revenue',
                data: Object.values(monthlyRevenue),
            }],
            currencyCode: currencyCode,
        });

        setStats({
          unpaidInvoices: unpaidCount,
          totalRevenue: revenue,
          totalClients: clientCount,
          totalQuotes: quoteCount,
          unpaidAmount: unpaidAmount,
          quotesValue: quotesValue,
          currencySymbol: currencySymbol,
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
    <div className="space-y-8">
      <header className="flex flex-wrap items-center gap-4">
          <Link to="/settings" className="flex-shrink-0" title="Go to settings">
              <img 
                  src={user?.user_metadata?.company_details?.logoUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.email || 'default'}`} 
                  alt="User Avatar" 
                  className="h-14 w-14 rounded-full border-2 border-white shadow-lg hover:ring-2 hover:ring-purple-400 transition-all object-cover"
              />
          </Link>
          <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 flex items-center gap-2">
                  Hello, {getFirstName()}! 
                  <SparklesIcon className="w-8 h-8 text-purple-500 opacity-80"/>
              </h1>
              <p className="text-slate-500 mt-1">Here's your business overview for today.</p>
          </div>
      </header>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          variant="primary"
          title="Unpaid Invoices"
          value={`${stats.currencySymbol}${stats.unpaidAmount.toFixed(2)}`}
          label={`${stats.unpaidInvoices} invoices awaiting payment`}
          icon={<ReceiptPercentIcon className="w-full h-full" />}
          footerLink={{ to: '/invoices', text: 'View All Invoices' }}
        />
        <StatCard
          title="Total Revenue"
          value={`${stats.currencySymbol}${stats.totalRevenue.toFixed(2)}`}
          label="From paid invoices"
          icon={<BanknotesIcon className="w-full h-full" />}
          footerLink={{ to: '/reports', text: 'View Reports' }}
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients.toString()}
          label="Managed clients"
          icon={<UserGroupIcon className="w-full h-full" />}
          footerLink={{ to: '/clients', text: 'View Clients' }}
        />
         <StatCard
            title="Total Quotes"
            value={stats.totalQuotes.toString()}
            label={`${stats.currencySymbol}${stats.quotesValue.toFixed(2)} in potential revenue`}
            icon={<ChatBubbleLeftRightIcon className="w-full h-full" />}
            footerLink={{ to: '/quotes', text: 'View Quotes' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            {revenueForChart && <RevenueChartCard data={revenueForChart} />}
        </div>
        <div className="space-y-8">
            <QuickActionsCard />
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Invoices</h2>
                <RecentInvoices />
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
