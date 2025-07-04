import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AdminUser } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePlans } from '../contexts/PlanContext.tsx';
import { listTeamMembers, inviteTeamMember, removeTeamMember } from '../services/teamService.ts';
import Button from '../components/common/Button.tsx';
import Input from '../components/common/Input.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { XMarkIcon } from '../components/icons/XMarkIcon.tsx';
import { UserGroupIcon } from '../components/icons/UserGroupIcon.tsx';

const { useNavigate, Link } = ReactRouterDOM;

type TeamMember = Omit<AdminUser, 'raw_user_meta_data'>;

const TeamPage: React.FC = () => {
    const { currentUserPlan, loading: planLoading } = usePlans();
    const navigate = useNavigate();

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    useEffect(() => {
        if (!planLoading && (!currentUserPlan?.team_member_limit || currentUserPlan.team_member_limit <= 1)) {
            navigate('/pricing');
        }
    }, [currentUserPlan, planLoading, navigate]);

    const loadMembers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listTeamMembers();
            setMembers(data);
        } catch (e: any) {
            setError(e.message || "Failed to load team members.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUserPlan?.team_member_limit && currentUserPlan.team_member_limit > 1) {
            loadMembers();
        }
    }, [loadMembers, currentUserPlan]);

    const handleRemoveMember = async (memberId: string) => {
        if (!window.confirm("Are you sure you want to remove this member? They will lose access to this team.")) return;
        setIsProcessing(true);
        setError(null);
        try {
            await removeTeamMember(memberId);
            loadMembers(); // Refresh the list
        } catch (e: any) {
            setError(e.message || "Failed to remove member.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const teamMemberLimit = currentUserPlan?.team_member_limit ?? 1;
    const canInvite = teamMemberLimit === null || members.length < teamMemberLimit;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-neutral-darkest">Team Management</h1>
                <Button onClick={() => setShowInviteModal(true)} leftIcon={<PlusIcon className="w-5 h-5"/>} disabled={!canInvite}>
                    {canInvite ? 'Invite Member' : 'Limit Reached'}
                </Button>
            </div>
            <div className="mb-8 text-sm text-neutral-600">
                <p>You have used <span className="font-bold">{members.length}</span> of your <span className="font-bold">{teamMemberLimit === null ? 'unlimited' : teamMemberLimit}</span> available team seats.</p>
                {!canInvite && <p>Please <Link to="/pricing" className="text-primary hover:underline">upgrade your plan</Link> to add more members.</p>}
            </div>
            
            {loading && <p>Loading team members...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            
            {!loading && members.length === 0 && (
                <div className="text-center py-12 bg-white shadow-md rounded-lg">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-lg font-medium text-neutral-darkest">Your team is empty</h3>
                    <p className="mt-1 text-sm text-neutral-DEFAULT">Invite members to collaborate on invoices.</p>
                </div>
            )}

            {!loading && members.length > 0 && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-neutral-light">
                        {members.map(member => (
                            <li key={member.id} className="px-4 py-4 sm:px-6 hover:bg-neutral-lightest">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${member.email}`} 
                                            alt="avatar" 
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <p className="font-semibold text-primary-dark">{member.email}</p>
                                            <p className="text-sm text-neutral-DEFAULT capitalize">{member.user_metadata?.status || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleRemoveMember(member.id)} disabled={isProcessing}><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showInviteModal && (
                <InviteMemberModal
                    onClose={() => setShowInviteModal(false)}
                    onInviteSuccess={loadMembers}
                />
            )}
        </div>
    );
};

const InviteMemberModal: React.FC<{ onClose: () => void, onInviteSuccess: () => void }> = ({ onClose, onInviteSuccess }) => {
    const [email, setEmail] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);
        try {
            await inviteTeamMember(email);
            setSuccess(true);
            setEmail('');
            setTimeout(() => {
                onInviteSuccess();
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Invite Team Member</h3>
                    <button onClick={onClose} disabled={isProcessing}><XMarkIcon className="w-6 h-6 text-slate-500 hover:text-slate-800"/></button>
                </div>
                
                {success ? (
                    <p className="text-center text-green-600 bg-green-100 p-4 rounded-md">Invitation sent successfully!</p>
                ) : (
                    <form onSubmit={handleInvite}>
                        {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-3 text-sm">{error}</p>}
                        <p className="text-sm text-neutral-600 mb-4">Enter the email address of the person you want to add to your team. They will receive an email invitation to join.</p>
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={isProcessing}
                        />
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button variant="ghost" type="button" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                            <Button type="submit" disabled={isProcessing}>{isProcessing ? 'Sending...' : 'Send Invite'}</Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TeamPage;