
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon'; 
import { usePlans } from '../contexts/PlanContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient'; // For invoking functions
import { PlanData } from '../types';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center">
    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const PricingPage: React.FC = () => {
  const { plans, loading } = usePlans();
  const { user, refreshAuthStatus } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState<string | null>(null); // Store planId being processed
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handlePlanPurchase = async (plan: PlanData) => {
    if (!user) {
        navigate('/auth');
        return;
    }

    setIsProcessing(plan.id);
    setPaymentStatus('idle');
    setStatusMessage('');

    try {
        // Step 1: Create a Razorpay order from the backend
        const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
            body: { planId: plan.id, amount: plan.price, currency: 'INR' },
        });

        if (orderError || !orderData) {
            throw new Error(orderError?.message || 'Failed to create payment order.');
        }

        const { order } = orderData;
        
        // Step 2: Open Razorpay Checkout
        const options = {
            key: orderData.razorpayKeyId, // Your Razorpay Key ID from backend
            amount: order.amount,
            currency: order.currency,
            name: 'Invoice Maker by LinkFC',
            description: `Purchase of ${plan.name} Plan`,
            order_id: order.id,
            handler: async (response: any) => {
                // Step 3: Verify the payment on the backend
                 const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-razorpay-payment', {
                    body: {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        planId: plan.id,
                    }
                 });

                 if(verificationError || !verificationData?.success) {
                    setPaymentStatus('error');
                    setStatusMessage('Payment verification failed. Please contact support.');
                 } else {
                    setPaymentStatus('success');
                    setStatusMessage(`Successfully upgraded to the ${plan.name} plan! Redirecting...`);
                    await refreshAuthStatus(); // Refresh user metadata
                    setTimeout(() => navigate('/dashboard'), 2000);
                 }
            },
            prefill: {
                name: user.email,
                email: user.email,
            },
            notes: {
                plan_id: plan.id,
                user_id: user.id,
            },
            theme: {
                color: '#3B82F6',
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any){
            setPaymentStatus('error');
            setStatusMessage(`Payment failed: ${response.error.description}. Please try again.`);
        });
        rzp.open();

    } catch (error: any) {
        setPaymentStatus('error');
        setStatusMessage(error.message || 'An unexpected error occurred.');
        console.error("Payment initiation error:", error);
    } finally {
        setIsProcessing(null);
    }
  };

  if (loading && plans.length === 0) {
    return <div className="text-center py-20"><p className="text-xl">Loading plans...</p></div>;
  }
  
  const userPlanId = user?.user_metadata?.planId || 'free_tier';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-darkest mb-4">
          Find the Perfect Plan
        </h1>
        <p className="text-lg sm:text-xl text-neutral-DEFAULT max-w-2xl mx-auto">
          Choose the plan that best suits your invoicing needs. Paid plans feature whitelabeling (no "Powered by" branding).
        </p>
         {paymentStatus !== 'idle' && (
            <div className={`mt-4 p-3 rounded-md text-sm ${paymentStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {statusMessage}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map(plan => {
          const isCurrentPlan = plan.id === userPlanId;
          const isProcessingThisPlan = isProcessing === plan.id;
          const buttonText = isCurrentPlan ? 'Current Plan' : plan.cta_text;

          return (
            <div 
              key={plan.id} 
              className={`bg-white p-8 rounded-xl shadow-2xl flex flex-col border-2 transition-all duration-300 transform hover:scale-105
                          ${plan.variant === 'primary' ? 'border-primary-DEFAULT' : 'border-neutral-light/50'}`}
            >
              <h2 className={`text-2xl font-semibold mb-2 ${plan.variant === 'primary' ? 'text-primary-DEFAULT' : 'text-neutral-darkest'}`}>
                {plan.name}
              </h2>
              <p className="text-4xl font-bold mb-1 text-neutral-darkest">
                {plan.price !== '0' && '₹'}{plan.price}
                {plan.price !== '0' && <span className="text-lg font-normal text-neutral-DEFAULT">{plan.price_suffix}</span>}
              </p>
              <p className="text-xs text-neutral-DEFAULT mb-6">
                {plan.name === 'Free' ? 'Perfect for starting out' : plan.name === 'Pro' ? 'For growing businesses' : 'For large scale operations'}
              </p>
              
              <ul className="text-left space-y-3 mb-8 text-neutral-dark text-sm flex-grow">
                {plan.features.map((feature, index) => <PlanFeature key={`${plan.id}-feature-${index}`}>{feature}</PlanFeature>)}
              </ul>
              
               {plan.name === 'Enterprise' ? (
                  <Button 
                    variant={plan.variant || 'secondary'} 
                    className={`w-full mt-auto ${plan.variant === 'primary' ? '!py-3' : ''}`}
                    onClick={() => window.location.href = 'mailto:support@linkfc.com'}
                   >
                    Contact Us
                  </Button>
               ) : (
                  <Button 
                    variant={plan.variant || 'secondary'} 
                    className={`w-full mt-auto ${plan.variant === 'primary' ? '!py-3' : ''}`}
                    disabled={isCurrentPlan || isProcessingThisPlan || (!!isProcessing && !isProcessingThisPlan)}
                    onClick={() => handlePlanPurchase(plan)}
                  >
                    {isProcessingThisPlan ? 'Processing...' : buttonText}
                  </Button>
               )}
            </div>
          )
        })}
      </div>
      
       <div className="text-center mt-16">
          <p className="text-neutral-DEFAULT">All prices are in INR. Payments are processed securely by Razorpay.</p>
      </div>
    </div>
  );
};
export default PricingPage;