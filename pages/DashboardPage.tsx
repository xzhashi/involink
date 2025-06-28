import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon } from '../components/icons/EyeIcon'; // Placeholder, can be used for "View Invoices"
import { PlusIcon } from '../components/icons/PlusIcon';


const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-darkest mb-6">Dashboard</h1>
      <p className="mb-8 text-lg text-neutral-dark">Welcome back, <span className="font-semibold text-primary-DEFAULT">{user?.email || 'User'}</span>!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-neutral-darkest mb-4 border-b pb-2">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/invoices">
              <Button variant="secondary" className="w-full justify-start text-left" leftIcon={<EyeIcon className="w-5 h-5"/>}>
                View My Invoices
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="primary" className="w-full justify-start text-left" leftIcon={<PlusIcon className="w-5 h-5"/>}>
                Create New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Invoice Stats Card (Placeholder) */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-neutral-darkest mb-4 border-b pb-2">Invoice Stats</h2>
          <p className="text-neutral-DEFAULT">Summary of your invoicing activity will appear here.</p>
          <p className="text-sm text-accent-DEFAULT mt-3">(Coming Soon)</p>
        </div>
        
        {/* Settings Card (Placeholder) */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-neutral-darkest mb-4 border-b pb-2">Account</h2>
           <Link to="/settings">
              <Button variant="ghost" className="w-full justify-start text-left">
                Go to Settings
              </Button>
            </Link>
           <Link to="/pricing">
              <Button variant="ghost" className="w-full justify-start text-left mt-2">
                View Plans
              </Button>
            </Link>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;