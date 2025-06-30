import React, { useState, useEffect } from 'react';
import { AdminDashboardStats } from '../../types.ts';
import { fetchAdminDashboardStats } from '../../services/adminService.ts';

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
      <h1 className="text-3xl font-bold text-neutral-darkest mb-8">Admin Dashboard</h1>
      
      {loading && (
        <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-md h-28">
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                  </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md h-48"></div>
              <div className="bg-white p-6 rounded-lg shadow-md h-48"></div>
            </div>
        </div>
      )}
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Users" value={stats?.totalUsers?.toLocaleString() ?? 'N/A'} isError={stats?.totalUsers === undefined} />
            <StatCard title="Active Subscriptions" value={stats?.activeSubscriptions?.toLocaleString() ?? 'N/A'} isError={stats?.activeSubscriptions === undefined}/>
            <StatCard title="Monthly Revenue (Simulated)" value={`$${stats?.monthlyRevenue?.toLocaleString() ?? '0'}`} />
            <StatCard title="Invoices This Month" value={stats?.invoicesGeneratedThisMonth?.toLocaleString() ?? 'N/A'} isError={stats?.invoicesGeneratedThisMonth === undefined}/>
          </div>
          <p className="text-xs text-neutral-DEFAULT mb-6">
            Note: User-related stats (Total Users, Active Subscriptions) require backend Edge Functions to be implemented. Invoice count requires appropriate RLS.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-neutral-darkest mb-4">Recent Activity (Demo)</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="text-neutral-dark">User 'john.doe@example.com' invited.</li>
                <li className="text-neutral-dark">Plan 'Pro Tier' was updated.</li>
                <li className="text-neutral-dark">Invoice #INV-2024-1050 created by user X.</li>
              </ul>
               <p className="text-xs text-neutral-DEFAULT mt-3">This is a placeholder for real-time activity feed.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-neutral-darkest mb-4">System Status</h2>
              <p className="text-green-600 font-semibold">All systems (simulated) operational.</p>
              <p className="text-xs text-neutral-DEFAULT mt-1">Mock status. Real monitoring needed for production.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; isError?: boolean }> = ({ title, value, isError }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h3 className="text-sm font-medium text-neutral-DEFAULT uppercase tracking-wider">{title}</h3>
    <p className={`text-3xl font-semibold mt-1 ${isError ? 'text-red-500' : 'text-primary-DEFAULT'}`}>
      {isError ? 'Error' : value}
    </p>
  </div>
);

export default AdminDashboardView;