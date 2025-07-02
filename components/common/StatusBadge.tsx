
import React, { useState, useRef, useEffect } from 'react';
import { InvoiceStatus } from '../../types.ts';
import { ChevronDownIcon } from '../icons/ChevronDownIcon.tsx';

interface StatusBadgeProps {
  status: InvoiceStatus;
  onStatusChange: (newStatus: InvoiceStatus) => void;
}

const statusConfig: Record<InvoiceStatus, { label: string; colorClasses: string }> = {
  draft: { label: 'Draft', colorClasses: 'bg-slate-100 text-slate-700' },
  sent: { label: 'Sent', colorClasses: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Viewed', colorClasses: 'bg-purple-100 text-purple-700' },
  paid: { label: 'Paid', colorClasses: 'bg-green-100 text-green-700' },
  partially_paid: { label: 'Partially Paid', colorClasses: 'bg-yellow-100 text-yellow-700' },
  overdue: { label: 'Overdue', colorClasses: 'bg-red-100 text-red-700' },
  accepted: { label: 'Accepted', colorClasses: 'bg-teal-100 text-teal-700' },
  declined: { label: 'Declined', colorClasses: 'bg-orange-100 text-orange-700' },
};

const statusOptions: InvoiceStatus[] = ['draft', 'sent', 'paid', 'partially_paid', 'overdue'];
// Add quote-specific statuses if needed, or handle contextually
// const quoteStatusOptions: InvoiceStatus[] = ['draft', 'sent', 'accepted', 'declined'];

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { label, colorClasses } = statusConfig[status] || statusConfig.draft;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStatus = (newStatus: InvoiceStatus) => {
    onStatusChange(newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${colorClasses}`}
      >
        {label}
        <ChevronDownIcon className="w-3 h-3 ml-1.5" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {statusOptions.map((option) => (
              <a
                key={option}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectStatus(option);
                }}
                className={`block px-4 py-2 text-sm ${statusConfig[option].colorClasses.replace('bg-', 'hover:bg-').replace('text-', 'hover:text-')} transition-colors`}
                role="menuitem"
              >
                {statusConfig[option].label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBadge;
