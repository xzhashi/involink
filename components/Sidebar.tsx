
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import Button from './common/Button.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { DashboardIcon } from './icons/DashboardIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { UsersIcon } from './icons/UsersIcon.tsx';
import { ChartBarIcon } from './icons/ChartBarIcon.tsx';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon.tsx';
import { FilePlusIcon } from './icons/FilePlusIcon.tsx';
import { CogIcon } from './icons/CogIcon.tsx';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();

    const navItems = [
        { to: '/dashboard', icon: DashboardIcon, label: 'Overview' },
        { to: '/invoices', icon: DocumentTextIcon, label: 'Invoices' },
        { to: '/quotes', icon: DocumentTextIcon, label: 'Quotes' },
        { to: '/recurring', icon: CalendarDaysIcon, label: 'Recurring' },
        { to: '/clients', icon: UsersIcon, label: 'Clients' },
        { to: '/reports', icon: ChartBarIcon, label: 'Reports' },
    ];
    
    const commonLink = 'flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors';
    const activeLink = 'bg-primary text-white shadow-sm';
    const inactiveLink = 'text-neutral-600 hover:bg-slate-100 hover:text-primary';

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed top-0 left-0 h-full">
      <div className="flex items-center justify-center h-20 border-b border-slate-200">
         <Link to="/dashboard" className="flex items-center text-primary hover:opacity-80 transition-opacity">
            <SparklesIcon className="h-7 w-7 mr-2" />
            <span className="font-bold text-lg">Invoice Maker</span>
        </Link>
      </div>

      <nav className="flex-grow p-4 space-y-2">
         <Link to="/create">
            <Button variant="primary" className="w-full" leftIcon={<FilePlusIcon className="w-4 h-4"/>}>
                New Invoice
            </Button>
        </Link>
        <div className="pt-4 space-y-1">
            {navItems.map(item => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'} 
                    className={({ isActive }) => `${commonLink} ${isActive ? activeLink : inactiveLink}`}
                >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                </NavLink>
            ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
             <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.email}`} alt="profile" className="h-10 w-10 rounded-full" />
             <div className="flex-grow overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.email}</p>
                 <div className="flex space-x-2">
                    <Link to="/settings" className="text-xs text-neutral-500 hover:underline">Settings</Link>
                    <button onClick={() => logout()} className="text-xs text-neutral-500 hover:underline">Logout</button>
                 </div>
             </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
