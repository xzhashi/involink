import React, { useState, useEffect } from 'react';
import Button from '../common/Button.tsx';
import Input from '../common/Input.tsx';
import { fetchRazorpaySettings, updateRazorpaySettings } from '../../services/adminService.ts';

const AdminIntegrationsView: React.FC = () => {
    const [keyId, setKeyId] = useState('');
    const [keySecret, setKeySecret] = useState('');
    const [isSecretSet, setIsSecretSet] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            setLoading(true);
            setError(null);
            const { keyId, isSecretSet, error: fetchError } = await fetchRazorpaySettings();
            if (fetchError) {
                setError(fetchError);
            } else {
                setKeyId(keyId || '');
                setIsSecretSet(isSecretSet);
            }
            setLoading(false);
        };
        loadSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        if (!keyId) {
            setError("Razorpay Key ID cannot be empty.");
            setSaving(false);
            return;
        }

        const { success: updateSuccess, error: updateError } = await updateRazorpaySettings(keyId, keySecret);
        if (updateError) {
            setError(updateError);
        } else {
            setSuccess("Settings saved successfully! It may take a moment for changes to apply.");
            setKeySecret(''); // Clear secret field after save
            if (keySecret) {
                setIsSecretSet(true); // Assume secret is now set
            }
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-9 bg-slate-200 rounded w-1/3 mb-8"></div>
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-10 bg-slate-200 rounded w-full"></div>
                    <div className="h-5 bg-slate-200 rounded w-1/4 mt-4"></div>
                    <div className="h-10 bg-slate-200 rounded w-full"></div>
                    <div className="h-12 bg-slate-200 rounded w-32 mt-6"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-neutral-darkest mb-8">Payment Integrations</h1>
            
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
                <h2 className="text-xl font-semibold text-neutral-darkest mb-1">Razorpay Settings</h2>
                <p className="text-sm text-neutral-DEFAULT mb-6">Enter your API keys from the Razorpay Dashboard.</p>
                
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
                {success && <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4">{success}</p>}
                
                <form onSubmit={handleSave} className="space-y-6">
                    <Input
                        label="Razorpay Key ID"
                        id="razorpay-key-id"
                        value={keyId}
                        onChange={(e) => setKeyId(e.target.value)}
                        placeholder="rzp_live_xxxxxxxxxxxxxx"
                        required
                        disabled={saving}
                    />
                    <Input
                        label="Razorpay Key Secret"
                        id="razorpay-key-secret"
                        type="password"
                        value={keySecret}
                        onChange={(e) => setKeySecret(e.target.value)}
                        placeholder={isSecretSet ? "•••••••••••••••• (already set, enter to change)" : "Enter your key secret"}
                        disabled={saving}
                    />
                    <div>
                        <Button type="submit" variant="primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>

                 <p className="text-xs text-neutral-DEFAULT mt-6 pt-4 border-t border-neutral-light">
                    <strong>Note:</strong> These settings are stored in your database. Ensure your RLS policies for the `app_config` table are secure, only allowing admins to read/write. Saving settings calls a Supabase Edge Function to securely update the values.
                </p>
            </div>
        </div>
    );
};

export default AdminIntegrationsView;
