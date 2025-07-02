
import React, { useState, useEffect, useCallback } from 'react';
import { ContactSubmission } from '../../types.ts';
import { fetchContactSubmissionsAdmin, updateContactSubmissionAdmin, deleteContactSubmissionAdmin } from '../../services/adminService.ts';
import Button from '../common/Button.tsx';
import { TrashIcon } from '../icons/TrashIcon.tsx';
import { EyeIcon } from '../icons/EyeIcon.tsx';
import { EyeSlashIcon } from '../icons/EyeSlashIcon.tsx';
import { XMarkIcon } from '../icons/XMarkIcon.tsx';

const AdminMessagesView: React.FC = () => {
    const [messages, setMessages] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadMessages = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchContactSubmissionsAdmin();
            setMessages(data);
        } catch (e: any) {
            setError(e.message || "Failed to load messages.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const openMessageModal = async (message: ContactSubmission) => {
        setSelectedMessage(message);
        if (!message.is_read) {
            try {
                const { submission } = await updateContactSubmissionAdmin(message.id, { is_read: true });
                if (submission) {
                    setMessages(prev => prev.map(m => m.id === message.id ? submission : m));
                }
            } catch (e) { /* Fail silently, UI will still show as read */ }
        }
    };
    
    const handleToggleReadStatus = async () => {
        if (!selectedMessage) return;
        setIsProcessing(true);
        const newReadStatus = !selectedMessage.is_read;
        const { submission } = await updateContactSubmissionAdmin(selectedMessage.id, { is_read: newReadStatus });
        if (submission) {
            setMessages(prev => prev.map(m => m.id === selectedMessage.id ? submission : m));
            setSelectedMessage(submission);
        }
        setIsProcessing(false);
    };

    const handleDeleteMessage = async () => {
        if (!selectedMessage || !window.confirm("Are you sure you want to delete this message?")) return;
        setIsProcessing(true);
        const { success } = await deleteContactSubmissionAdmin(selectedMessage.id);
        if (success) {
            setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
            setSelectedMessage(null);
        } else {
            alert("Failed to delete the message.");
        }
        setIsProcessing(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-neutral-darkest mb-8">Contact Messages</h1>
            {loading && <p>Loading messages...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
            
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <ul className="divide-y divide-neutral-light">
                    {!loading && messages.length === 0 && (
                        <li className="p-6 text-center text-neutral-500">No messages have been received yet.</li>
                    )}
                    {messages.map(message => (
                        <li key={message.id} className={`p-4 sm:p-6 hover:bg-neutral-lightest cursor-pointer ${!message.is_read ? 'bg-blue-50' : ''}`} onClick={() => openMessageModal(message)}>
                            <div className="flex items-center justify-between">
                                <div className="truncate">
                                    <p className={`font-semibold text-primary-dark ${!message.is_read ? 'font-extrabold' : ''}`}>{message.name}</p>
                                    <p className="text-sm text-neutral-600 truncate">{message.subject}</p>
                                </div>
                                <div className="text-right ml-4">
                                    {!message.is_read && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500 text-white">NEW</span>}
                                    <p className="text-xs text-neutral-500 mt-1">{new Date(message.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedMessage && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setSelectedMessage(null)}>
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-neutral-darkest">{selectedMessage.subject}</h3>
                                <p className="text-sm text-neutral-600">From: {selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
                                <p className="text-xs text-neutral-500 mt-1">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedMessage(null)} className="p-2 rounded-full hover:bg-slate-100"><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="flex-grow overflow-y-auto border-t border-b py-4 my-4 thin-scrollbar">
                           <p className="text-neutral-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                        </div>
                         <div className="flex justify-between items-center">
                            <div className="space-x-2">
                                <Button variant="ghost" onClick={handleToggleReadStatus} disabled={isProcessing} leftIcon={selectedMessage.is_read ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}>
                                    Mark as {selectedMessage.is_read ? 'Unread' : 'Read'}
                                </Button>
                                <Button variant="danger" onClick={handleDeleteMessage} disabled={isProcessing} leftIcon={<TrashIcon className="w-5 h-5"/>}>
                                    Delete
                                </Button>
                            </div>
                            <Button onClick={() => setSelectedMessage(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMessagesView;
