import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { DocumentPlusIcon } from '../icons/DocumentPlusIcon.tsx';
import { ChatBubbleLeftEllipsisIcon } from '../icons/ChatBubbleLeftEllipsisIcon.tsx';
import { UserPlusIcon } from '../icons/UserPlusIcon.tsx';

const { Link } = ReactRouterDOM;

// Single source of truth for actions
const actionItems = [
    {
        to: "/create",
        state: undefined,
        icon: DocumentPlusIcon,
        label: "New Invoice",
        description: "Create a standard bill for a client."
    },
    {
        to: "/create",
        state: { defaultType: 'quote' },
        icon: ChatBubbleLeftEllipsisIcon,
        label: "New Quote",
        description: "Send a price estimate to a client."
    },
    {
        to: "/clients",
        state: { action: 'new' },
        icon: UserPlusIcon,
        label: "New Client",
        description: "Add a new business or contact."
    }
];


// Desktop list item component
const ActionItem: React.FC<{ to: string, state?: any, icon: React.FC<any>, label: string, description: string }> = ({ to, state, icon: Icon, label, description }) => (
    <Link to={to} state={state} className="group flex items-center p-4 rounded-xl hover:bg-slate-100 transition-colors duration-200">
        <div className="p-3 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors duration-200">
            <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
            <p className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors duration-200">{label}</p>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
    </Link>
);

// Mobile carousel item component
const MobileActionItem: React.FC<{ to: string, state?: any, icon: React.FC<any>, label: string }> = ({ to, state, icon: Icon, label }) => (
    <Link to={to} state={state} className="flex-shrink-0 flex flex-col items-center justify-center space-y-2 group w-24 text-center">
        <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded-full group-hover:bg-purple-100 transition-all duration-300 transform group-hover:scale-105 shadow-sm group-hover:shadow-md">
            <Icon className="w-8 h-8 text-slate-600 group-hover:text-purple-600 transition-colors" />
        </div>
        <p className="text-xs font-medium text-slate-600 group-hover:text-purple-700 transition-colors">{label}</p>
    </Link>
);


const QuickActionsCard: React.FC = () => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-2 px-2 md:px-0">Quick Actions</h3>
            
            {/* Desktop View: List */}
            <div className="hidden md:block space-y-2">
                {actionItems.map((item, index) => (
                    <ActionItem 
                        key={index} 
                        to={item.to}
                        state={item.state}
                        icon={item.icon}
                        label={item.label}
                        description={item.description}
                    />
                ))}
            </div>

            {/* Mobile View: Carousel */}
            <div className="block md:hidden">
                <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 thin-scrollbar">
                    {actionItems.map((item, index) => (
                         <MobileActionItem 
                            key={index} 
                            to={item.to}
                            state={item.state}
                            icon={item.icon}
                            label={item.label}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuickActionsCard;