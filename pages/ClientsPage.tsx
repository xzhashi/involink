
import React, { useState, useEffect, useCallback } from 'react';
import { Client } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { fetchUserClients, saveClient, deleteClient } from '../services/supabaseClient.ts';
import Button from '../components/common/Button.tsx';
import Input from '../components/common/Input.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { XMarkIcon } from '../components/icons/XMarkIcon.tsx';

const ClientsPage: React.FC = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentClient, setCurrentClient] = useState<Partial<Client> | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const loadClients = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchUserClients();
            setClients(data);
        } catch (e: any) {
            setError(e.message || "Failed to load clients.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    const handleOpenModal = (client: Partial<Client> | null = null) => {
        if (client) {
            setCurrentClient(client);
            setIsEditing(true);
        } else {
            setCurrentClient({ name: '', email: '', phone: '', address: '' });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleSaveClient = async () => {
        if (!currentClient || !currentClient.name) return;
        setIsProcessing(true);
        setError(null);
        try {
            await saveClient(currentClient);
            setShowModal(false);
            loadClients();
        } catch (e: any) {
            setError(e.message || "Failed to save client.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDeleteClient = async (clientId: string) => {
        if (!window.confirm("Are you sure you want to delete this client? This cannot be undone.")) return;
        setIsProcessing(true);
        setError(null);
        try {
            await deleteClient(clientId);
            loadClients();
        } catch (e: any) {
            setError(e.message || "Failed to delete client.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!currentClient) return;
        setCurrentClient({ ...currentClient, [e.target.name]: e.target.value });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-darkest">Clients</h1>
                <Button onClick={() => handleOpenModal()} leftIcon={<PlusIcon className="w-5 h-5"/>}>
                    Add New Client
                </Button>
            </div>
            
            {loading && <p>Loading clients...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
            
            {!loading && clients.length === 0 && (
                <div className="text-center py-12 bg-white shadow-md rounded-lg">
                    <h3 className="text-lg font-medium text-neutral-darkest">No clients yet</h3>
                    <p className="mt-1 text-sm text-neutral-DEFAULT">Add a client to get started.</p>
                </div>
            )}

            {!loading && clients.length > 0 && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-neutral-light">
                        {clients.map(client => (
                            <li key={client.id} className="px-4 py-4 sm:px-6 hover:bg-neutral-lightest">
                                <div className="flex items-center justify-between">
                                    <div className="truncate">
                                        <p className="font-semibold text-primary-dark">{client.name}</p>
                                        <p className="text-sm text-neutral-DEFAULT truncate">{client.email}</p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(client)}><PencilIcon className="w-4 h-4"/></Button>
                                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteClient(client.id)}><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showModal && currentClient && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">{isEditing ? 'Edit Client' : 'Add New Client'}</h3>
                            <button onClick={() => setShowModal(false)}><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="space-y-4">
                            <Input label="Name" name="name" value={currentClient.name || ''} onChange={handleInputChange} required />
                            <Input label="Email" name="email" type="email" value={currentClient.email || ''} onChange={handleInputChange} />
                            <Input label="Phone" name="phone" value={currentClient.phone || ''} onChange={handleInputChange} />
                            <Input label="Address" name="address" value={currentClient.address || ''} onChange={handleInputChange} />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button variant="ghost" onClick={() => setShowModal(false)} disabled={isProcessing}>Cancel</Button>
                            <Button onClick={handleSaveClient} disabled={isProcessing}>{isProcessing ? 'Saving...' : 'Save Client'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsPage;
