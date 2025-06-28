
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon } from './icons/SparklesIcon';
import Button from './common/Button';
import { UserCircleIcon } from './icons/UserCircleIcon'; 
import { LogoutIcon } from './icons/LogoutIcon'; 
import { ChevronDownIcon } from './icons/ChevronDownIcon'; // For dropdown
import { CogIcon } from './icons/CogIcon'; // For Admin link

const Navbar: React.FC = () => {
  const { user, logout, loading, isAdmin } = useAuth(); // Added isAdmin
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      navigate('/'); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <nav className="bg-white shadow-md no-print">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center text-primary-dark hover:text-primary-DEFAULT transition-colors">
              <SparklesIcon className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">Invoice Maker <span className="text-sm font-normal text-primary-light">by LinkFC</span></span>
            </Link>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link 
              to="/" 
              className="text-neutral-DEFAULT hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            
            {loading ? (
              <span className="text-sm text-neutral-DEFAULT">Loading...</span>
            ) : user ? (
              <>
                <Link 
                  to="/invoices" 
                  className="text-neutral-DEFAULT hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Invoices
                </Link>
                {isAdmin && ( // Show Admin link if user is admin
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center text-neutral-DEFAULT hover:text-accent-dark px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <CogIcon className="h-5 w-5 mr-1" />
                    Admin
                  </Link>
                )}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)} 
                    className="flex items-center text-neutral-DEFAULT hover:text-primary-dark focus:outline-none p-1 rounded-md hover:bg-neutral-lightest"
                    aria-label="User menu"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                     <UserCircleIcon className="h-6 w-6" />
                     <span className="text-sm text-neutral-dark hidden sm:inline ml-1.5 mr-1">{user.email?.split('@')[0]}</span>
                     <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-neutral-light">
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-lightest hover:text-primary-dark"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/settings" 
                        className="block px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-lightest hover:text-primary-dark"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                       <Link 
                        to="/create" 
                        className="block sm:hidden px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-lightest hover:text-primary-dark"
                        onClick={() => setDropdownOpen(false)}
                      >
                        New Invoice
                      </Link>
                      <div className="border-t border-neutral-light my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <LogoutIcon className="inline w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                 <Link to="/create" className="hidden sm:inline-block">
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="!px-3 !py-1.5"
                    >
                     + New Invoice
                    </Button>
                  </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/auth?mode=login" 
                  className="text-neutral-DEFAULT hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/auth?mode=signup" 
                  className="bg-primary-DEFAULT hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
