

import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePlans } from '../contexts/PlanContext.tsx';
import Button from './common/Button.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { UserCircleIcon } from './icons/UserCircleIcon.tsx'; 
import { LogoutIcon } from './icons/LogoutIcon.tsx'; 
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { CogIcon } from './icons/CogIcon.tsx';
import { MenuIcon } from './icons/MenuIcon.tsx';
import { XMarkIcon } from './icons/XMarkIcon.tsx';
import { DashboardIcon } from './icons/DashboardIcon.tsx';
import { FilePlusIcon } from './icons/FilePlusIcon.tsx';
import { InstallIcon } from './icons/InstallIcon.tsx';

const Navbar: React.FC = () => {
  const { user, logout, loading, isAdmin } = useAuth();
  const { isLimitReached } = usePlans();
  const navigate = useNavigate();
  const location = useLocation();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
        setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
        return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
    } else {
        console.log('User dismissed the install prompt');
    }
    setInstallPrompt(null);
  };

  const closeMenus = () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    closeMenus();
    await logout();
    navigate('/'); 
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest('[aria-label="Open main menu"]')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Close mobile menu on route change
  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  const navLinks = [
      { to: "/", text: "Home" },
      { to: "/pricing", text: "Pricing" },
      { to: "/about", text: "About Us" },
      { to: "/contact", text: "Contact Us" },
      ...(user ? [{ to: "/invoices", text: "My Invoices" }] : []),
      ...(user && isAdmin ? [{ to: "/admin/dashboard", text: "Admin Panel", icon: <CogIcon className="w-5 h-5 mr-1.5" /> }] : []),
  ];

  const renderNavLinks = (isMobile: boolean) => {
    const base = "flex items-center transition-colors duration-200 rounded-md";
    const mobileClasses = `px-3 py-3 text-base font-medium ${mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'} transform transition-all`;
    const desktopClasses = "px-3 py-2 text-sm font-medium";

    const active = isMobile ? 'bg-primary-lightest text-primary-dark' : 'bg-slate-100 text-primary-dark';
    const inactive = isMobile ? 'text-neutral-700 hover:bg-slate-100' : 'text-neutral-600 hover:text-primary-dark hover:bg-slate-100';

    return navLinks.map((link, index) => (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={closeMenus}
        style={isMobile ? { transitionDelay: `${50 + index * 30}ms` } : {}}
        className={({ isActive }) => `
          ${base}
          ${isMobile ? mobileClasses : desktopClasses}
          ${isActive ? active : inactive}
        `}
      >
        {link.icon && <span className={isMobile ? 'mr-3' : 'mr-1.5'}>{link.icon}</span>}
        {link.text}
      </NavLink>
    ));
  };

  const UserMenu = () => (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setUserDropdownOpen(!userDropdownOpen)} 
        className="flex items-center text-neutral-600 hover:text-primary-dark focus:outline-none p-1 rounded-full hover:bg-slate-100 transition-colors"
        aria-label="User menu" aria-haspopup="true" aria-expanded={userDropdownOpen}
      >
         <UserCircleIcon className="h-7 w-7" />
         <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      <div 
        className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl py-2 z-50 border border-slate-900/10
                   transform origin-top-right transition-all duration-150 ease-out
                   ${userDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="px-4 py-2 border-b border-slate-900/10 mb-2">
          <p className="text-sm font-medium text-neutral-darkest truncate">{user?.email}</p>
        </div>
        <div className="px-2 space-y-1">
          <Link to="/dashboard" className="flex items-center w-full px-3 py-2 text-sm text-neutral-dark hover:bg-slate-100 hover:text-primary-dark rounded-md transition-colors" onClick={closeMenus}>
              <DashboardIcon className="w-5 h-5 mr-3 text-neutral-500" />
              Dashboard
          </Link>
          <Link to="/settings" className="flex items-center w-full px-3 py-2 text-sm text-neutral-dark hover:bg-slate-100 hover:text-primary-dark rounded-md transition-colors" onClick={closeMenus}>
              <CogIcon className="w-5 h-5 mr-3 text-neutral-500" />
              Settings
          </Link>
           <Link to={isLimitReached ? '/pricing' : '/create'} className="flex sm:hidden items-center w-full px-3 py-2 text-sm text-neutral-dark hover:bg-slate-100 hover:text-primary-dark rounded-md transition-colors" onClick={closeMenus}>
                <FilePlusIcon className="w-5 h-5 mr-3 text-neutral-500" />
                {isLimitReached ? 'Upgrade Plan' : 'New Invoice'}
           </Link>
        </div>
        <div className="border-t border-slate-900/10 my-2"></div>
        <div className="px-2">
          <button onClick={handleLogout} className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors">
              <LogoutIcon className="inline w-5 h-5 mr-3" />
              Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-900/10 no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center text-primary-dark hover:text-primary-DEFAULT transition-colors">
              <SparklesIcon className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">Invoice Maker <span className="text-sm font-normal text-primary-light">by LinkFC</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              {renderNavLinks(false)}
            </div>

            {/* Right side Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                {installPrompt && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleInstallClick}
                    leftIcon={<InstallIcon className="w-4 h-4"/>}
                    title="Install app to your device"
                  >
                    Install App
                  </Button>
                )}
                {loading ? (
                  <div className="w-24 h-8 bg-slate-200 rounded-md animate-pulse"></div>
                ) : user ? (
                  <>
                    <Link to={isLimitReached ? '/pricing' : '/create'}>
                        <Button variant="primary" size="sm" className="!px-4 !py-2 shadow-lg shadow-primary-light/20 hover:shadow-xl hover:shadow-primary-light/30 transform-gpu hover:-translate-y-px transition-all" title={isLimitReached ? "Free plan limit reached. Click to upgrade." : "Create a new invoice"}>
                         {isLimitReached ? 'Upgrade Plan' : 'New Invoice'}
                        </Button>
                    </Link>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <UserMenu />
                  </>
                ) : (
                  <>
                    <Link to="/auth?mode=login">
                      <Button variant="ghost" size="sm">Login</Button>
                    </Link>
                    <Link to="/auth?mode=signup">
                      <Button variant="primary" size="sm" className="!px-4">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
              
              {/* Mobile Hamburger Button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-full text-neutral-600 hover:text-primary-dark hover:bg-slate-100 focus:outline-none"
                  aria-label="Open main menu"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Mobile Menu --- */}
      <div 
        ref={mobileMenuRef}
        className={`md:hidden fixed inset-0 z-[100] transition-transform duration-300 ease-out 
                   ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Overlay */}
        <div 
            className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ease-out 
                       ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={closeMenus} 
            aria-hidden="true"
        ></div>
        
        {/* Panel */}
        <div className="relative ml-auto bg-white w-72 h-full shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-900/10">
                <Link to="/" onClick={closeMenus} className="flex-shrink-0 flex items-center text-primary-dark">
                    <SparklesIcon className="h-7 w-7 mr-2" />
                    <span className="font-bold text-lg">Invoice Maker</span>
                </Link>
                <button
                    onClick={closeMenus}
                    className="p-2 rounded-full text-neutral-500 hover:text-primary-dark hover:bg-slate-100 focus:outline-none transition"
                    aria-label="Close menu"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            
            {/* Links */}
            <nav className="flex-grow p-4 space-y-1.5">
              {renderNavLinks(true)}
              {installPrompt && (
                  <button
                      onClick={() => {
                          handleInstallClick();
                          closeMenus();
                      }}
                      className="flex items-center w-full px-3 py-3 text-base font-medium text-neutral-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                      <InstallIcon className="w-5 h-5 mr-3 text-secondary-DEFAULT"/>
                      Install App
                  </button>
              )}
            </nav>

            {/* Auth Actions */}
            <div className="p-4 mt-auto border-t border-slate-900/10">
                {user ? (
                    <div className="space-y-2">
                      <Link to="/dashboard" className={`flex items-center w-full px-3 py-3 text-base font-medium text-neutral-700 hover:bg-slate-100 rounded-md transition-colors`} onClick={closeMenus}>
                          <DashboardIcon className="w-5 h-5 mr-3 text-neutral-500" />
                          Dashboard
                      </Link>
                      <button onClick={handleLogout} className="flex items-center w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <LogoutIcon className="w-5 h-5 mr-3" />
                          Logout
                      </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Link to="/auth?mode=login" onClick={closeMenus}>
                          <Button variant='ghost' className="w-full">Login</Button>
                        </Link>
                        <Link to="/auth?mode=signup" onClick={closeMenus}>
                          <Button variant='primary' className="w-full">Sign Up</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;