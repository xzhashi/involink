
import React, { useState, useEffect } from 'react';
import { UserApiKey } from '../types.ts';
import { fetchApiKeyInfo, generateNewApiKey, revokeApiKey } from '../services/supabaseClient.ts';
import Button from '../components/common/Button.tsx';
import { KeyIcon } from '../components/icons/KeyIcon.tsx';
import { CopyIcon } from '../components/icons/CopyIcon.tsx';
import { XMarkIcon } from '../components/icons/XMarkIcon.tsx';

const ApiSettingsPage: React.FC = () => {
    const [apiKeyInfo, setApiKeyInfo] = useState<UserApiKey | null>(null);
    const [newApiKey, setNewApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    
    const [showConfirmGenerate, setShowConfirmGenerate] = useState(false);
    const [showConfirmRevoke, setShowConfirmRevoke] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadKeyInfo = async () => {
            setLoading(true);
            setError(null);
            try {
                const info = await fetchApiKeyInfo();
                setApiKeyInfo(info);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch API key information.');
            } finally {
                setLoading(false);
            }
        };
        loadKeyInfo();
    }, []);

    const handleGenerate = async () => {
        setProcessing(true);
        setError(null);
        setShowConfirmGenerate(false);
        try {
            const key = await generateNewApiKey();
            if (key) {
                setNewApiKey(key);
                // Refetch info to update display
                const info = await fetchApiKeyInfo();
                setApiKeyInfo(info);
            } else {
                throw new Error("Failed to generate key. The server returned an empty response.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during key generation.");
        } finally {
            setProcessing(false);
        }
    };

    const handleRevoke = async () => {
        setProcessing(true);
        setError(null);
        setShowConfirmRevoke(false);
        try {
            const { success } = await revokeApiKey();
            if (success) {
                setApiKeyInfo(null);
            } else {
                throw new Error("Failed to revoke key.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during key revocation.");
        } finally {
            setProcessing(false);
        }
    };

    const handleCopy = () => {
        if (newApiKey) {
            navigator.clipboard.writeText(newApiKey);
            setCopied(true);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold text-neutral-darkest mb-2">API Access</h1>
            <p className="text-neutral-DEFAULT mb-8">Manage API keys to integrate your account with other applications.</p>
            
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <h2 className="text-xl font-semibold text-neutral-darkest">Your API Key</h2>
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                        <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                    </div>
                ) : apiKeyInfo ? (
                    <div>
                        <p className="text-neutral-dark">An API key has been generated for your account.</p>
                        <div className="mt-3 bg-slate-100 p-3 rounded-md flex items-center gap-4">
                            <KeyIcon className="w-5 h-5 text-neutral-500"/>
                            <p className="font-mono text-sm text-neutral-700">
                                {apiKeyInfo.key_prefix}....{apiKeyInfo.last_4}
                            </p>
                            <p className="text-xs text-neutral-500 ml-auto">
                                Created: {new Date(apiKeyInfo.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-neutral-dark">You do not have an active API key.</p>
                )}

                <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button onClick={() => setShowConfirmGenerate(true)} disabled={processing}>
                        {apiKeyInfo ? 'Regenerate API Key' : 'Generate New API Key'}
                    </Button>
                    {apiKeyInfo && (
                        <Button variant="danger" onClick={() => setShowConfirmRevoke(true)} disabled={processing}>
                            Revoke API Key
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mt-8 space-y-4">
                 <h2 className="text-xl font-semibold text-neutral-darkest">API Documentation</h2>
                 <p className="text-sm text-neutral-DEFAULT">Use your API key in the header of your requests to authenticate.</p>
                 <div>
                    <h3 className="font-semibold mb-1 text-neutral-dark">Example: Fetch Invoices</h3>
                    <p className="text-sm text-neutral-DEFAULT mb-2">Endpoint: <code className="bg-slate-100 p-1 rounded font-mono text-xs">GET /api/v1/invoices</code></p>
                    <pre className="bg-slate-800 text-white p-4 rounded-md text-xs overflow-x-auto">
                        <code>
                            curl --request GET \<br/>
                            --url '{window.location.origin}/api/v1/invoices' \<br/>
                            --header 'x-api-key: YOUR_API_KEY'
                        </code>
                    </pre>
                 </div>
            </div>

            {/* Confirmation Modals */}
            {showConfirmGenerate && (
                <ConfirmModal 
                    title={apiKeyInfo ? "Regenerate API Key?" : "Generate API Key?"}
                    onConfirm={handleGenerate} 
                    onCancel={() => setShowConfirmGenerate(false)} 
                    confirmText={apiKeyInfo ? "Regenerate" : "Generate"}
                    variant="primary"
                >
                    {apiKeyInfo && "Your existing API key will be immediately invalidated. This action cannot be undone."}
                    Are you sure you want to proceed?
                </ConfirmModal>
            )}
             {showConfirmRevoke && (
                <ConfirmModal 
                    title="Revoke API Key?"
                    onConfirm={handleRevoke} 
                    onCancel={() => setShowConfirmRevoke(false)} 
                    confirmText="Revoke Key"
                    variant="danger"
                >
                    Your API key will be permanently deleted and all integrations using it will stop working. This action cannot be undone.
                </ConfirmModal>
            )}

            {/* New Key Display Modal */}
            {newApiKey && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <h3 className="text-xl font-bold text-neutral-darkest">Your New API Key</h3>
                        <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md my-3">
                            This is the only time you will see this key. Copy it and store it somewhere safe.
                        </p>
                        <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-md font-mono text-sm text-neutral-700 break-all">
                            <span>{newApiKey}</span>
                            <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy API Key" className="ml-auto">
                                {copied ? <span className="text-green-600">Copied!</span> : <CopyIcon className="w-5 h-5"/>}
                            </Button>
                        </div>
                        <div className="text-right mt-6">
                            <Button onClick={() => { setNewApiKey(null); setCopied(false); }}>I have saved my key</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ConfirmModal: React.FC<{
    title: string;
    children: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText: string;
    variant: 'primary' | 'danger';
}> = ({ title, children, onConfirm, onCancel, confirmText, variant }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold text-neutral-darkest mb-4">{title}</h3>
            <p className="text-sm text-neutral-DEFAULT mb-6">{children}</p>
            <div className="flex justify-end space-x-3">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
            </div>
        </div>
    </div>
);


export default ApiSettingsPage;
