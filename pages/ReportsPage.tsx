

import React, { useState, useEffect } from 'react';
import { fetchReportsData } from '../services/supabaseClient.ts';
import { calculateInvoiceTotal } from '../utils.ts';
import RevenueChart from '../components/reports/RevenueChart.tsx';
import TopClientsChart from '../components/reports/TopClientsChart.tsx';
import StatusDoughnutChart from '../components/reports/StatusDoughnutChart.tsx';
import { InvoiceData, Client, InvoiceStatus } from '../types.ts';

const ReportsPageSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-9 bg-slate-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md h-80 flex items-center justify-center">
                <div className="h-64 bg-slate-200 rounded w-full"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md h-80 flex items-center justify-center">
                <div className="w-64 h-64 bg-slate-200 rounded-full"></div>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md h-96 flex items-center justify-center">
                 <div className="h-80 bg-slate-200 rounded w-full"></div>
            </div>
        </div>
    </div>
);

// Helper function to create a minimal InvoiceData object for calculation
const fromSupabaseInvoiceFormatForCalc = (row: any): InvoiceData => {
    const jsonData = row.invoice_data_json || {};
    return {
        id: '',
        date: '',
        dueDate: '',
        sender: {name: '', address: ''},
        recipient: {name: '', address: ''},
        items: jsonData.items || [],
        taxes: jsonData.taxes || [],
        discount: jsonData.discount || { type: 'percentage', value: 0 },
        currency: jsonData.currency || 'USD',
        selectedTemplateId: '',
        type: 'invoice',
        status: 'draft'
    };
};


const ReportsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revenueData, setRevenueData] = useState<any>(null);
    const [topClientsData, setTopClientsData] = useState<any>(null);
    const [statusData, setStatusData] = useState<any>(null);

    useEffect(() => {
        const processData = async () => {
            try {
                setLoading(true);
                setError(null);
                const { invoices, clients } = await fetchReportsData();
                
                // Process for RevenueChart
                const monthlyRevenue: { [key: string]: number } = {};
                invoices.forEach(inv => {
                    if (inv.type === 'invoice' && inv.created_at) {
                        const date = new Date(inv.created_at);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        const total = calculateInvoiceTotal(fromSupabaseInvoiceFormatForCalc(inv));
                        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + total;
                    }
                });
                
                const sortedMonths = Object.keys(monthlyRevenue).sort();
                const revenueLabels = sortedMonths.map(key => new Date(key + '-02').toLocaleString('default', { month: 'short', year: 'numeric' }));
                const revenueValues = sortedMonths.map(key => monthlyRevenue[key]);
                setRevenueData({
                    labels: revenueLabels,
                    datasets: [{
                        label: 'Revenue',
                        data: revenueValues,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        tension: 0.1
                    }]
                });

                // Process for TopClientsChart
                const clientRevenue: { [key: string]: number } = {};
                const clientMap = new Map(clients.map(c => [c.id, c.name]));

                invoices.forEach(inv => {
                    if (inv.type === 'invoice' && inv.client_id && inv.status === 'paid') {
                        const total = calculateInvoiceTotal(fromSupabaseInvoiceFormatForCalc(inv));
                        clientRevenue[inv.client_id] = (clientRevenue[inv.client_id] || 0) + total;
                    }
                });

                const sortedClients = Object.entries(clientRevenue)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 7);
                
                const clientLabels = sortedClients.map(([clientId]) => clientMap.get(clientId) || 'Unknown Client');
                const clientValues = sortedClients.map(([, revenue]) => revenue);
                setTopClientsData({
                    labels: clientLabels,
                    datasets: [{
                        label: 'Total Revenue',
                        data: clientValues,
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#84CC16', '#14B8A6'],
                    }]
                });


                // Process for StatusDoughnutChart
                const statusCounts: { [key in InvoiceStatus]?: number } = {};
                invoices.forEach(inv => {
                    if(inv.status) {
                        statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
                    }
                });
                
                const statusLabels = Object.keys(statusCounts);
                const statusValues = Object.values(statusCounts);
                setStatusData({
                    labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')),
                    datasets: [{
                        label: '# of Invoices',
                        data: statusValues,
                        backgroundColor: ['#64748B', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#F97316'],
                        borderColor: ['#475569', '#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#EA580C'],
                        borderWidth: 1,
                    }]
                });

            } catch (err: any) {
                setError(err.message || "Failed to load report data.");
            } finally {
                setLoading(false);
            }
        };
        
        processData();
    }, []);

    if (loading) {
        return <ReportsPageSkeleton />;
    }
    
    if (error) {
        return <div className="text-center py-10 bg-red-50 text-red-700 rounded-lg"><p>{error}</p></div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-neutral-darkest">Reports & Insights</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {revenueData?.datasets[0]?.data.length > 0 ? (
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
                        <RevenueChart data={revenueData} />
                    </div>
                ) : <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg flex items-center justify-center text-neutral-500 min-h-[20rem]">No revenue data yet.</div>}
                 {statusData?.datasets[0]?.data.length > 0 ? (
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg flex items-center justify-center">
                        <div className="max-w-xs mx-auto">
                            <StatusDoughnutChart data={statusData} />
                        </div>
                    </div>
                ) : <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg flex items-center justify-center text-neutral-500 min-h-[20rem]">No invoice status data yet.</div>}
                {topClientsData?.datasets[0]?.data.length > 0 ? (
                    <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow-lg">
                        <TopClientsChart data={topClientsData} />
                    </div>
                ) : <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow-lg flex items-center justify-center text-neutral-500 min-h-[20rem]">No client revenue data yet.</div>}
            </div>
        </div>
    );
};

export default ReportsPage;
