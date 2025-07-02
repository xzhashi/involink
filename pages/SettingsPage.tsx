import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePlans } from '../contexts/PlanContext.tsx';
import { supabase, uploadCompanyLogo } from '../services/supabaseClient.ts';
import Input from '../components/common/Input.tsx';
import Button from '../components/common/Button.tsx';
import Textarea from '../components/common/Textarea.tsx';
import Select from '../components/common/Select.tsx';
import { CompanyDetails } from '../types.ts';
import { CURRENCY_OPTIONS } from '../currencies.ts';

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold text-neutral-darkest mb-4 border-b pb-3">{title}</h2>
    {children}
  </section>
);

const SettingsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentUserPlan } = usePlans();
  
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
      // Refresh user to get latest metadata before overwriting
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

  if (authLoading) return <div>Loading settings...</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-neutral-darkest mb-8">Settings</h1>
      <div className="space-y-8">
        <SettingsCard title="Account Information">
          <Input 
            label="Email Address" 
            id="email" 
            value={user?.email || ''} 
            readOnly 
            disabled 
            wrapperClassName="!mb-0" 
            className="bg-neutral-lightest cursor-default"
          />
          <p className="text-xs text-neutral-DEFAULT mt-1">Your email address is used for login and cannot be changed here.</p>
        </SettingsCard>

        <SettingsCard title="Profile Details">
          <p className="text-sm text-neutral-DEFAULT mb-4">This information will be used to pre-fill the 'From' section on new invoices.</p>
          <div className="space-y-4">
              <Input label="Company Name" name="name" value={profile.name || ''} onChange={handleProfileChange} />
              <Textarea label="Company Address" name="address" value={profile.address || ''} onChange={handleProfileChange} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Company Email" name="email" type="email" value={profile.email || ''} onChange={handleProfileChange} />
                <Input label="Company Phone" name="phone" type="tel" value={profile.phone || ''} onChange={handleProfileChange} />
              </div>
              
               <div className="mt-4">
                  <label className="block text-sm font-medium text-neutral-dark mb-2">Company Logo</label>
                  <div className="flex items-center gap-4">
                      <img 
                          src={profile.logoUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name || 'C'}`} 
                          alt="Company Logo Preview" 
                          className="w-16 h-16 rounded-md object-cover bg-slate-100 border"
                      />
                      <div className="flex-grow">
                          <input
                              type="file"
                              id="logo-upload"
                              accept="image/png, image/jpeg, image/gif"
                              onChange={handleLogoUpload}
                              disabled={logoUploading}
                              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-lightest file:text-primary-dark hover:file:bg-slate-200"
                          />
                          {logoUploading && <p className="text-xs text-neutral-DEFAULT mt-1 animate-pulse">Uploading...</p>}
                          {logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
                          <p className="text-xs text-neutral-DEFAULT mt-1">PNG, JPG, or GIF. Max 2MB. Your new logo is ready to be saved.</p>
                      </div>
                  </div>
              </div>

          </div>
        </SettingsCard>

        <SettingsCard title="Preferences">
           <Select 
            label="Default Currency"
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={CURRENCY_OPTIONS}
           />
           <p className="text-xs text-neutral-DEFAULT -mt-3">This will be the default currency for new invoices.</p>
        </SettingsCard>
        
        <div className="flex justify-end items-center gap-4">
          {savingStatus === 'saving' && <span className="text-sm italic text-neutral-DEFAULT">Saving...</span>}
          {savingStatus === 'saved' && <span className="text-sm italic text-green-600">Settings saved!</span>}
          {savingStatus === 'error' && <span className="text-sm italic text-red-500">{errorMessage}</span>}
          <Button onClick={handleSaveSettings} variant="primary" disabled={savingStatus === 'saving'}>
            {savingStatus === 'saving' ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>

        <SettingsCard title="Subscription">
          <p className="text-neutral-DEFAULT mb-1">You are currently on the <span className="font-semibold text-primary-DEFAULT">{currentUserPlan?.name || '...'}</span> plan.</p>
          <p className="text-neutral-DEFAULT">Manage your plan, view billing history, and update payment methods.</p>
          <Link to="/pricing">
            <Button variant="secondary" className="mt-4">
              View Plans & Upgrade
            </Button>
          </Link>
        </SettingsCard>
      </div>
    </div>
  );
};
export default SettingsPage;