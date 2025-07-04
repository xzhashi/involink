
import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePlans } from '../contexts/PlanContext.tsx';
import Button from './common/Button.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { DashboardIcon } from './icons/DashboardIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { UsersIcon } from './icons/UsersIcon.tsx';
import { ChartBarIcon } from './icons/ChartBarIcon.tsx';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon.tsx';
import { FilePlusIcon } from './icons/FilePlusIcon.tsx';
import { CogIcon } from './icons/CogIcon.tsx';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon.tsx';
import { CubeIcon } from './icons/CubeIcon.tsx';
import { CodeBracketIcon } from './icons/CodeBracketIcon.tsx';
import { ScaleIcon } from './icons/ScaleIcon.tsx';
import { UserGroupIcon } from './icons/UserGroupIcon.tsx';
import { PowerIcon } from './icons/PowerIcon.tsx';
import { ChevronUpIcon } from './icons/ChevronUpIcon.tsx';

const { NavLink, Link, useLocation } = ReactRouterDOM;

const Sidebar: React.FC = () => {
    const { user, logout, isAdmin } = useAuth();
    const { currentUserPlan } = usePlans();
    const location = useLocation();
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const hasTeamAccess = currentUserPlan?.team_member_limit && currentUserPlan.team_member_limit > 1;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setProfileMenuOpen(false);
    }, [location.pathname]);

    const navItems = [
        { to: '/dashboard', icon: DashboardIcon, label: 'Overview' },
        { to: '/invoices', icon: DocumentTextIcon, label: 'Invoices' },
        { to: '/quotes', icon: DocumentTextIcon, label: 'Quotes' },
        { to: '/recurring', icon: CalendarDaysIcon, label: 'Recurring' },
        { to: '/clients', icon: UsersIcon, label: 'Clients' },
        { to: '/products', icon: CubeIcon, label: 'Products & Services' },
        { to: '/taxes', icon: ScaleIcon, label: 'Taxes' },
    ];
    
    const proNavItems = [
        { to: '/team', icon: UserGroupIcon, label: 'Team', condition: hasTeamAccess },
        { to: '/reports', icon: ChartBarIcon, label: 'Reports', condition: currentUserPlan?.advanced_reports },
        { to: '/api-settings', icon: CodeBracketIcon, label: 'API Access', condition: currentUserPlan?.api_access },
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
            
            {(hasTeamAccess || currentUserPlan?.advanced_reports || currentUserPlan?.api_access) && <div className="pt-2 mt-2 border-t"></div>}
            
            {proNavItems.map(item => {
                if (!item.condition) return null;
                 return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `${commonLink} ${isActive ? activeLink : inactiveLink}`}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                    </NavLink>
                );
            })}

            {isAdmin && (
              <>
                <div className="pt-2 mt-4 border-t border-slate-200"></div>
                 <NavLink
                    to="/admin"
                    className={({ isActive }) => `${commonLink} ${isActive ? 'bg-rose-500 text-white' : 'text-neutral-600 hover:bg-rose-100 hover:text-rose-600'}`}
                  >
                    <ShieldCheckIcon className="w-5 h-5 mr-3" />
                    Admin Panel
                  </NavLink>
              </>
            )}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 relative" ref={menuRef}>
        {isProfileMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 p-2 bg-white rounded-lg shadow-xl border border-slate-200 z-10">
                <Link to="/settings" className="flex items-center w-full text-left px-3 py-2 text-sm rounded-md text-slate-700 hover:bg-slate-100">
                    <CogIcon className="w-5 h-5 mr-3 text-slate-500" />
                    Settings
                </Link>
                <div className="my-1 h-px bg-slate-100"></div>
                <button onClick={() => logout()} className="flex items-center w-full text-left px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50">
                    <PowerIcon className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        )}

        <button 
            onClick={() => setProfileMenuOpen(prev => !prev)} 
            className="flex items-center space-x-3 w-full text-left p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-haspopup="true"
            aria-expanded={isProfileMenuOpen}
        >
             <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.email}`} alt="profile" className="h-10 w-10 rounded-full" />
             <div className="flex-grow overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.email}</p>
                <p className="text-xs text-neutral-500">{currentUserPlan?.name} Plan</p>
             </div>
             <ChevronUpIcon className={`w-5 h-5 ml-auto text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
