

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { DashboardIcon } from './icons/DashboardIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { UsersIcon } from './icons/UsersIcon.tsx';
import { UserCircleIcon } from './icons/UserCircleIcon.tsx';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon.tsx';

const NavItem: React.FC<{ to: string, icon: React.FC<any>, label: string }> = ({ to, icon: Icon, label }) => {
    const activeClass = "text-primary";
    const inactiveClass = "text-neutral-500";
    return (
        <NavLink to={to} className={({isActive}) => `flex flex-col items-center justify-center w-full transition-colors hover:text-primary ${isActive ? activeClass : inactiveClass}`}>
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">{label}</span>
        </NavLink>
    );
}

const BottomNavbar: React.FC = () => {
    const { isAdmin } = useAuth();
    return (
        <footer className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-slate-200">
            <div className="grid h-full grid-cols-5 mx-auto">
                <NavItem to="/dashboard" icon={DashboardIcon} label="Overview" />
                <NavItem to="/invoices" icon={DocumentTextIcon} label="Invoices" />
                
                <div className="flex items-center justify-center">
                    <NavLink to="/create" className="inline-flex items-center justify-center w-14 h-14 font-medium bg-primary rounded-full text-white -mt-6 shadow-lg hover:bg-primary-dark transition-all">
                        <PlusIcon className="w-8 h-8"/>
                    </NavLink>
                </div>

                <NavItem to="/clients" icon={UsersIcon} label="Clients" />
                {isAdmin ? (
                    <NavItem to="/admin" icon={ShieldCheckIcon} label="Admin" />
                ) : (
                    <NavItem to="/settings" icon={UserCircleIcon} label="Settings" />
                )}
            </div>
        </footer>
    );
};

export default BottomNavbar;