
import React from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string;
  label?: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'default';
  footerLink?: { to: string; text: string; };
  children?: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, label, icon, variant = 'default', footerLink, children, className = '' }) => {
  const isPrimary = variant === 'primary';

  const cardClasses = `
    p-6 rounded-2xl shadow-lg flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 group
    ${isPrimary ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-800 border border-neutral-200/80'}
    ${className}
  `;

  const iconWrapperClasses = `
    w-12 h-12 flex items-center justify-center rounded-xl mb-4
    ${isPrimary ? 'bg-white/10 text-white' : 'bg-slate-100 text-neutral-700'}
  `;

  return (
    <div className={cardClasses}>
      <div>
        <div className={iconWrapperClasses}>
          {icon}
        </div>
        <p className={`text-sm font-medium ${isPrimary ? 'text-neutral-400' : 'text-neutral-500'}`}>{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {label && <p className={`text-xs mt-1 ${isPrimary ? 'text-neutral-400' : 'text-neutral-500'}`}>{label}</p>}
      </div>
      {children}
      {footerLink && (
        <Link to={footerLink.to} className={`mt-4 text-xs font-semibold flex items-center group-hover:underline ${isPrimary ? 'text-neutral-300' : 'text-neutral-600'}`}>
          {footerLink.text}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      )}
    </div>
  );
};

export default StatCard;
