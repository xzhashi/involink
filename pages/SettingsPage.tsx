
import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePlans } from '../contexts/PlanContext.tsx';
import { supabase, uploadCompanyLogo } from '../services/supabaseClient.ts';
import Input from '../components/common/Input.tsx';
import Button from '../components/common/Button.tsx';
import Textarea from '../components/common/Textarea.tsx';
import Select from '../components/common/Select.tsx';
import { CompanyDetails } from '../types.ts';
import { CURRENCY_OPTIONS } from '../currencies.ts';
import { PowerIcon } from '../components/icons/PowerIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { useLocalization } from '../contexts/LocalizationContext.tsx';

const { Link } = ReactRouterDOM;

const SettingsCard: React.FC<{ title: string; description?: string; children: React.ReactNode; className?: string }> = ({ title, description, children, className = '' }) => (
  <section className={`bg-white p-6 rounded-2xl shadow-lg border border-slate-100 ${className}`}>
    <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
    {description && <p className="text-sm text-slate-500 mt-1 mb-6">{description}</p>}
    <div className={description ? 'border-t border-slate-200/80 pt-6' : 'mt-4'}>
      {children}
    </div>
  </section>
);

const SettingsPage: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const { currentUserPlan } = usePlans();
  const { setCurrency: setGlobalCurrency } = useLocalization();
  const logoUploadRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<CompanyDetails>({ name: '', address: '', phone: '', email: '', logoUrl: '' });
  const [currency, setCurrency] = useState<string>('USD');
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');

  useEffect(() => {
    if (user?.user_metadata) {
      setProfile(user.user_metadata.company_details || { name: '', address: '' });
      setCurrency(user.user_metadata.default_currency || 'USD');
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setLogoError("File is too large. Max size is 2MB.");
        return;
    }

    setLogoUploading(true);
    setLogoError('');
    try {
        const newLogoUrl = await uploadCompanyLogo(file, user.id);
        setProfile(prev => ({ ...prev, logoUrl: newLogoUrl }));
    } catch (err: any) {
        setLogoError(err.message || "Failed to upload logo.");
    } finally {
        setLogoUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingStatus('saving');
    setErrorMessage('');
    try {
      await supabase.auth.refreshSession();
      const { data: { user: latestUser } } = await supabase.auth.getUser();

      const { error } = await supabase.auth.updateUser({
        data: {
          ...latestUser?.user_metadata,
          company_details: profile,
          default_currency: currency,
        }
      });
      if (error) throw error;
      setSavingStatus('saved');
    } catch (e: any) {
      setSavingStatus('error');
      setErrorMessage(e.message || 'Failed to save settings.');
    } finally {
      setTimeout(() => setSavingStatus('idle'), 3000);
    }
  };
  
  const handleDeleteAccount = () => {
      if(window.confirm("Are you sure you want to delete your account? This action is irreversible and all your data will be lost.")) {
          alert("Account deletion is a critical feature. Please contact support to proceed.");
          // To implement: call a Supabase Edge function to delete user data and auth user.
      }
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency); // Update local state for the form
    setGlobalCurrency(newCurrency); // Update global context for real-time app changes
  };

  if (authLoading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
      
      <SettingsCard title="Company Profile" description="This information will pre-fill new invoices.">
          <div className="mt-6 flex items-center gap-5">
            <img 
              src={profile.logoUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name || 'C'}&backgroundColor=c084fc,bbf7d0,facc15&radius=50`}
              alt="Company Logo Preview" 
              className="w-20 h-20 rounded-full object-cover bg-slate-100 border-2 border-white shadow-md"
            />
            <div>
              <input 
                type="file" 
                ref={logoUploadRef} 
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleLogoUpload}
                disabled={logoUploading}
              />
              <Button onClick={() => logoUploadRef.current?.click()} variant="secondary" disabled={logoUploading}>
                {logoUploading ? 'Uploading...' : 'Change Logo'}
              </Button>
              {logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, or GIF (Max 2MB)</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Company Name" name="name" value={profile.name || ''} onChange={handleProfileChange} />
            <Input label="Company Email" name="email" type="email" value={profile.email || ''} onChange={handleProfileChange} />
            <Textarea label="Company Address" name="address" value={profile.address || ''} onChange={handleProfileChange} className="md:col-span-2" />
            <Input label="Company Phone" name="phone" type="tel" value={profile.phone || ''} onChange={handleProfileChange} />
          </div>
      </SettingsCard>

       <SettingsCard title="Preferences" description="Customize your default settings for new documents.">
           <Select 
            label="Default Currency"
            name="currency"
            value={currency}
            onChange={handleCurrencyChange}
            options={CURRENCY_OPTIONS}
           />
        </SettingsCard>
        
        <SettingsCard title="Subscription" description={`You are currently on the ${currentUserPlan?.name || '...'} plan.`}>
            <Link to="/pricing">
                <Button variant="secondary" className="mt-4">
                  View Plans & Manage Subscription
                </Button>
            </Link>
        </SettingsCard>
        
        <SettingsCard title="Danger Zone" className="border-red-500/30 bg-red-50/30">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-semibold text-slate-800">Logout</h3>
                    <p className="text-sm text-slate-500">End your current session on this device.</p>
                </div>
                 <Button onClick={() => logout()} variant="secondary" leftIcon={<PowerIcon className="w-5 h-5"/>}>Logout</Button>
            </div>
             <div className="mt-6 pt-6 border-t border-red-200/80 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-semibold text-red-800">Delete Account</h3>
                    <p className="text-sm text-red-600">Permanently delete your account and all associated data. This action is irreversible.</p>
                </div>
                 <Button onClick={handleDeleteAccount} variant="danger" leftIcon={<TrashIcon className="w-5 h-5"/>}>Delete Account</Button>
            </div>
        </SettingsCard>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm -mx-8 -mb-8 py-4 px-8 border-t border-slate-200">
           <div className="max-w-4xl mx-auto flex justify-end items-center gap-4">
              {savingStatus === 'saving' && <span className="text-sm italic text-slate-500">Saving...</span>}
              {savingStatus === 'saved' && <span className="text-sm italic text-green-600">Settings saved successfully!</span>}
              {savingStatus === 'error' && <span className="text-sm italic text-red-500">{errorMessage}</span>}
              <Button onClick={handleSaveSettings} variant="primary" disabled={savingStatus === 'saving' || logoUploading}>
                {savingStatus === 'saving' ? 'Saving...' : 'Save Changes'}
              </Button>
           </div>
        </div>
    </div>
  );
};
export default SettingsPage;
