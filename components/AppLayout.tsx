

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import BottomNavbar from './BottomNavbar.tsx';

const { Outlet, useLocation } = ReactRouterDOM;

const AppLayout: React.FC = () => {
    const location = useLocation();
    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="flex">
                <Sidebar />
                <main className="flex-grow p-4 sm:p-6 lg:p-8 md:ml-64 mb-16 md:mb-0">
                    <div key={location.pathname} className="page-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
            <BottomNavbar />
        </div>
    );
};
export default AppLayout;