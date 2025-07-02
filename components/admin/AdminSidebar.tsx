
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon } from '../icons/HomeIcon.tsx'; 
import { UsersIcon } from '../icons/UsersIcon.tsx';
import { ListBulletIcon } from '../icons/ListBulletIcon.tsx';
import { CreditCardIcon } from '../icons/CreditCardIcon.tsx';
import { KeyIcon } from '../icons/KeyIcon.tsx';
import { EnvelopeIcon } from '../icons/EnvelopeIcon.tsx';

const AdminSidebar: React.FC = () => {
  const commonLinkClasses = "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150";
  const activeLinkClasses = "bg-primary-DEFAULT text-white shadow-md";
  const inactiveLinkClasses = "text-neutral-dark hover:bg-primary-lightest hover:text-primary-dark";

  return (
    <div className="w-full md:w-64 bg-white shadow-lg md:min-h-full p-4 md:p-6 space-y-2 no-print">
      <h2 className="text-lg font-semibold text-neutral-darkest mb-4 px-2 hidden md:block">Admin Menu</h2>
      <nav className="flex flex-row md:flex-col md:space-y-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
        <NavLink 
          to="dashboard"
          className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses} mr-2 md:mr-0 whitespace-nowrap`}
        >
          <HomeIcon className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink 
          to="users"
          className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses} mr-2 md:mr-0 whitespace-nowrap`}
        >
          <UsersIcon className="w-5 h-5 mr-3" />
          Users
        </NavLink>
        <NavLink 
          to="plans"
          className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses} mr-2 md:mr-0 whitespace-nowrap`}
        >
          <ListBulletIcon className="w-5 h-5 mr-3" />
          Plans
        </NavLink>
         <NavLink 
          to="messages"
          className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses} mr-2 md:mr-0 whitespace-nowrap`}
        >
          <EnvelopeIcon className="w-5 h-5 mr-3" />
          Messages
        </NavLink>
        <NavLink 
          to="payments"
          className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses} mr-2 md:mr-0 whitespace-nowrap`}
        >
          <CreditCardIcon className="w-5 h-5 mr-3" />
          Payments
        </NavLink>
        <NavLink 
          to="integrations"
          className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses} mr-2 md:mr-0 whitespace-nowrap`}
        >
          <KeyIcon className="w-5 h-5 mr-3" />
          Integrations
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminSidebar;
