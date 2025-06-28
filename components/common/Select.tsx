
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  options: { value: string | number; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, error, options, className = '', wrapperClassName = '', ...props }) => {
  const baseStyles = 'block w-full pl-3 pr-10 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed text-slate-700 bg-white';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:border-primary-DEFAULT';

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-dark mb-1">{label}</label>}
      <select
        id={id}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;