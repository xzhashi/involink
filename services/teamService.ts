import { supabase } from './supabaseClient.ts';
import { AdminUser } from '../types.ts';

const handleInvokeError = (error: any, context: string): Error => {
    console.error(`Error invoking function '${context}':`, error);
    const detailedError = error?.context?.json?.error;
    const message = typeof detailedError === 'string' ? detailedError : (error.message || `An unknown error occurred while trying to ${context}.`);
    return new Error(message);
};

/**
 * Lists all members associated with the current user's team.
 * @returns A promise that resolves to an array of team member user objects.
 */
export const listTeamMembers = async (): Promise<AdminUser[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Authentication required to manage team members.");

    const { data, error } = await supabase.functions.invoke('team-list-members', {
        headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) {
        throw handleInvokeError(error, 'list team members');
    }

    return (data?.members || []) as AdminUser[];
};

/**
 * Invites a new member to the current user's team via email.
 * @param email - The email address of the user to invite.
 * @returns A promise that resolves when the invitation is sent.
 */
export const inviteTeamMember = async (email: string): Promise<any> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Authentication required to invite members.");

    const { data, error } = await supabase.functions.invoke('team-invite-member', {
        body: { email },
        headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) {
        throw handleInvokeError(error, 'invite team member');
    }

    return data;
};

/**
 * Removes a member from the current user's team.
 * @param memberId - The ID of the team member to remove.
 * @returns A promise that resolves when the member is removed.
 */
export const removeTeamMember = async (memberId: string): Promise<any> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Authentication required to remove members.");

    const { data, error } = await supabase.functions.invoke('team-remove-member', {
        body: { memberId },
        headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) {
        throw handleInvokeError(error, 'remove team member');
    }

    return data;
};
