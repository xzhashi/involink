import React, { useState, useEffect } from 'react';
import { AdminDashboardStats } from '../../types.ts';
import { fetchAdminDashboardStats } from '../../services/adminService.ts';
import AdminStatCard from '../components/admin/AdminStatCard.tsx';
import { UserGroupIcon } from '../components/icons/UserGroupIcon.tsx';
import { BanknotesIcon } from '../components/icons/BanknotesIcon.tsx';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon.tsx';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon.tsx';


const AdminDashboardView: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedStats = await fetchAdminDashboardStats();
        setStats(fetchedStats);
      } catch (e: any) {
        setError("Failed to load dashboard statistics. Some data may be unavailable if backend functions (e.g., for user counts) are not yet implemented or RLS prevents access.");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8 tracking-tight">Dashboard Overview</h1>
      
      {loading && (
        <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-lg h-32">
                    <div className="flex items-center space-x-4">
                        <div className="h-14 w-14 bg-slate-200 rounded-full"></div>
                        <div className="space-y-2 flex-grow">
                             <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                             <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg h-48"></div>
              <div className="bg-white p-6 rounded-2xl shadow-lg h-48"></div>
            </div>
        </div>
      )}
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminStatCard 
                title="Total Users" 
                value={stats?.totalUsers?.toLocaleString() ?? 'N/A'} 
                isError={stats?.totalUsers === undefined} 
                icon={<UserGroupIcon className="w-7 h-7"/>}
                color="purple"
            />
            <AdminStatCard 
                title="Active Subscriptions" 
                value={stats?.activeSubscriptions?.toLocaleString() ?? 'N/A'} 
                isError={stats?.activeSubscriptions === undefined}
                icon={<CheckCircleIcon className="w-7 h-7"/>}
                color="green"
            />
            <AdminStatCard 
                title="Monthly Revenue (Simulated)" 
                value={`$${stats?.monthlyRevenue?.toLocaleString() ?? '0'}`} 
                icon={<BanknotesIcon className="w-7 h-7"/>}
                color="blue"
            />
            <AdminStatCard 
                title="Invoices This Month" 
                value={stats?.invoicesGeneratedThisMonth?.toLocaleString() ?? 'N/A'} 
                isError={stats?.invoicesGeneratedThisMonth === undefined}
                icon={<DocumentTextIcon className="w-7 h-7"/>}
                color="yellow"
            />
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Note: User-related stats (Total Users, Active Subscriptions) require backend Edge Functions to be implemented. Invoice count requires appropriate RLS.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
              <h2 className="text-xl font-semibold text-slate-700 mb-4">Recent Activity (Demo)</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="text-slate-600">User 'john.doe@example.com' invited.</li>
                <li className="text-slate-600">Plan 'Pro Tier' was updated.</li>
                <li className="text-slate-600">Invoice #INV-2024-1050 created by user X.</li>
              </ul>
               <p className="text-xs text-slate-400 mt-3">This is a placeholder for real-time activity feed.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
              <h2 className="text-xl font-semibold text-slate-700 mb-4">System Status</h2>
              <p className="text-green-600 font-semibold">All systems (simulated) operational.</p>
              <p className="text-xs text-slate-400 mt-1">Mock status. Real monitoring needed for production.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


export default AdminDashboardView;