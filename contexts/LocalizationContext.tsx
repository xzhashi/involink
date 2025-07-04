
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { DEFAULT_CURRENCY } from '../constants.ts';
import { useAuth } from './AuthContext.tsx';

interface LocalizationContextType {
  currency: string;
  countryCode: string | null;
  loading: boolean;
  error: string | null;
  setCurrency: (currency: string) => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setCurrency = useCallback((newCurrency: string) => {
    setCurrencyState(newCurrency);
  }, []);

  useEffect(() => {
    const fetchLocalization = async () => {
      // Don't do anything until auth state is resolved
      if (authLoading) {
        setLoading(true);
        return;
      }
      
      setLoading(true);
      setError(null);

      // Priority 1: Use the logged-in user's saved preference
      if (user?.user_metadata?.default_currency) {
        setCurrencyState(user.user_metadata.default_currency);
        setCountryCode(null); // Geolocation is not used if preference is set
        setLoading(false);
        return;
      }

      // Priority 2: Use geolocation for guests or users without a preference
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error(`Failed to fetch localization data: ${response.statusText}`);
        }
        const data = await response.json();
        if (data && data.country_code) {
          const country = data.country_code;
          setCountryCode(country);
          if (country === 'IN') {
            setCurrencyState('INR');
          } else {
            setCurrencyState('USD');
          }
        } else {
          setCurrencyState(DEFAULT_CURRENCY);
        }
      } catch (err: any) {
        setError(err.message || 'Could not determine location.');
        setCurrencyState(DEFAULT_CURRENCY); // Fallback to default
      } finally {
        setLoading(false);
      }
    };

    fetchLocalization();
  }, [user, authLoading]); // Rerun when user logs in/out

  const value = { currency, countryCode, loading, error, setCurrency };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
