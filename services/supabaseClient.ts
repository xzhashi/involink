
import { createClient } from '@supabase/supabase-js';
import { InvoiceData, InvoiceDataJson } from '../types';

// These should be set in your environment variables
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// --- Temporary fix for environment variable issue: Hardcoding credentials ---
const supabaseUrl = "https://linkfcinv.brandsscaler.com";
const supabaseAnonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1MDkyNDAyMCwiZXhwIjo0OTA2NTk3NjIwLCJyb2xlIjoiYW5vbiJ9.iyegAqufgTE3eQTKtJTR4HDrx24aZhjM2m1aOgRMeMI";
// --- End of temporary fix ---

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. " +
    "Ensure SUPABASE_URL and SUPABASE_ANON_KEY environment variables are set or hardcoded for this environment."
  );
  // Potentially throw an error or use a mock client for development if desired
  // For this fix, if they are still missing after hardcoding attempt, something is very wrong.
  throw new Error("Supabase credentials are still missing after attempting to hardcode them.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database functions for invoices

// Converts client-side InvoiceData to what's stored in Supabase
// (separating invoice_number and putting the rest into invoice_data_json)
const toSupabaseInvoiceFormat = (invoice: InvoiceData): { invoice_number: string; user_id?: string; invoice_data_json: InvoiceDataJson } => {
  const { db_id, user_id, id, ...jsonData } = invoice;
  return {
    invoice_number: id, // This is the human-readable invoice ID
    user_id,
    invoice_data_json: {
      date: jsonData.date,
      dueDate: jsonData.dueDate,
      sender: jsonData.sender,
      recipient: jsonData.recipient,
      items: jsonData.items,
      notes: jsonData.notes,
      terms: jsonData.terms,
      taxRate: jsonData.taxRate,
      discount: jsonData.discount,
      currency: jsonData.currency,
      selectedTemplateId: jsonData.selectedTemplateId,
      manualPaymentLink: jsonData.manualPaymentLink, // Ensure this is included
    }
  };
};

// Converts Supabase row to client-side InvoiceData
const fromSupabaseInvoiceFormat = (row: any): InvoiceData => {
  const jsonData = row.invoice_data_json || {};
  return {
    db_id: row.id, // This is the Supabase UUID primary key
    user_id: row.user_id,
    id: row.invoice_number, // This is the human-readable invoice ID
    date: jsonData.date || new Date().toISOString().split('T')[0],
    dueDate: jsonData.dueDate || new Date().toISOString().split('T')[0],
    sender: jsonData.sender || { name: '', address: '' },
    recipient: jsonData.recipient || { name: '', address: '' },
    items: Array.isArray(jsonData.items) ? jsonData.items : [],
    notes: jsonData.notes || '',
    terms: jsonData.terms || '',
    taxRate: typeof jsonData.taxRate === 'number' ? jsonData.taxRate : 0,
    discount: jsonData.discount || { type: 'percentage', value: 0 },
    currency: jsonData.currency || 'USD',
    selectedTemplateId: jsonData.selectedTemplateId || 'modern',
    manualPaymentLink: jsonData.manualPaymentLink || '', // Ensure this is included
  };
};


export const saveInvoiceToSupabase = async (invoice: InvoiceData): Promise<InvoiceData | null> => {
  if (!invoice.user_id) {
    console.error("User ID is required to save invoice to Supabase.");
    return null; // Or throw error
  }

  const { invoice_number, user_id, invoice_data_json } = toSupabaseInvoiceFormat(invoice);
  
  let response;
  if (invoice.db_id) { // If db_id exists, it's an update
    response = await supabase
      .from('invoices')
      .update({ invoice_number, invoice_data_json, user_id, updated_at: new Date().toISOString() })
      .eq('id', invoice.db_id)
      .eq('user_id', invoice.user_id) // Ensure user owns the invoice
      .select()
      .single();
  } else { // Otherwise, it's an insert
    response = await supabase
      .from('invoices')
      .insert({ invoice_number, invoice_data_json, user_id })
      .select()
      .single();
  }

  if (response.error) {
    console.error('Error saving invoice to Supabase:', response.error);
    throw response.error;
  }
  
  return response.data ? fromSupabaseInvoiceFormat(response.data) : null;
};

export const fetchLatestInvoiceFromSupabase = async (userId: string): Promise<InvoiceData | null> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: "Searched item was not found" - not an error if no invoices yet
    console.error('Error fetching latest invoice from Supabase:', error);
    throw error;
  }
  return data ? fromSupabaseInvoiceFormat(data) : null;
};

export const fetchInvoiceByIdFromSupabase = async (dbId: string, userId: string): Promise<InvoiceData | null> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', dbId)
    .eq('user_id', userId) // Ensure user owns the invoice
    .single();

  if (error) {
    console.error('Error fetching invoice by ID from Supabase:', error);
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data ? fromSupabaseInvoiceFormat(data) : null;
};

// Example function to fetch all invoices for a user (you might want pagination for real app)
export const fetchUserInvoicesFromSupabase = async (userId: string): Promise<InvoiceData[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user invoices:', error);
    throw error;
  }
  return data ? data.map(fromSupabaseInvoiceFormat) : [];
};

export const deleteInvoiceFromSupabase = async (dbId: string, userId: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', dbId)
    .eq('user_id', userId); // Ensure user owns the invoice before deleting

  if (error) {
    console.error('Error deleting invoice from Supabase:', error);
  }
  return { error };
};