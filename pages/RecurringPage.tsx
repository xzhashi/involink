

import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { fetchUserDocuments, deleteInvoiceFromSupabase, updateInvoiceStatus } from '../services/supabaseClient.ts';
import { InvoiceData, RecurringStatus } from '../types.ts';
import Button from '../components/common/Button.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';

const { Link, useNavigate } = ReactRouterDOM;

const RecurringPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/auth');
            return;
        }
        const loadProfiles = async () => {
            setLoading(true);
            try {
                const data = await fetchUserDocuments(user.id, 'recurring_template');
                setProfiles(data);
            } catch (e: any) {
                setError(e.message || "Failed to load recurring profiles.");
            } finally {
                setLoading(false);
            }
        };
        loadProfiles();
    }, [user, authLoading, navigate]);

    const handleDelete = async (profileId: string) => {
        if (!user || !window.confirm("Are you sure? This will stop all future invoices for this profile.")) return;
        await deleteInvoiceFromSupabase(profileId);
        setProfiles(profiles.filter(p => p.db_id !== profileId));
    };

    const toggleStatus = async (profile: InvoiceData) => {
        const newStatus: RecurringStatus = profile.recurring_status === 'active' ? 'paused' : 'active';
        // This uses the invoice status update logic for now, might need a dedicated one later
        // await updateRecurringStatus(profile.db_id!, newStatus);
        setProfiles(profiles.map(p => p.db_id === profile.db_id ? {...p, recurring_status: newStatus} : p));
    };


    if (authLoading || loading) return <div>Loading recurring profiles...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-darkest">Recurring Invoices</h1>
                <Link to="/create" state={{ defaultType: 'recurring_template' }}>
                    <Button variant="primary" leftIcon={<PlusIcon className="w-5 h-5"/>}>
                        New Recurring Profile
                    </Button>
                </Link>
            </div>
            
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

            {profiles.length === 0 ? (
                 <div className="text-center py-12 bg-white shadow-md rounded-lg">
                    <h3 className="text-lg font-medium text-neutral-darkest">No recurring invoices set up.</h3>
                    <p className="mt-1 text-sm text-neutral-DEFAULT">Save time by automating your regular billing.</p>
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-neutral-light">
                        {profiles.map(profile => (
                            <li key={profile.db_id} className="px-4 py-4 sm:px-6 hover:bg-neutral-lightest">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-primary-dark">{profile.recipient.name}</p>
                                        <p className="text-sm text-neutral-DEFAULT">
                                            Next issue: {profile.recurring_next_issue_date ? new Date(profile.recurring_next_issue_date).toLocaleDateString() : 'N/A'} ({profile.recurring_frequency})
                                        </p>
                                    </div>
                                    <div className="space-x-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${profile.recurring_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {profile.recurring_status}
                                        </span>
                                        <Button variant="ghost" size="sm" onClick={() => toggleStatus(profile)}>
                                            {profile.recurring_status === 'active' ? 'Pause' : 'Resume'}
                                        </Button>
                                        <Link to={`/invoice/${profile.db_id}`}><Button variant="ghost" size="sm"><PencilIcon className="w-4 h-4"/></Button></Link>
                                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(profile.db_id!)}><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default RecurringPage;