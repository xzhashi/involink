
import React, { useEffect, useRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  indeterminate?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, indeterminate, ...props }) => {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = indeterminate;
    }
  }, [ref, indeterminate]);

  return (
    <div className="flex items-center">
      <input
        id={id}
        ref={ref}
        name={id}
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-primary-DEFAULT focus:ring-primary-dark focus:ring-offset-0 transition"
        {...props}
      />
      {label && (
        <label htmlFor={id} className="ml-2 block text-sm text-slate-600">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
