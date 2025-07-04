import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from './common/Button.tsx';
import { FilePlusIcon } from './icons/FilePlusIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { UserCircleIcon } from './icons/UserCircleIcon.tsx';

const { useNavigate } = ReactRouterDOM;

interface CreateNewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateNewModal: React.FC<CreateNewModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleNavigate = (path: string, state?: any) => {
        navigate(path, { state });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-[100] flex items-end no-print" 
            onClick={onClose}
        >
            <div 
                className="bg-white w-full rounded-t-2xl p-4 animate-slide-up" 
                onClick={e => e.stopPropagation()}
            >
                <div className="w-10 h-1 bg-neutral-light rounded-full mx-auto mb-3"></div>
                <h3 className="text-lg font-semibold text-center mb-4 text-neutral-darkest">Create New</h3>
                <div className="space-y-3">
                    <ActionButton
                        onClick={() => handleNavigate('/create')}
                        icon={FilePlusIcon}
                        label="New Invoice"
                        description="Create a standard invoice for a client."
                    />
                    <ActionButton
                        onClick={() => handleNavigate('/create', { defaultType: 'quote' })}
                        icon={DocumentTextIcon}
                        label="New Quote / Estimate"
                        description="Send a price estimate to a client."
                    />
                    <ActionButton
                        onClick={() => handleNavigate('/clients?action=new')}
                        icon={UserCircleIcon}
                        label="New Client"
                        description="Add a new client to your records."
                    />
                </div>
                <Button variant="ghost" className="w-full mt-4 !py-3" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </div>
    );
};

const ActionButton: React.FC<{
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    description: string;
}> = ({ onClick, icon: Icon, label, description }) => (
    <button onClick={onClick} className="w-full flex items-center p-3 text-left rounded-lg hover:bg-slate-100 transition-colors">
        <div className="bg-primary-lightest text-primary p-3 rounded-lg mr-4">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="font-semibold text-neutral-800">{label}</p>
            <p className="text-sm text-neutral-500">{description}</p>
        </div>
    </button>
);

export default CreateNewModal;