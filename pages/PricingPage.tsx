
import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/common/Button.tsx';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon.tsx'; 
import { SparklesIcon } from '../components/icons/SparklesIcon.tsx';
import { UserGroupIcon } from '../components/icons/UserGroupIcon.tsx';
import { StarIcon } from '../components/icons/StarIcon.tsx';
import { usePlans } from '../contexts/PlanContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLocalization } from '../contexts/LocalizationContext.tsx';
import { createOrder } from '../services/razorpayService.ts';
import { PlanData } from '../types.ts';

const { Link, useNavigate } = ReactRouterDOM;

declare const Razorpay: any;

const PlanFeature: React.FC<{ children: React.ReactNode, isPrimary: boolean }> = ({ children, isPrimary }) => (
  <li className="flex items-start">
    <CheckCircleIcon className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${isPrimary ? 'text-purple-400' : 'text-green-500'}`} />
    <span>{children}</span>
  </li>
);

const PlanCard: React.FC<{
  plan: PlanData;
  isCurrent: boolean;
  isProcessing: boolean;
  onChoose: () => void;
  currencySymbol: string;
  billingCycle: 'monthly' | 'annually';
}> = ({ plan, isCurrent, isProcessing, onChoose, currencySymbol, billingCycle }) => {
    const isPrimary = plan.variant === 'primary';
    const PlanIcon = plan.name.toLowerCase().includes('pro') ? StarIcon 
                   : plan.name.toLowerCase().includes('starter') ? UserGroupIcon 
                   : SparklesIcon;

    return (
        <div 
            className={`
                p-8 rounded-2xl flex flex-col transition-all duration-300 transform 
                ${isPrimary ? 'bg-gradient-to-br from-slate-800 to-black text-white shadow-2xl shadow-purple-500/20' : 'bg-white text-slate-800 border border-slate-100 shadow-xl'}
                ${isCurrent ? 'ring-4 ring-offset-2 ring-green-400' : 'hover:-translate-y-2'}
            `}
        >
            <div className="flex items-center gap-4 mb-6">
                <div className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    ${isPrimary ? 'bg-purple-500/20' : 'bg-purple-100'}
                `}>
                    <PlanIcon className={`w-7 h-7 ${isPrimary ? 'text-purple-300' : 'text-purple-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${isPrimary ? 'text-white' : 'text-slate-800'}`}>
                    {plan.name}
                </h2>
            </div>
            
            <div className="flex items-baseline mb-1">
                <p className={`text-4xl md:text-5xl font-extrabold ${isPrimary ? 'text-white' : 'text-slate-900'}`}>
                    {currencySymbol}{plan.price}
                </p>
                {plan.price !== '0' && <span className={`ml-2 text-lg font-medium ${isPrimary ? 'text-slate-400' : 'text-slate-500'}`}>{plan.price_suffix}</span>}
            </div>
            
            <p className={`text-xs mb-8 ${isPrimary ? 'text-slate-400' : 'text-slate-500'}`}>
                {plan.id === 'free_tier' ? 'Perfect for starting out' : billingCycle === 'monthly' ? 'Billed monthly' : 'Billed annually'}
            </p>
            
            <ul className={`space-y-3 mb-8 flex-grow text-sm ${isPrimary ? 'text-slate-300' : 'text-slate-600'}`}>
                {plan.features.map((feature, index) => <PlanFeature key={`${plan.id}-feature-${index}`} isPrimary={isPrimary}>{feature}</PlanFeature>)}
            </ul>

            <Button 
                variant={isCurrent ? 'secondary' : (isPrimary ? 'primary' : 'secondary')} 
                className={`w-full mt-auto ${isPrimary && !isCurrent ? '!py-3' : ''} ${isCurrent ? '!bg-green-100 !text-green-800 cursor-not-allowed hover:!bg-green-100' : ''}`}
                disabled={isCurrent || isProcessing}
                onClick={onChoose}
            >
                {isProcessing ? 'Processing...' : (isCurrent ? 'Current Plan' : plan.cta_text)}
            </Button>
        </div>
    );
};

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plans, loading: plansLoading, currentUserPlan, changePlan: changePlanContext, processing: planProcessing } = usePlans();
  const { currency: userCurrency, countryCode, loading: localizationLoading } = useLocalization();

  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const handleChoosePlan = async (planId: string, amount: string) => {
    if (!user) {
        navigate('/auth?mode=login&from=/pricing'); // Redirect to login if not authenticated
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
    
    const isIndianPlan = planId.endsWith('_inr');
    const currency = isIndianPlan ? 'INR' : 'USD'; 

    if (typeof Razorpay === 'undefined') {
        setPaymentError("Payment gateway is not ready. Please wait a moment and try again.");
        setProcessingPlanId(null);
        return;
    }


    try {
        const orderData = await createOrder(planId, parseFloat(amount), currency);

        if (!orderData || !orderData.id) {
            throw new Error("Could not create payment order. Response from server was invalid.");
        }

        const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Invoice Maker by LinkFC",
            description: `Payment for ${orderData.notes.plan_name || 'Selected Plan'}`,
            order_id: orderData.id,
            handler: async function (response: any) {
                await changePlanContext(planId, {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                });
                navigate('/dashboard'); 
            },
            prefill: {
                name: user.email, 
                email: user.email,
            },
            notes: {
                plan_id: planId,
                user_id: user.id
            },
            theme: {
                color: "#3B82F6"
            },
            modal: {
                ondismiss: function() {
                    setProcessingPlanId(null);
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response: any){
            setPaymentError(`Payment failed: ${response.error.description || 'An unknown error occurred.'}`);
            setProcessingPlanId(null);
        });

        rzp.open();

    } catch (error: any) {
        setPaymentError(error.message || "An unexpected error occurred during payment initiation. Please check the browser console for more details.");
        setProcessingPlanId(null);
    }
  };
  
  const displayedPlans = useMemo(() => {
    if (plansLoading || localizationLoading) return [];
    
    const isIndianUser = countryCode === 'IN';
    
    return plans.filter(p => {
        const isFree = p.id === 'free_tier';
        if (isFree) return true;

        const isCorrectCycle = p.billing_cycle === billingCycle;
        if (!isCorrectCycle) return false;

        const isIndianPlan = p.id.endsWith('_inr');
        
        return isIndianUser ? isIndianPlan : !isIndianPlan;
    });
  }, [plans, billingCycle, countryCode, plansLoading, localizationLoading]);


  if (plansLoading || localizationLoading) {
    return (
        <div className="container mx-auto px-4 py-12 animate-pulse">
            <div className="text-center mb-16">
                <div className="h-12 bg-slate-200 rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-2xl space-y-6">
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
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-darkest mb-4">
          Find the Perfect Plan
        </h1>
        <p className="text-lg sm:text-xl text-neutral-DEFAULT max-w-2xl mx-auto">
          Choose the plan that best suits your invoicing needs. Paid plans remove branding and unlock unlimited invoices.
        </p>
         {paymentError && <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md mt-4 max-w-xl mx-auto whitespace-pre-wrap">{paymentError}</p>}
         <p className="text-sm text-accent-DEFAULT mt-2">
            {userCurrency === 'INR' 
                ? '(All prices are in INR. Payments are processed securely via Razorpay.)'
                : '(All prices are in USD. Payments are processed securely via Razorpay.)'
            }
         </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-slate-100 p-1 rounded-full flex items-center space-x-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'bg-white text-primary-dark shadow' : 'text-neutral-600 hover:bg-slate-200/50'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annually')}
            className={`relative px-6 py-2 rounded-full text-sm font-semibold transition-colors ${billingCycle === 'annually' ? 'bg-white text-primary-dark shadow' : 'text-neutral-600 hover:bg-slate-200/50'}`}
          >
            Annually
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Save 16%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {displayedPlans.map(plan => {
          const isCurrent = currentUserPlan?.id === plan.id;
          const isProcessingThisPlan = processingPlanId === plan.id || (planProcessing && currentUserPlan?.id === plan.id);
          const currencySymbol = userCurrency === 'INR' ? '₹' : '$';

          return (
             <PlanCard 
              key={plan.id}
              plan={plan}
              isCurrent={isCurrent}
              isProcessing={isProcessingThisPlan}
              onChoose={() => handleChoosePlan(plan.id, plan.price)}
              currencySymbol={currencySymbol}
              billingCycle={billingCycle}
            />
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
