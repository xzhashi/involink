import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button.tsx';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon.tsx'; 
import { usePlans } from '../contexts/PlanContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { createOrder } from '../services/razorpayService.ts';

declare const Razorpay: any;

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center">
    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plans, loading: plansLoading, currentUserPlan, changePlan: changePlanContext, processing: planProcessing } = usePlans();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleChoosePlan = async (planId: string, amount: string, currency: string) => {
    if (!user) {
        navigate('/auth?from=/pricing');
        return;
    }
    
    // For free plans, just update context
    if (amount === '0') {
        setProcessingPlanId(planId);
        await changePlanContext(planId);
        setProcessingPlanId(null);
        return;
    }

    setProcessingPlanId(planId);
    setPaymentError(null);

    try {
        const orderData = await createOrder(planId, parseFloat(amount), currency);

        if (!orderData || !orderData.id) {
            throw new Error("Could not create payment order.");
        }

        const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Invoice Maker by LinkFC",
            description: `Payment for ${orderData.notes.plan_name} Plan`,
            order_id: orderData.id,
            handler: async function (response: any) {
                // The verification should be done in the PlanContext or a dedicated service
                // For now, we assume verification happens and then we update the plan
                await changePlanContext(planId);
                navigate('/dashboard'); // Redirect to a success page or dashboard
            },
            prefill: {
                name: user.email, // Or a proper name field if you have one
                email: user.email,
            },
            notes: {
                plan_id: planId,
                user_id: user.id
            },
            theme: {
                color: "#3B82F6"
            }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response: any){
            setPaymentError(`Payment failed: ${response.error.description}`);
        });

        rzp.open();

    } catch (error: any) {
        setPaymentError(error.message || "An unexpected error occurred during payment.");
    } finally {
        setProcessingPlanId(null);
    }
  };
  
  if (plansLoading) {
    return (
        <div className="container mx-auto px-4 py-12 animate-pulse">
            <div className="text-center mb-16">
                <div className="h-12 bg-slate-200 rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-8 rounded-xl shadow-2xl space-y-6">
                        <div className="h-7 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-10 bg-slate-200 rounded w-1/2"></div>
                        <div className="space-y-3 pt-4">
                            <div className="h-5 bg-slate-200 rounded"></div>
                            <div className="h-5 bg-slate-200 rounded"></div>
                            <div className="h-5 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-12 bg-slate-200 rounded-md mt-6"></div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-darkest mb-4">
          Find the Perfect Plan
        </h1>
        <p className="text-lg sm:text-xl text-neutral-DEFAULT max-w-2xl mx-auto">
          Choose the plan that best suits your invoicing needs. Paid plans remove branding and unlock unlimited invoices.
        </p>
         {paymentError && <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md mt-4 max-w-xl mx-auto">{paymentError}</p>}
         <p className="text-sm text-accent-DEFAULT mt-2">(Payment processing via Razorpay is now live for INR transactions.)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map(plan => {
          const isCurrent = currentUserPlan?.id === plan.id;
          const isProcessingThisPlan = processingPlanId === plan.id || (planProcessing && currentUserPlan?.id === plan.id);
          const currency = plan.price_suffix.toLowerCase().includes('mo') ? 'INR' : 'USD'; // Simple logic, assumes INR for paid plans

          return (
            <div 
              key={plan.id} 
              className={`bg-white p-8 rounded-xl shadow-2xl flex flex-col border-2 transition-all duration-300 transform hover:scale-105
                          ${plan.variant === 'primary' ? 'border-primary-DEFAULT' : 'border-neutral-light/50'}
                          ${isCurrent ? 'ring-4 ring-offset-2 ring-secondary-DEFAULT' : ''}`}
            >
              <h2 className={`text-2xl font-semibold mb-2 ${plan.variant === 'primary' ? 'text-primary-DEFAULT' : 'text-neutral-darkest'}`}>
                {plan.name}
              </h2>
              <p className="text-4xl font-bold mb-1 text-neutral-darkest">
                ${plan.price}
                {plan.price !== '0' && <span className="text-lg font-normal text-neutral-DEFAULT">{plan.price_suffix}</span>}
              </p>
              <p className="text-xs text-neutral-DEFAULT mb-6">
                {plan.name === 'Free' ? 'Perfect for starting out' : plan.name === 'Pro' ? 'For growing businesses' : 'For large scale operations'}
              </p>
              
              <ul className="text-left space-y-3 mb-8 text-neutral-dark text-sm flex-grow">
                {plan.features.map((feature, index) => <PlanFeature key={`${plan.id}-feature-${index}`}>{feature}</PlanFeature>)}
              </ul>

              <Button 
                variant={isCurrent ? 'secondary' : (plan.variant || 'secondary')} 
                className={`w-full mt-auto ${plan.variant === 'primary' && !isCurrent ? '!py-3' : ''}`}
                disabled={isCurrent || planProcessing || isProcessingThisPlan}
                onClick={() => handleChoosePlan(plan.id, plan.price, currency)}
              >
                {isProcessingThisPlan ? 'Processing...' : (isCurrent ? 'Current Plan' : plan.cta_text)}
              </Button>
            </div>
          );
        })}
      </div>
      
      <div className="text-center mt-16">
          <p className="text-neutral-DEFAULT">Need something different? <a href="mailto:support@linkfc.com" className="text-primary-DEFAULT hover:underline">Contact us</a> for custom solutions.</p>
      </div>
    </div>
  );
};
export default PricingPage;