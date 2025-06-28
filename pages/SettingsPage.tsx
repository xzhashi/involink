import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold text-neutral-darkest mb-4 border-b pb-3">{title}</h2>
    {children}
  </section>
);

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
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

        <SettingsCard title="Profile (Coming Soon)">
          <p className="text-neutral-DEFAULT">Update your company details, logo, and other profile information.</p>
          <Button variant="ghost" className="mt-3" disabled>Edit Profile</Button>
        </SettingsCard>

        <SettingsCard title="Preferences (Coming Soon)">
          <p className="text-neutral-DEFAULT">Set your default currency, invoice template, tax rates, and other app preferences.</p>
           <Button variant="ghost" className="mt-3" disabled>Manage Preferences</Button>
        </SettingsCard>

        <SettingsCard title="Subscription (Coming Soon)">
          <p className="text-neutral-DEFAULT mb-1">You are currently on the <span className="font-semibold text-primary-DEFAULT">Free Plan</span>.</p>
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