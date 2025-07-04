
import React, { useMemo } from 'react';
import { InvoiceTemplateInfo, PlanData } from '../../types.ts';
import { usePlans } from '../../contexts/PlanContext.tsx';

interface TemplateSwitcherProps {
  templates: InvoiceTemplateInfo[];
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  isInitialChoice?: boolean; // Added to allow different styling/layout for initial choice
}

const TemplateSwitcher: React.FC<TemplateSwitcherProps> = ({ templates, selectedTemplateId, onSelectTemplate, isInitialChoice }) => {
  const { currentUserPlan } = usePlans();
  
  const templatesToShow = useMemo(() => {
    if (currentUserPlan?.premium_templates) {
        return templates;
    }
    return templates.filter(t => !t.isPremium);
  }, [templates, currentUserPlan]);

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${isInitialChoice ? 'max-w-3xl mx-auto' : ''}`}>
      <h2 className={`text-xl font-semibold text-neutral-darkest mb-4 ${isInitialChoice ? 'text-center' : ''}`}>
        {isInitialChoice ? 'Select a Starting Point' : 'Choose a Template'}
      </h2>
      <div className={`grid grid-cols-1 ${isInitialChoice ? 'sm:grid-cols-2 md:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
        {templatesToShow.map(template => (
          <div
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            aria-label={`Select ${template.name} template`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectTemplate(template.id)}}
            className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 ease-in-out group hover:shadow-xl
                        ${selectedTemplateId === template.id ? 'border-primary-DEFAULT shadow-lg scale-105' : 'border-neutral-light hover:border-primary-light'}`}
          >
             {template.isPremium && !currentUserPlan?.premium_templates && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full z-10">
                    PRO
                </div>
            )}
            <img 
              src={template.thumbnailUrl} 
              alt={`${template.name} template thumbnail`} 
              className="w-full h-32 object-cover group-hover:opacity-85 transition-opacity" 
            />
            <div className="p-3">
              <h3 className={`font-medium text-sm ${selectedTemplateId === template.id ? 'text-primary-dark' : 'text-neutral-darkest'}`}>{template.name}</h3>
              {isInitialChoice && <p className="text-xs text-neutral-DEFAULT mt-1">{template.description}</p>}
            </div>
          </div>
        ))}
      </div>
      {!currentUserPlan?.premium_templates && (
          <p className="text-center text-xs text-neutral-500 mt-4">
              Upgrade to a Pro plan to unlock all premium templates!
          </p>
      )}
    </div>
  );
};

export default TemplateSwitcher;
