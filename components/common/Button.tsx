import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  title?: string; // Added for accessibility
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  leftIcon, 
  rightIcon, 
  className = '', 
  title, // Destructure title
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-md';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary-light to-primary-DEFAULT hover:from-primary-DEFAULT hover:to-primary-dark text-white focus:ring-primary-DEFAULT',
    secondary: 'bg-gradient-to-r from-secondary-light to-secondary-DEFAULT hover:from-secondary-DEFAULT hover:to-secondary-dark text-white focus:ring-secondary-DEFAULT',
    danger: 'bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent text-primary-DEFAULT hover:bg-primary-light/20 focus:ring-primary-DEFAULT shadow-none hover:shadow-none',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      title={title} // Apply title attribute
      {...props}
    >
      {leftIcon && <span className="mr-2 -ml-0.5 h-5 w-5">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 -mr-0.5 h-5 w-5">{rightIcon}</span>}
    </button>
  );
};

export default Button;