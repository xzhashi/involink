import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { DEFAULT_CURRENCY } from '../constants.ts';

interface LocalizationContextType {
  currency: string;
  countryCode: string | null;
  loading: boolean;
  error: string | null;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocalization = async () => {
      setLoading(true);
      try {
        // Using a CORS-friendly and reliable IP API
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error(`Failed to fetch localization data: ${response.statusText}`);
        }
        const data = await response.json();
        if (data && data.currency) {
          setCurrency(data.currency);
          setCountryCode(data.country_code);
        } else {
          // Fallback if API response is malformed but successful
          setCurrency(DEFAULT_CURRENCY);
        }
      } catch (err: any) {
        setError(err.message || 'Could not determine location.');
        // Fallback to default currency on error
        setCurrency(DEFAULT_CURRENCY);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalization();
  }, []);

  const value = { currency, countryCode, loading, error };

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
