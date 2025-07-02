

import { createClient } from '@supabase/supabase-js';
import { InvoiceData, InvoiceDataJson, InvoiceType, InvoiceStatus, Client, Attachment } from '../types.ts';
import { INITIAL_CUSTOMIZATION_STATE } from '../constants.ts';

// --- IMPORTANT DEPLOYMENT NOTE ---
// The values for `supabaseUrl` and `supabaseAnonKey` have been hardcoded
// with the credentials you provided to fix deployment issues.
const supabaseUrl = "https://linkfcinv.brandsscaler.com/";
const supabaseAnonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1MDkyNDAyMCwiZXhwIjo0OTA2NTk3NjIwLCJyb2xlIjoiYW5vbiJ9.iyegAqufgTE3eQTKtJTR4HDrx24aZhjM2m1aOgRMeMI";

// Initialize the client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// --- Helper Functions ---
const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
};

// --- Client Management ---
export const fetchUserClients = async (): Promise<Client[]> => {
    const userId = await getUserId();
    if (!userId) return [];
    
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const saveClient = async (client: Partial<Client>): Promise<Client | null> => {
    const userId = await getUserId();
    if (!userId) throw new Error("User must be logged in to save a client.");

    const payload = { ...client, user_id: userId, updated_at: new Date().toISOString() };
    
    // Upsert logic: if there's an ID, update; otherwise, insert.
    const { data, error } = await supabase
        .from('clients')
        .upsert(payload)
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

export const deleteClient = async (clientId: string): Promise<{ error: any }> => {
    const userId = await getUserId();
    if (!userId) throw new Error("User must be logged in to delete a client.");

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', userId); // Ensure ownership
    
    return { error };
};

// --- Attachments ---
const ATTACHMENT_BUCKET = 'invoice-attachments';

export const uploadAttachment = async (file: File, userId: string, invoiceId: string): Promise<Attachment> => {
  const filePath = `${userId}/${invoiceId}/${file.name}`;
  const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(filePath);
  if (!data.publicUrl) throw new Error("Could not get public URL for uploaded file.");

  return {
    name: file.name,
    url: data.publicUrl,
    size: file.size,
    filePath: filePath,
  };
};

export const deleteAttachment = async (filePath: string): Promise<{ success: boolean; error: any }> => {
  const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).remove([filePath]);
  return { success: !error, error };
};


// --- Invoice/Quote/Recurring Document Management ---

// Converts client-side InvoiceData to what's stored in Supabase
const toSupabaseInvoiceFormat = (invoice: InvoiceData) => {
  const { db_id, user_id, id, ...jsonData } = invoice;
  return {
    invoice_number: id,
    user_id,
    type: invoice.type,
    status: invoice.status,
    client_id: invoice.client_id,
    is_public: invoice.is_public, // Make sure top-level is_public is passed
    recurring_frequency: invoice.recurring_frequency,
    recurring_next_issue_date: invoice.recurring_next_issue_date,
    recurring_end_date: invoice.recurring_end_date,
    recurring_status: invoice.recurring_status,
    recurring_template_id: invoice.recurring_template_id,
    attachments: invoice.attachments,
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
      manualPaymentLink: jsonData.manualPaymentLink,
      has_branding: jsonData.has_branding,
      is_public: jsonData.is_public,
      upiId: jsonData.upiId,
      customization: jsonData.customization,
      attachments: jsonData.attachments,
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
    manualPaymentLink: jsonData.manualPaymentLink || '',
    has_branding: jsonData.has_branding === undefined ? true : jsonData.has_branding,
    is_public: row.is_public || false,
    upiId: jsonData.upiId || '',
    customization: { ...INITIAL_CUSTOMIZATION_STATE, ...(jsonData.customization || {}) },
    attachments: Array.isArray(row.attachments) ? row.attachments : (Array.isArray(jsonData.attachments) ? jsonData.attachments : []),
    type: row.type || 'invoice',
    status: row.status || 'draft',
    client_id: row.client_id,
    recurring_frequency: row.recurring_frequency,
    recurring_next_issue_date: row.recurring_next_issue_date,
    recurring_end_date: row.recurring_end_date,
    recurring_status: row.recurring_status,
    recurring_template_id: row.recurring_template_id,
  };
};


export const saveInvoiceToSupabase = async (invoice: InvoiceData): Promise<InvoiceData | null> => {
  if (!invoice.user_id) {
    throw new Error("User ID is required to save invoice to Supabase.");
  }

  const payload = toSupabaseInvoiceFormat(invoice);
  
  let response;
  if (invoice.db_id) { // If db_id exists, it's an update
    response = await supabase
      .from('invoices')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', invoice.db_id)
      .eq('user_id', invoice.user_id) // Ensure user owns the invoice
      .select()
      .single();
  } else { // Otherwise, it's an insert
    response = await supabase
      .from('invoices')
      .insert(payload)
      .select()
      .single();
  }

  if (response.error) {
    throw response.error;
  }
  
  return response.data ? fromSupabaseInvoiceFormat(response.data) : null;
};

export const fetchInvoiceByIdFromSupabase = async (dbId: string): Promise<InvoiceData | null> => {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', dbId)
    .eq('user_id', userId) // Ensure user owns the invoice
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data ? fromSupabaseInvoiceFormat(data) : null;
};

export const fetchPublicInvoiceByIdFromSupabase = async (dbId: string): Promise<InvoiceData | null> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', dbId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  if (data && !data.is_public) { // Extra check in case RLS is misconfigured
      const { data: { session } } = await supabase.auth.getSession();
      if(session?.user?.id !== data.user_id) return null;
  }

  return data ? fromSupabaseInvoiceFormat(data) : null;
};

export const fetchUserDocuments = async (userId: string, docType: InvoiceType): Promise<InvoiceData[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .eq('type', docType)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data ? data.map(fromSupabaseInvoiceFormat) : [];
};

export const deleteInvoiceFromSupabase = async (dbId: string): Promise<{ error: any }> => {
  const userId = await getUserId();
  if (!userId) throw new Error("User not authenticated");

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', dbId)
    .eq('user_id', userId);

  return { error };
};

export const makeInvoicePublic = async (dbId: string): Promise<{ success: boolean; error: any }> => {
    const userId = await getUserId();
    if (!userId) return { success: false, error: { message: 'Not authenticated' } };

    const { data: currentData, error: fetchError } = await supabase
        .from('invoices')
        .select('invoice_data_json')
        .eq('id', dbId)
        .eq('user_id', userId)
        .single();
    
    if (fetchError) {
        console.error('Error fetching invoice to make public:', fetchError);
        return { success: false, error: fetchError };
    }

    const updatedJson = {
        ...(currentData.invoice_data_json || {}),
        is_public: true,
    };

    const { error } = await supabase
        .from('invoices')
        .update({ is_public: true, invoice_data_json: updatedJson })
        .eq('id', dbId);
    
    return { success: !error, error };
};

export const updateInvoiceStatus = async (dbId: string, status: InvoiceStatus): Promise<{ error: any }> => {
    const userId = await getUserId();
    if (!userId) return { error: { message: "Not authenticated" } };

    const { error } = await supabase
        .from('invoices')
        .update({ status: status, updated_at: new Date().toISOString() })
        .eq('id', dbId)
        .eq('user_id', userId);
    
    return { error };
};

export const convertQuoteToInvoice = async (quoteId: string): Promise<{ data: InvoiceData | null, error: any }> => {
  const userId = await getUserId();
  if (!userId) return { data: null, error: { message: "Not authenticated" } };

  // 1. Fetch the quote
  const { data: quoteData, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .single();

  if (fetchError) return { data: null, error: fetchError };

  // 2. Update the quote's status to 'accepted'
  await updateInvoiceStatus(quoteId, 'accepted');

  // 3. Create a new invoice from the quote data
  const invoiceFromQuote: InvoiceData = fromSupabaseInvoiceFormat(quoteData);
  invoiceFromQuote.type = 'invoice';
  invoiceFromQuote.status = 'draft';
  invoiceFromQuote.id = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  // Remove fields that should not be carried over to the new invoice
  delete invoiceFromQuote.db_id;
  
  const savedInvoice = await saveInvoiceToSupabase(invoiceFromQuote);
  
  if (!savedInvoice) {
    return { data: null, error: { message: "Failed to save new invoice after conversion." } };
  }

  return { data: savedInvoice, error: null };
};

// --- Reports Data ---
export const fetchReportsData = async () => {
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");
    
    // Fetch all invoices for the user
    const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('invoice_data_json, status, client_id, created_at, type')
        .eq('user_id', userId);
        
    if (invoiceError) throw invoiceError;

    // Fetch all clients for the user
    const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', userId);

    if (clientError) throw clientError;

    return { invoices, clients };
};
