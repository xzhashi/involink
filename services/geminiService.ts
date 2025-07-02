
import { supabase } from './supabaseClient.ts';

const handleInvokeError = (error: any, context: string): Error => {
    // A simplified error handler for the frontend
    console.error(`Error invoking function '${context}':`, error);
    const detailedError = error?.context?.json?.error;
    const message = typeof detailedError === 'string' ? detailedError : (error.message || `An unknown error occurred while trying to ${context}.`);
    return new Error(message);
};


/**
 * Suggests alternative item descriptions using Gemini AI.
 * @param keyword - The user's input for an item description.
 * @returns A promise that resolves to an array of string suggestions.
 */
export const suggestItemDescriptions = async (keyword: string): Promise<string[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Authentication required to use AI features.");

  const { data, error } = await supabase.functions.invoke('suggest-description', {
    body: { keyword },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) {
    throw handleInvokeError(error, 'suggest-description');
  }

  // The function is expected to return a JSON array of strings.
  if (Array.isArray(data) && data.every(item => typeof item === 'string')) {
    return data;
  }

  // Fallback if the response is not as expected
  return [];
};


/**
 * Suggests a friendly and professional note for the invoice using Gemini AI.
 * @param context - A string containing sender name, recipient name, and invoice total.
 * @returns A promise that resolves to a suggested note string.
 */
export const suggestInvoiceNote = async (context: string): Promise<string> => {
   const { data: { session } } = await supabase.auth.getSession();
   if (!session) throw new Error("Authentication required to use AI features.");

   const { data, error } = await supabase.functions.invoke('suggest-note', {
    body: { context },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) {
    throw handleInvokeError(error, 'suggest-note');
  }

  if (data && typeof data.note === 'string') {
    return data.note;
  }
  
  return "Thank you for your business.";
};
