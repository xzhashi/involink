import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button.tsx';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon.tsx'; 
import { usePlans } from '../contexts/PlanContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center">
    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plans, loading: plansLoading, currentUserPlan, changePlan, processing: planProcessing } = usePlans();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const handleChoosePlan = async (planId: string) => {
    if (!user) {
        navigate('/auth');
        return;
    }
    setProcessingPlanId(planId);
    await changePlan(planId);
    setProcessingPlanId(null);
  };
  
  if (plansLoading) {
    return <div className="text-center py-20"><p className="text-xl">Loading plans...</p></div>;
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
         <p className="text-sm text-accent-DEFAULT mt-2">(Payment processing is illustrative and coming soon! For now, you can switch plans freely.)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map(plan => {
          const isCurrent = currentUserPlan?.id === plan.id;
          const isProcessingThisPlan = processingPlanId === plan.id;

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
                disabled={isCurrent || planProcessing}
                onClick={() => handleChoosePlan(plan.id)}
              >
                {isProcessingThisPlan ? 'Switching...' : (isCurrent ? 'Current Plan' : plan.cta_text)}
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