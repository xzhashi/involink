import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import Input from '../components/common/Input.tsx';
import Button from '../components/common/Button.tsx';
import { SparklesIcon } from '../components/icons/SparklesIcon.tsx';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingUi, setLoadingUi] = useState(false); // Renamed to avoid conflict with auth.loading
  const { login, signup, user, loading: authLoading } = useAuth(); // Use authLoading
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/create"; // Redirect after login

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.search]);

  React.useEffect(() => {
    if (user && !authLoading) { // Ensure auth state is resolved before navigating
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoadingUi(true);

    try {
      if (isLogin) {
        const { error } = await login(email, password);
        if (error) throw error;
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        // Navigation is handled by useEffect after user state updates
      } else {
        const { data, error } = await signup(email, password);
        if (error) throw error;

        if (data.user && !data.session) {
            // Email confirmation required
            setMessage('Signup successful! Please check your email to confirm your account.');
        } else if (data.user && data.session) {
           setMessage('Signup successful! Redirecting...');
           // Navigation is handled by useEffect
        } else {
            setMessage('Signup process initiated. Please follow any instructions provided.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoadingUi(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <SparklesIcon className="mx-auto h-12 w-auto text-primary-DEFAULT" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-darkest">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-center text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          {message && <p className="text-center text-sm text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
          
          <Input
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loadingUi || authLoading}
          />
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loadingUi || authLoading}
          />

          {isLogin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  name="remember-me" 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-DEFAULT focus:ring-primary-dark border-gray-300 rounded" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-dark">
                  Remember me
                </label>
              </div>
            </div>
          )}

          <div>
            <Button type="submit" className="w-full" disabled={loadingUi || authLoading}>
              {loadingUi ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign in' : 'Create account')}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button
            onClick={() => { 
              setIsLogin(!isLogin); 
              setError(null); 
              setMessage(null);
            }}
            className="font-medium text-primary-DEFAULT hover:text-primary-dark"
            disabled={loadingUi || authLoading}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;