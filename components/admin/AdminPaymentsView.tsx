
import React from 'react';
import Input from '../common/Input';

// Mock payment data
const mockPayments = [
  { id: 'pay_1', userId: 'usr_1', plan: 'Pro Tier', amount: 15.00, currency: 'USD', date: '2023-04-01', status: 'Succeeded', gatewayId: 'pi_3Pabc...' },
  { id: 'pay_2', userId: 'usr_3', plan: 'Pro Tier', amount: 15.00, currency: 'USD', date: '2023-04-05', status: 'Failed', gatewayId: 'pi_3Pdef...' },
  { id: 'pay_3', userId: 'usr_1', plan: 'Pro Tier', amount: 15.00, currency: 'USD', date: '2023-05-01', status: 'Succeeded', gatewayId: 'pi_3Pfgh...' },
];

const AdminPaymentsView: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-darkest mb-8">Payment Transactions</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
           <Input 
            placeholder="Search payments (User ID, Transaction ID)..." 
            type="search"
            aria-label="Search payments"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-neutral-dark">
            <thead className="text-xs text-neutral-DEFAULT uppercase bg-neutral-lightest">
              <tr>
                <th scope="col" className="px-6 py-3">Transaction ID</th>
                <th scope="col" className="px-6 py-3">User Email/ID</th>
                <th scope="col" className="px-6 py-3">Plan</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Status</th>
                {/* <th scope="col" className="px-6 py-3">Gateway ID</th> */}
              </tr>
            </thead>
            <tbody>
              {mockPayments.map(payment => (
                <tr key={payment.id} className="bg-white border-b hover:bg-neutral-lightest">
                  <td className="px-6 py-4 font-medium text-neutral-darkest">{payment.id}</td>
                  <td className="px-6 py-4">{/* Find user email from userId */}User ({payment.userId.substring(0,6)})</td>
                  <td className="px-6 py-4">{payment.plan}</td>
                  <td className="px-6 py-4">{payment.currency} {payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{payment.date}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'Succeeded' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 text-xs">{payment.gatewayId}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-DEFAULT mt-4">Payment list is illustrative. Full functionality requires payment gateway integration.</p>
      </div>
    </div>
  );
};

export default AdminPaymentsView;
