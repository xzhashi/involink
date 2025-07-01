import React, { useState, useEffect } from 'react';
import Input from '../common/Input.tsx';
import { Payment } from '../../types.ts';
import { fetchPaymentsAdmin } from '../../services/adminService.ts';
import { usePlans } from '../../contexts/PlanContext.tsx';

const AdminPaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { plans } = usePlans();

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPaymentsAdmin();
        setPayments(data);
      } catch (e: any) {
        setError(e.message || "An error occurred while fetching payment records. Please ensure the 'payments' table exists and RLS policies allow access.");
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const getPlanName = (planId: string) => {
    return plans.find(p => p.id === planId)?.name || planId;
  };

  const filteredPayments = payments.filter(payment =>
    payment.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.order_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-darkest mb-8">Payment Transactions</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
           <Input 
            placeholder="Search by User ID, Payment ID, or Order ID..." 
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search payments"
          />
        </div>

        {loading && <p className="text-center py-4">Loading payment history...</p>}
        {error && <p className="text-center py-4 text-red-500 bg-red-100 rounded-md p-3">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-neutral-dark">
              <thead className="text-xs text-neutral-DEFAULT uppercase bg-neutral-lightest">
                <tr>
                  <th scope="col" className="px-6 py-3">Payment ID</th>
                  <th scope="col" className="px-6 py-3">User ID</th>
                  <th scope="col" className="px-6 py-3">Plan</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Order ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? filteredPayments.map(payment => (
                  <tr key={payment.id} className="bg-white border-b hover:bg-neutral-lightest">
                    <td className="px-6 py-4 font-medium text-neutral-darkest whitespace-nowrap" title={payment.id}>{payment.id.substring(0, 14)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap" title={payment.user_id}>{payment.user_id.substring(0, 15)}...</td>
                    <td className="px-6 py-4">{getPlanName(payment.plan_id)}</td>
                    <td className="px-6 py-4">{payment.currency} {payment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">{payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        payment.status === 'successful' ? 'bg-green-100 text-green-700' : 
                        payment.status === 'created' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap" title={payment.order_id}>{payment.order_id}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-neutral-DEFAULT">No payments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentsView;