

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon.tsx';

const { Outlet, Link, useLocation } = ReactRouterDOM;

const CreateInvoiceLayout: React.FC = () => {
    const location = useLocation();
    return (
    <div className="bg-slate-50 min-h-screen">
        <header className="bg-white sticky top-0 z-30 shadow-sm no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-primary transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Dashboard
            </Link>
            {/* Future save status can go here */}
            </div>
        </div>
        </header>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div key={location.pathname} className="page-fade-in">
             <Outlet />
            </div>
        </main>
    </div>
    );
};

export default CreateInvoiceLayout;