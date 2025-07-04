
import { createClient } from '@supabase/supabase-js';
import { Database, InvoiceData, InvoiceDataJson, InvoiceType, InvoiceStatus, Client, Attachment, Product, ContactSubmission, UserApiKey, Blog, Tax } from '../types.ts';
import { INITIAL_CUSTOMIZATION_STATE } from '../constants.ts';

// --- IMPORTANT DEPLOYMENT NOTE ---
// The values for `supabaseUrl` and `supabaseAnonKey` have been hardcoded
// with the credentials you provided to fix deployment issues.
const supabaseUrl = "https://linkfcinv.brandsscaler.com/";
const supabaseAnonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1MDkyNDAyMCwiZXhwIjo0OTA2NTk3NjIwLCJyb2xlIjoiYW5vbiJ9.iyegAqufgTE3eQTKtJTR4HDrx24aZhjM2m1aOgRMeMI";

// Initialize the client.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);


// --- Helper Functions ---
const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
};

// --- Attachments ---
const ATTACHMENT_BUCKET = 'invoice-attachments';

export const uploadCompanyLogo = async (file: File, userId: string): Promise<string> => {
    // Use a static name to overwrite the existing logo, simplifying management.
    const filePath = `public/${userId}/logo.png`; 
    const { error: uploadError } = await supabase.storage
        .from(ATTACHMENT_BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true, // Overwrite if file exists
        });

    if (uploadError) {
        console.error("Error uploading company logo:", uploadError);
        throw uploadError;
    }

    const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(filePath);

    if (!data.publicUrl) {
        throw new Error("Could not get public URL for uploaded logo.");
    }
    // To bypass browser cache after an upload, append a timestamp as a query parameter.
    return `${data.publicUrl}?t=${new Date().getTime()}`;
};


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
        .upsert([payload])
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


// --- Product/Service Management ---
export const fetchUserProducts = async (): Promise<Product[]> => {
    const userId = await getUserId();
    if (!userId) return [];
    
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const saveProduct = async (product: Partial<Product>): Promise<Product | null> => {
    const userId = await getUserId();
    if (!userId) throw new Error("User must be logged in to save a product.");

    // Remove manual updated_at. The database trigger now handles this automatically.
    const { updated_at, ...restOfProduct } = product; 
    const payload = { ...restOfProduct, user_id: userId };
    
    const { data, error } = await supabase
        .from('products')
        .upsert([payload])
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

export const deleteProduct = async (productId: string): Promise<{ error: any }> => {
    const userId = await getUserId();
    if (!userId) throw new Error("User must be logged in to delete a product.");

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', userId); // Ensure ownership
    
    return { error };
};

// --- Tax Management ---
export const fetchUserTaxes = async (): Promise<Tax[]> => {
    const userId = await getUserId();
    if (!userId) return [];
    
    const { data, error } = await supabase
        .from('taxes')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const saveTax = async (tax: Partial<Tax>): Promise<Tax | null> => {
    const userId = await getUserId();
    if (!userId) throw new Error("User must be logged in to save a tax.");

    const payload = { ...tax, user_id: userId };
    
    const { data, error } = await supabase
        .from('taxes')
        .upsert([payload])
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

export const deleteTax = async (taxId: string): Promise<{ error: any }> => {
    const userId = await getUserId();
    if (!userId) throw new Error("User must be logged in to delete a tax.");

    const { error } = await supabase
        .from('taxes')
        .delete()
        .eq('id', taxId)
        .eq('user_id', userId); 
    
    return { error };
};


// --- Invoice/Quote/Recurring Document Management ---

// Converts client-side InvoiceData to what's stored in Supabase
const toSupabaseInvoiceFormat = (invoice: InvoiceData) => {
  const { db_id, user_id, id, ...jsonData } = invoice;
  // This function ensures the `is_public` flag is set on the top-level column for RLS,
  // and also within the JSONB for data integrity and portability.
  return {
    invoice_number: id,
    user_id: user_id!,
    type: invoice.type,
    status: invoice.status,
    client_id: invoice.client_id || null,
    is_public: invoice.is_public || false, // This is the critical top-level field
    recurring_frequency: invoice.recurring_frequency || null,
    recurring_next_issue_date: invoice.recurring_next_issue_date || null,
    recurring_end_date: invoice.recurring_end_date || null,
    recurring_status: invoice.recurring_status || null,
    recurring_template_id: invoice.recurring_template_id || null,
    attachments: invoice.attachments || [],
    invoice_data_json: { ...jsonData, is_public: invoice.is_public } // The rest of the data, including is_public, goes here
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
    taxes: Array.isArray(jsonData.taxes) ? jsonData.taxes : [],
    discount: jsonData.discount || { type: 'percentage', value: 0 },
    currency: jsonData.currency || 'USD',
    selectedTemplateId: jsonData.selectedTemplateId || 'modern',
    manualPaymentLink: jsonData.manualPaymentLink || '',
    has_branding: jsonData.has_branding === undefined ? true : jsonData.has_branding,
    is_public: row.is_public || false, // Reads from the reliable top-level column
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
    const updatePayload: Database['public']['Tables']['invoices']['Update'] = { ...payload, updated_at: new Date().toISOString() };
    response = await supabase
      .from('invoices')
      .update(updatePayload)
      .eq('id', invoice.db_id)
      .eq('user_id', invoice.user_id) // Ensure user owns the invoice
      .select()
      .single();
  } else { // Otherwise, it's an insert
    response = await supabase
      .from('invoices')
      .insert([payload])
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

export const fetchUserDocuments = async (
    userId: string, 
    docType: InvoiceType,
    options?: {
        limit?: number;
        offset?: number;
        status?: InvoiceStatus | 'all';
        searchQuery?: string;
        startDate?: string;
        endDate?: string;
        clientId?: string | 'all';
    }
): Promise<InvoiceData[]> => {
    let query = supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .eq('type', docType);

    if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
    }

    if (options?.searchQuery) {
        const searchString = `%${options.searchQuery}%`;
        query = query.or(`invoice_number.ilike.${searchString},invoice_data_json->>recipient->>name.ilike.${searchString}`);
    }
    
    if (options?.startDate) {
        query = query.gte('created_at', `${options.startDate}T00:00:00.000Z`);
    }

    if (options?.endDate) {
        query = query.lte('created_at', `${options.endDate}T23:59:59.999Z`);
    }
    
    if (options?.clientId && options.clientId !== 'all') {
        query = query.eq('client_id', options.clientId);
    }
    
    query = query.order('created_at', { ascending: false });

    // Add pagination only if limit and offset are provided
    if (options?.limit && options.offset !== undefined) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching user documents:", error);
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
    
    if (fetchError || !currentData) {
        console.error('Error fetching invoice to make public:', fetchError);
        return { success: false, error: fetchError || { message: 'Invoice not found.' } };
    }

    const updatedJson = {
        ...(currentData.invoice_data_json || {}),
        is_public: true,
    };
    
    const payload: Database['public']['Tables']['invoices']['Update'] = { is_public: true, invoice_data_json: updatedJson };

    const { error } = await supabase
        .from('invoices')
        .update(payload)
        .eq('id', dbId);
    
    return { success: !error, error };
};

export const updateInvoiceStatus = async (dbId: string, status: InvoiceStatus): Promise<{ error: any }> => {
    const userId = await getUserId();
    if (!userId) return { error: { message: "Not authenticated" } };
    
    const payload: Database['public']['Tables']['invoices']['Update'] = { status: status, updated_at: new Date().toISOString() };

    const { error } = await supabase
        .from('invoices')
        .update(payload)
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

    return { invoices: invoices || [], clients: clients || [] };
};

// --- Contact Form Submissions ---
export const saveContactSubmission = async (submission: { name: string; email: string; subject: string; message: string; }): Promise<{ error: any }> => {
    const { error } = await supabase
        .from('contact_submissions')
        .insert([{ ...submission, is_read: false }]);
    return { error };
};

// --- API Key Management ---
export const fetchApiKeyInfo = async (): Promise<UserApiKey | null> => {
    const { data, error } = await supabase.functions.invoke('get-api-key-info');
    if (error) {
        // If the error is 'Key not found', it's not a "real" error, just means no key exists.
        if (error.context?.json?.error?.includes('not found')) {
            return null;
        }
        throw error;
    }
    return data;
};

export const generateNewApiKey = async (): Promise<string | null> => {
    const { data, error } = await supabase.functions.invoke('generate-api-key');
    if (error) throw error;
    return data?.apiKey || null;
};

export const revokeApiKey = async (): Promise<{ success: boolean }> => {
    const { data, error } = await supabase.functions.invoke('revoke-api-key');
    if (error) throw error;
    return data;
};

// --- Blog ---
export const fetchPublishedBlogs = async (): Promise<Blog[]> => {
    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const fetchPublishedBlogBySlug = async (slug: string): Promise<Blog | null> => {
    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
    
    if (error) {
        if (error.code === 'PGRST116') return null; // Not found is not an error
        throw error;
    }
    return data;
};

export const saveBlogAdmin = async (blog: Partial<Blog>): Promise<{ blog: Blog | null, error: any }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { blog: null, error: { message: "Not authenticated" } };

    const payload = { ...blog };
    if (!payload.author_id) {
        payload.author_id = user.id;
    }
    // Set published_at timestamp if status is changing to published and it's not already set
    if (payload.status === 'published' && !payload.published_at) {
        payload.published_at = new Date().toISOString();
    }
    
    // Omit joined fields before upsert
    delete (payload as any).author_email; 
    delete (payload as any).author;
    
    const { data, error } = await supabase
        .from('blogs')
        .upsert([payload])
        .select()
        .single();

    return { blog: data, error };
};

export const deleteBlogAdmin = async (blogId: string): Promise<{ error: any }> => {
    const { error } = await supabase.from('blogs').delete().eq('id', blogId);
    return { error };
};
