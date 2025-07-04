
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import Input from '../components/common/Input.tsx';
import Button from '../components/common/Button.tsx';
import { SparklesIcon } from '../components/icons/SparklesIcon.tsx';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon.tsx';
import { CloudArrowUpIcon } from '../components/icons/CloudArrowUpIcon.tsx';
import { PaletteIcon } from '../components/icons/PaletteIcon.tsx';
import Checkbox from '../components/common/Checkbox.tsx';

const { useNavigate, useLocation, Link } = ReactRouterDOM;

type AuthMode = 'login' | 'signup' | 'forgotPassword';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingUi, setLoadingUi] = useState(false);

  const { login, signup, user, loading: authLoading, sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'signup') {
        setMode('signup');
    } else {
        setMode('login');
    }
  }, [location.search]);

  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);
  
  const clearState = () => {
    setError(null);
    setMessage(null);
    setPassword('');
  };

  const switchMode = (newMode: AuthMode) => {
    clearState();
    setMode(newMode);
    const params = new URLSearchParams(location.search);
    params.set('mode', newMode);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearState();
    setLoadingUi(true);

    try {
      if (mode === 'login') {
        const { error } = await login(email, password);
        if (error) throw error;
      } else if (mode === 'signup') {
        const { data, error } = await signup(email, password);
        if (error) throw error;
        setMessage('Signup successful! Please check your email to confirm your account.');
      } else if (mode === 'forgotPassword') {
        const { error } = await sendPasswordResetEmail(email);
        if (error) throw error;
        setMessage('Password reset link sent! Please check your email.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoadingUi(false);
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'forgotPassword':
        return (
          <>
            <h2 className="text-left text-3xl font-extrabold text-slate-900">Reset Password</h2>
            <p className="mt-2 text-left text-sm text-slate-600">
              Enter your email and we'll send you a link to get back into your account.
              <button onClick={() => switchMode('login')} className="font-medium text-primary hover:text-primary-dark ml-1">Back to Sign In</button>
            </p>
             <div className="mt-8">
              <form className="space-y-4" onSubmit={handleSubmit}>
                 <Input
                    label="Email address" id="email" name="email" type="email" autoComplete="email"
                    required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" disabled={loadingUi || authLoading}
                  />
                  <div className="pt-2">
                    <Button type="submit" className="w-full !py-3" disabled={loadingUi || authLoading}>
                      {loadingUi ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
              </form>
            </div>
          </>
        );
      case 'signup':
      case 'login':
      default:
        return (
          <>
            <h2 className="text-left text-3xl font-extrabold text-slate-900">
                {mode === 'login' ? 'Sign in' : 'Create an account'}
            </h2>
             <p className="mt-2 text-left text-sm text-slate-600">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className="font-medium text-primary hover:text-primary-dark ml-1">
                  {mode === 'login' ? "Sign up" : "Sign in"}
                </button>
            </p>
             <div className="mt-8">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <Input
                    label="Email address" id="email" name="email" type="email" autoComplete="email"
                    required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" disabled={loadingUi || authLoading}
                  />
                  <Input
                    label="Password" id="password" name="password" type="password"
                    autoComplete={mode === 'login' ? "current-password" : "new-password"} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" disabled={loadingUi || authLoading}
                  />

                  {mode === 'login' && (
                    <div className="flex items-center justify-between">
                      <Checkbox
                        id="remember-me"
                        label="Remember me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <div className="text-sm">
                        <button type="button" onClick={() => switchMode('forgotPassword')} className="font-medium text-primary hover:text-primary-dark">
                          Forgot password?
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button type="submit" className="w-full !py-3" disabled={loadingUi || authLoading}>
                      {loadingUi ? 'Processing...' : (mode === 'login' ? 'Sign in' : 'Create account')}
                    </Button>
                  </div>
                </form>
            </div>
          </>
        )
    }
  }


  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column: Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-28">
        <div className="mx-auto w-full max-w-md">
            <Link to="/" className="flex items-center justify-start text-primary hover:opacity-80 transition-opacity mb-8">
                <SparklesIcon className="h-8 w-auto mr-2" />
                <span className="font-bold text-2xl">Invoice Maker</span>
            </Link>
            
            <div className="min-h-[24rem]">
              {error && <p className="text-center text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
              {message && <p className="text-center text-sm text-green-600 bg-green-100 p-3 rounded-md mb-4">{message}</p>}
              {renderForm()}
            </div>
        </div>
      </div>
      
      {/* Right Column: Visual */}
      <div className="hidden md:flex w-1/2 bg-slate-100 items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 text-white p-10 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-black opacity-95"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
                <h1 className="text-3xl font-extrabold tracking-tight">Invoicing That Inspires</h1>
                <p className="mt-4 text-lg text-purple-200/80">
                    From beautiful templates to seamless payments, create invoices that impress your clients and get you paid faster.
                </p>
                <ul className="mt-8 space-y-4 text-slate-300">
                    <li className="flex items-start">
                        <PaletteIcon className="w-6 h-6 mr-3 text-pink-400 flex-shrink-0 mt-1"/>
                        <span><strong>Exquisite Templates.</strong> Choose from a gallery of professionally designed, modern invoice templates.</span>
                    </li>
                    <li className="flex items-start">
                        <DocumentTextIcon className="w-6 h-6 mr-3 text-purple-400 flex-shrink-0 mt-1"/>
                        <span><strong>Effortless Workflow.</strong> Create, customize, and send invoices in just a few clicks.</span>
                    </li>
                     <li className="flex items-start">
                        <CloudArrowUpIcon className="w-6 h-6 mr-3 text-sky-400 flex-shrink-0 mt-1"/>
                        <span><strong>Cloud Saved.</strong> Access your invoices from anywhere, securely stored in the cloud.</span>
                    </li>
                </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;