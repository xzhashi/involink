import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import Button from './common/Button.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { MenuIcon } from './icons/MenuIcon.tsx';
import { XMarkIcon } from './icons/XMarkIcon.tsx';
import { InstallIcon } from './icons/InstallIcon.tsx';

const { Link, NavLink, useLocation } = ReactRouterDOM;

const Navbar: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    const handleAppInstalled = () => setInstallPrompt(null);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };
  
  const closeMenus = () => setMobileMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest('[aria-label="Open main menu"]')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  const navLinks = [
      { to: "/", text: "Home" },
      { to: "/pricing", text: "Pricing" },
      { to: "/blog", text: "Blog" },
      { to: "/about", text: "About" },
      { to: "/contact", text: "Contact" },
  ];

  const renderNavLinks = () => (
    navLinks.map((link, index) => (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={closeMenus}
        className={({ isActive }) => `
          text-sm font-medium transition-colors duration-200
          ${isActive ? 'text-purple-600 font-semibold' : 'text-slate-600 hover:text-purple-600'}
        `}
      >
        {link.text}
      </NavLink>
    ))
  );

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/80 no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <Link to="/" className="flex-shrink-0 flex items-center text-primary hover:opacity-80 transition-opacity">
              <SparklesIcon className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">Invoice Maker</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {renderNavLinks()}
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2">
                {installPrompt && (
                  <Button variant="ghost" size="sm" onClick={handleInstallClick} leftIcon={<InstallIcon className="w-4 h-4"/>}>
                    Install App
                  </Button>
                )}
                {authLoading ? (
                  <div className="w-24 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
                ) : user ? (
                   <Link to="/dashboard">
                      <Button variant="primary" size="sm">Dashboard</Button>
                    </Link>
                ) : (
                  <>
                    <Link to="/auth?mode=login">
                      <Button variant="ghost" size="sm">Login</Button>
                    </Link>
                    <Link to="/auth?mode=signup">
                      <Button variant="primary" size="sm">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
              
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-full text-neutral-600 hover:bg-gray-100 focus:outline-none"
                  aria-label="Open main menu"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        ref={mobileMenuRef}
        className={`md:hidden fixed inset-0 z-[100] transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div 
            className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={closeMenus} 
            aria-hidden="true"
        ></div>
        
        <div className="relative ml-auto bg-white w-72 h-full shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
                <Link to="/" onClick={closeMenus} className="flex-shrink-0 flex items-center text-primary">
                    <SparklesIcon className="h-7 w-7 mr-2" />
                    <span className="font-bold text-lg">Invoice Maker</span>
                </Link>
                <button onClick={closeMenus} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close menu">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            
            <nav className="flex-grow p-4 space-y-4">
              {navLinks.map(link => (
                  <NavLink key={link.to} to={link.to} onClick={closeMenus} className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                      {link.text}
                  </NavLink>
              ))}
              {installPrompt && (
                  <button onClick={handleInstallClick} className="w-full flex items-center px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 rounded-md">
                      <InstallIcon className="w-5 h-5 mr-3 text-slate-500"/> Install App
                  </button>
              )}
            </nav>

            <div className="p-4 mt-auto border-t">
                {user ? (
                   <Link to="/dashboard" onClick={closeMenus}><Button variant='primary' className="w-full">Go to Dashboard</Button></Link>
                ) : (
                    <div className="space-y-2">
                        <Link to="/auth?mode=login" onClick={closeMenus}><Button variant='ghost' className="w-full">Login</Button></Link>
                        <Link to="/auth?mode=signup" onClick={closeMenus}><Button variant='primary' className="w-full">Sign Up</Button></Link>
                    </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;