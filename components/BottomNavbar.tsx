





import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePlans } from '../contexts/PlanContext.tsx';
import { DashboardIcon } from './icons/DashboardIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { CubeIcon } from './icons/CubeIcon.tsx';
import { UserCircleIcon } from './icons/UserCircleIcon.tsx';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon.tsx';
import { CodeBracketIcon } from './icons/CodeBracketIcon.tsx';
import { UserGroupIcon } from './icons/UserGroupIcon.tsx';
import CreateNewModal from './CreateNewModal.tsx';

const { NavLink, useNavigate } = ReactRouterDOM;

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
    const { currentUserPlan } = usePlans();
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    const hasApiAccess = currentUserPlan?.api_access;
    const hasTeamAccess = currentUserPlan?.team_member_limit && currentUserPlan.team_member_limit > 1;

    const renderFifthButton = () => {
        if (isAdmin) {
            return <NavItem to="/admin" icon={ShieldCheckIcon} label="Admin" />;
        }
        if (hasTeamAccess) {
             return <NavItem to="/team" icon={UserGroupIcon} label="Team" />;
        }
        if (hasApiAccess) {
            return <NavItem to="/api-settings" icon={CodeBracketIcon} label="API" />;
        }
        return <NavItem to="/settings" icon={UserCircleIcon} label="Settings" />;
    };

    return (
        <>
            <footer className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-slate-200">
                <div className="grid h-full grid-cols-5 mx-auto">
                    <NavItem to="/dashboard" icon={DashboardIcon} label="Overview" />
                    <NavItem to="/invoices" icon={DocumentTextIcon} label="Invoices" />
                    
                    <div className="flex items-center justify-center">
                        <button 
                            onClick={() => setShowCreateModal(true)} 
                            className="inline-flex items-center justify-center w-14 h-14 font-medium bg-primary rounded-full text-white -mt-6 shadow-lg hover:bg-primary-dark transition-all"
                            aria-label="Create new"
                        >
                            <PlusIcon className="w-8 h-8"/>
                        </button>
                    </div>

                    <NavItem to="/products" icon={CubeIcon} label="Products" />
                    {renderFifthButton()}
                </div>
            </footer>
            <CreateNewModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </>
    );
};

export default BottomNavbar;