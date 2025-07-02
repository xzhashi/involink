import { supabase } from './supabaseClient.ts';

// New async helper to parse error details from the edge function response
const getDetailedError = async (error: any): Promise<string> => {
    // FunctionsHttpError has a context object with the Response
    if (error.context && typeof error.context.json === 'function') {
        try {
            const errorBody = await error.context.json();
            // The edge functions return { error: 'message' }
            return errorBody.error || error.message;
        } catch (e) {
            // If parsing fails, fall back to the generic message
            return error.message;
        }
    }
    return error.message || 'An unknown error occurred.';
}


/**
 * Suggests alternative item descriptions by calling a Supabase Edge Function.
 * @param keyword - The user's input for an item description.
 * @returns A promise that resolves to an array of suggested descriptions.
 */
export const suggestItemDescriptions = async (keyword: string): Promise<string[]> => {
  if (!keyword.trim()) {
    return [];
  }
  
  try {
    const { data: suggestions, error } = await supabase.functions.invoke('suggest-description', {
        body: { keyword },
    });

    if (error) throw error;

    if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
      return suggestions.slice(0, 4); // Limit to max 4 suggestions
    }
    
    return [];
  } catch (error: any) {
    console.error("Error fetching suggestions from Gemini service:", await getDetailedError(error));
    return [];
  }
};

/**
 * Suggests a friendly and professional note for the invoice by calling a Supabase Edge Function.
 * @param context - A string containing sender name, recipient name, and invoice total.
 * @returns A promise that resolves to a suggested note.
 */
export const suggestInvoiceNote = async (context: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('suggest-note', {
        body: { context },
    });

    if (error) throw error;
    
    return data?.note || "Thank you for your business.";
  } catch (error: any) {
    console.error("Error fetching note suggestion from Gemini service:", await getDetailedError(error));
    return "Thank you for your business.";
  }
};