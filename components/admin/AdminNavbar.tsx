import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Button from '../common/Button.tsx';
import { PowerIcon } from '../icons/PowerIcon.tsx';

const { Link } = ReactRouterDOM;

const AdminNavbar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-40 bg-white shadow-sm no-print border-b border-slate-200">
            <div className="flex items-center justify-between h-16 px-6">
                <h1 className="text-lg font-semibold text-neutral-800">Admin Panel</h1>
                <div className="flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="sm">Back to App</Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <img 
                            src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.email || 'admin'}`} 
                            alt="Admin Avatar" 
                            className="h-9 w-9 rounded-full border-2 border-slate-200"
                        />
                        <span className="text-sm font-medium text-neutral-700 hidden sm:block">{user?.email}</span>
                    </div>
                    <button onClick={logout} title="Logout" className="p-2 rounded-full text-neutral-500 hover:bg-slate-100 hover:text-red-500">
                        <PowerIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;