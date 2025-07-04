
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRightIcon } from '../icons/ArrowRightIcon.tsx';

const { Link } = ReactRouterDOM;

interface StatCardProps {
  title: string;
  value: string;
  label?: string;
  icon: React.ReactElement;
  variant?: 'primary' | 'default';
  footerLink?: { to: string; text: string; };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, label, icon, variant = 'default', footerLink, className = '' }) => {
  const isPrimary = variant === 'primary';

  const cardClasses = `
    p-6 rounded-2xl flex flex-col transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden min-h-[170px] shadow-md hover:shadow-xl
    ${isPrimary ? 'bg-gradient-to-br from-slate-800 to-black text-white hover:shadow-purple-400/20' : 'bg-white text-slate-800 border border-slate-100/80 hover:border-slate-200'}
    ${className}
  `;

  const valueClasses = `text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isPrimary ? 'text-white' : 'text-slate-900'}`;
  const titleClasses = `text-xs sm:text-sm font-semibold uppercase tracking-wider ${isPrimary ? 'text-slate-400' : 'text-slate-500'}`;
  const labelClasses = `text-xs mt-1 leading-tight ${isPrimary ? 'text-slate-400' : 'text-slate-500'}`;
  const linkClasses = `text-xs font-semibold flex items-center transition-colors duration-200 ${isPrimary ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`;

  return (
    <div className={cardClasses}>
      {/* Decorative Icon - bigger, better placed, and with enhanced hover effect */}
      <div className={`absolute -top-4 -right-8 w-32 h-32 opacity-[.08] transition-all duration-500 ease-in-out group-hover:scale-125 group-hover:opacity-[.15] ${isPrimary ? 'text-white' : 'text-slate-800'}`}>
        {icon}
      </div>

      <div className="relative z-10 flex-grow">
        <p className={titleClasses}>{title}</p>
        <p className={valueClasses}>{value}</p>
        {label && <p className={labelClasses}>{label}</p>}
      </div>
      
      {footerLink && (
        <div className="relative z-10 mt-auto">
            <Link to={footerLink.to} className={linkClasses}>
              <span>{footerLink.text}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
      )}
    </div>
  );
};

export default StatCard;
