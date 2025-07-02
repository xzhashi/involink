import React from 'react';

interface AdminStatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    isError?: boolean;
    description?: string;
    color?: 'purple' | 'green' | 'blue' | 'yellow';
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, icon, isError, description, color = 'purple' }) => {
    
    const colorVariants = {
        purple: 'from-purple-500 to-indigo-600',
        green: 'from-green-500 to-emerald-600',
        blue: 'from-blue-500 to-sky-600',
        yellow: 'from-yellow-500 to-amber-600',
    };

    const textVariants = {
        purple: 'text-purple-600',
        green: 'text-green-600',
        blue: 'text-blue-600',
        yellow: 'text-amber-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-purple-200/50 transition-all duration-300 transform hover:-translate-y-1 border border-slate-100">
            <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br ${colorVariants[color]} text-white shadow-md`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                    <p className={`text-3xl font-bold ${isError ? 'text-red-500' : textVariants[color]}`}>
                        {isError ? 'Error' : value}
                    </p>
                </div>
            </div>
            {description && <p className="text-xs text-slate-400 mt-3">{description}</p>}
        </div>
    );
}

export default AdminStatCard;
