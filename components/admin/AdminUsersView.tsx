



import React, { useState, useEffect, useCallback } from 'react';
import Button from '../common/Button.tsx';
import Input from '../common/Input.tsx';
import Select from '../common/Select.tsx';
import { XMarkIcon } from '../icons/XMarkIcon.tsx';
import { PlusIcon } from '../icons/PlusIcon.tsx';
import { PencilIcon } from '../icons/PencilIcon.tsx';
import { TrashIcon } from '../icons/TrashIcon.tsx';
import { usePlans } from '../../contexts/PlanContext.tsx';
import { AdminUser } from '../../types.ts';
import { 
  fetchAllUsersAdmin, 
  inviteUserAdmin, 
  updateUserAdmin, 
  deleteUserAdmin 
} from '../../services/adminService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx'; 

const AdminUsersView: React.FC = () => {
  const { plans: availablePlans, loading: plansLoading } = usePlans();
  const { user: currentAdminUser } = useAuth(); 
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userActionError, setUserActionError] = useState<string | null>(null);
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUserForModal, setCurrentUserForModal] = useState<Partial<AdminUser> & { emailInput?: string } | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isProcessingUserAction, setIsProcessingUserAction] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const planOptions = availablePlans.map(p => ({ value: p.id, label: p.name }));
  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ];

  const getPlanName = (planId?: string) => {
    if (!planId) return 'N/A';
    return availablePlans.find(p => p.id === planId)?.name || 'Unknown Plan';
  };
  
  const getUserMetadata = (user: Partial<AdminUser>) => {
    return user.raw_user_meta_data || user.user_metadata || {};
  }

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUserActionError(null);
    try {
      const fetchedUsers = await fetchAllUsersAdmin();
      setUsers(fetchedUsers);
    } catch (e: any) {
      const errorMessage = typeof e?.message === 'string' ? e.message : "An unknown error occurred while fetching users.";
      const defaultGuidance = "Ensure backend Edge Functions (e.g., 'admin-list-users') are deployed to Supabase, environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) are correctly set in the Supabase dashboard for each function, and your admin user has the correct role metadata.";
      setUserActionError(`${errorMessage} ${defaultGuidance}`);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openInviteUserModal = () => {
    setCurrentUserForModal({ 
      emailInput: '', 
      raw_user_meta_data: { 
        planId: planOptions[0]?.value || 'free_tier', 
        status: 'Invited',
        role: 'user', 
      } 
    });
    setIsEditingUser(false);
    setShowUserModal(true);
    setUserActionError(null);
  };

  const openEditUserModal = (user: AdminUser) => {
    setCurrentUserForModal({ 
      ...user, 
      emailInput: user.email, 
      raw_user_meta_data: { ...(getUserMetadata(user)) } 
    });
    setIsEditingUser(true);
    setShowUserModal(true);
    setUserActionError(null);
  };

  const handleSaveUser = async () => {
    if (!currentUserForModal) return;
    setIsProcessingUserAction(true);
    setUserActionError(null);

    try {
      const metadataToSave = currentUserForModal.raw_user_meta_data || {};
      if (isEditingUser && currentUserForModal.id) {
        const updates = {
            planId: metadataToSave.planId,
            status: metadataToSave.status,
            role: metadataToSave.role,
        };
        const { user: updatedUser, error } = await updateUserAdmin(currentUserForModal.id, updates);
        if (error || !updatedUser) throw new Error(error || "Failed to update user.");
        loadUsers(); 
      } else { 
        if (!currentUserForModal.emailInput) throw new Error("Email is required for inviting a user.");
        const { user: invitedUser, error } = await inviteUserAdmin(currentUserForModal.emailInput, metadataToSave.planId || 'free_tier');
        if (error || !invitedUser) throw new Error(error || "Failed to invite user.");
        loadUsers(); 
      }
      setShowUserModal(false);
      setCurrentUserForModal(null);
    } catch (e: any) {
      setUserActionError(e.message || "An error occurred. Ensure backend Edge Function is implemented and accessible.");
    } finally {
      setIsProcessingUserAction(false);
    }
  };
  
  const confirmDeleteUser = (user: AdminUser) => {
    if (user.id === currentAdminUser?.id) {
        setUserActionError("You cannot delete your own admin account.");
        return;
    }
    setUserToDelete(user);
    setShowDeleteConfirm(true);
    setUserActionError(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete.id) return;
    setIsProcessingUserAction(true);
    setUserActionError(null);
    try {
      const { success, error } = await deleteUserAdmin(userToDelete.id);
      if (error || !success) throw new Error(error || "Failed to delete user.");
      setUsers(users.filter(u => u.id !== userToDelete.id)); 
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (e: any) {
      setUserActionError(e.message || "An error occurred during deletion. Ensure backend Edge Function is implemented.");
    } finally {
      setIsProcessingUserAction(false);
    }
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!currentUserForModal) return;

    if (name === 'planId' || name === 'status' || name === 'role') {
      setCurrentUserForModal(prev => ({ 
        ...prev, 
        raw_user_meta_data: { ...(prev?.raw_user_meta_data || {}), [name]: value } 
      }));
    } else if (name === 'emailInput') {
       setCurrentUserForModal(prev => ({ ...prev, emailInput: value }));
    }
  };

  if (loadingUsers && users.length === 0) {
    return (
        <div className="animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div className="h-9 bg-slate-200 rounded w-1/3"></div>
                <div className="h-10 bg-slate-200 rounded w-32"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <div className="h-10 bg-slate-200 rounded w-full"></div>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 border-b border-slate-200">
                        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                        <div className="flex-grow h-5 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3">
        <h1 className="text-3xl font-bold text-neutral-darkest">User Management</h1>
        <Button variant="primary" onClick={openInviteUserModal} leftIcon={<PlusIcon className="w-5 h-5"/>}>
          Invite User
        </Button>
      </div>
      
      {userActionError && !showUserModal && !showDeleteConfirm && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 whitespace-pre-wrap">{userActionError}</p>}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <Input 
            placeholder="Search users by email..." 
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search users"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-neutral-dark">
            <thead className="text-xs text-neutral-DEFAULT uppercase bg-neutral-lightest">
              <tr>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Role</th>
                <th scope="col" className="px-6 py-3">Plan</th>
                <th scope="col" className="px-6 py-3">Joined Date</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const metadata = getUserMetadata(user);
                return (
                <tr key={user.id} className="bg-white border-b hover:bg-neutral-lightest">
                  <td className="px-6 py-4 font-medium text-neutral-darkest whitespace-nowrap">{user.email || 'N/A'}</td>
                  <td className="px-6 py-4 capitalize">{metadata?.role || 'user'}</td>
                  <td className="px-6 py-4">{getPlanName(metadata?.planId)}</td>
                  <td className="px-6 py-4">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      metadata?.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      metadata?.status === 'Invited' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {metadata?.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <Button variant="ghost" size="sm" className="text-primary-DEFAULT !px-2" onClick={() => openEditUserModal(user)} title={`Edit user ${user.email}`}>
                        <PencilIcon className="w-4 h-4"/>
                    </Button>
                    {user.id !== currentAdminUser?.id && ( 
                        <Button variant="ghost" size="sm" className="text-red-500 !px-2" onClick={() => confirmDeleteUser(user)} title={`Delete user ${user.email}`}>
                            <TrashIcon className="w-4 h-4"/>
                        </Button>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          {loadingUsers && users.length > 0 && <p className="text-center py-4 text-neutral-DEFAULT">Updating user list...</p>}
          {!loadingUsers && filteredUsers.length === 0 && !userActionError && <p className="text-center py-4 text-neutral-DEFAULT">No users found matching your search criteria.</p>}
          {!loadingUsers && users.length === 0 && !userActionError && <p className="text-center py-4 text-neutral-DEFAULT">No users found in the system yet.</p>}
        </div>
         <p className="text-xs text-neutral-DEFAULT mt-4">
            User management relies on Supabase Edge Functions. If operations fail, ensure these functions are deployed, properly configured with environment variables in your Supabase project, and that your admin user has the correct role in their metadata. Check Edge Function logs for server-side errors.
        </p>
      </div>

      {showUserModal && currentUserForModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70] backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-darkest">{isEditingUser ? 'Edit User' : 'Invite New User'}</h3>
              <button onClick={() => setShowUserModal(false)} className="text-neutral-500 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-light" disabled={isProcessingUserAction}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            {userActionError && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-3 text-sm">{userActionError}</p>}
            <div className="overflow-y-auto pr-2 space-y-4 flex-grow thin-scrollbar">
              <Input label="Email" name="emailInput" type="email" value={currentUserForModal.emailInput || ''} onChange={handleModalInputChange} disabled={isEditingUser || isProcessingUserAction} required />
              
              {!plansLoading && planOptions.length > 0 && (
                <Select
                    label="Plan"
                    name="planId" 
                    value={getUserMetadata(currentUserForModal)?.planId || (planOptions[0]?.value || '')}
                    onChange={handleModalInputChange}
                    options={planOptions}
                    disabled={isProcessingUserAction}
                />
              )}
               {plansLoading && <p className="text-sm text-neutral-DEFAULT">Loading plans...</p>}
               {(!plansLoading && planOptions.length === 0) && <p className="text-sm text-red-500">No plans available. Please add plans first.</p>}

              {isEditingUser && (
                <>
                  <Select
                      label="Role"
                      name="role"
                      value={getUserMetadata(currentUserForModal)?.role || 'user'}
                      onChange={handleModalInputChange}
                      options={roleOptions}
                      disabled={isProcessingUserAction || currentUserForModal.id === currentAdminUser?.id} 
                  />
                  <Select
                      label="Status"
                      name="status" 
                      value={getUserMetadata(currentUserForModal)?.status || 'Active'}
                      onChange={handleModalInputChange}
                      options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Suspended', label: 'Suspended' },
                      { value: 'Invited', label: 'Invited' },
                      ]}
                      disabled={isProcessingUserAction}
                  />
                </>
              )}
               {isEditingUser && currentUserForModal.created_at && <Input label="Joined Date" name="created_at" type="text" value={new Date(currentUserForModal.created_at).toLocaleDateString()} disabled />}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setShowUserModal(false)} disabled={isProcessingUserAction}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveUser} disabled={isProcessingUserAction || plansLoading || (planOptions.length === 0 && !isEditingUser)}>
                {isProcessingUserAction ? 'Processing...' : (isEditingUser ? 'Save Changes' : 'Send Invitation')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && userToDelete && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[80] backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold text-neutral-darkest mb-4">Confirm Deletion</h3>
            {userActionError && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-3 text-sm">{userActionError}</p>}
            <p className="text-sm text-neutral-DEFAULT mb-6">
                Are you sure you want to delete the user <span className="font-medium">{userToDelete.email}</span>? This action will attempt to call a backend Edge Function.
            </p>
            <div className="flex justify-end space-x-3">
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isProcessingUserAction}>Cancel</Button>
                <Button variant="danger" onClick={handleDeleteUser} disabled={isProcessingUserAction}>
                  {isProcessingUserAction ? 'Deleting...' : 'Delete User'}
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersView;