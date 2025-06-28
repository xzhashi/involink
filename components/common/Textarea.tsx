
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, className = '', wrapperClassName = '', ...props }) => {
  const baseStyles = 'block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed text-slate-700 placeholder-slate-400 bg-white';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:border-primary-DEFAULT';
  
  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-dark mb-1">{label}</label>}
      <textarea
        id={id}
        className={`${baseStyles} ${errorStyles} ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;