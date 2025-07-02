

import React from 'react';
// Adding user_metadata to Supabase User type definition
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser & {
  user_metadata: {
    planId?: string;
    status?: 'Active' | 'Suspended' | 'Invited';
    role?: 'admin' | 'user'; // Added role
    [key: string]: any; // Allow other metadata
  };
};


export interface CompanyDetails {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  logoUrl?: string; // Optional: URL for a company logo
}

export interface Client {
  id: string; // Supabase UUID
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id: string; // This is a client-side UUID for React keys
  description: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceType = 'invoice' | 'quote' | 'recurring_template';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'viewed' | 'accepted' | 'declined';
export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly';
export type RecurringStatus = 'active' | 'paused' | 'finished';

export interface Attachment {
  name: string;
  url: string;
  size: number;
  filePath: string; // e.g., 'user-id/invoice-id/filename.pdf'
}


export interface CustomizationState {
  primaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  headingFont: string;
  bodyFont: string;
  logoSize: number;
  showLogo: boolean;
  showNotes: boolean;
  showTerms: boolean;
}

export interface InvoiceData {
  db_id?: string; // Supabase record UUID (primary key in DB)
  user_id?: string; // Supabase auth user ID
  id: string; // Invoice Number (human-readable ID like INV-2024-001)
  date: string; // Issue Date
  dueDate: string;
  sender: CompanyDetails;
  recipient: CompanyDetails;
  items: InvoiceItem[]; // Keep this mandatory for client-side logic, ensure default when fetching
  notes?: string;
  terms?: string;
  taxRate: number; // Percentage, e.g., 10 for 10%
  discount: { type: 'percentage' | 'fixed'; value: number };
  currency: string;
  selectedTemplateId: string;
  manualPaymentLink?: string; 
  has_branding?: boolean; 
  is_public?: boolean; // For public shareable links
  upiId?: string; // To store the UPI ID for QR code generation
  customization?: CustomizationState;
  attachments?: Attachment[];

  // New fields for enhanced features
  type: InvoiceType;
  status: InvoiceStatus;
  client_id?: string | null;
  recurring_frequency?: RecurringFrequency | null;
  recurring_next_issue_date?: string | null;
  recurring_end_date?: string | null;
  recurring_status?: RecurringStatus | null;
  recurring_template_id?: string | null;
}

// This type represents how the invoice data (excluding db_id, user_id, id/invoice_number)
// might be stored in a JSONB column in Supabase.
export interface InvoiceDataJson {
  date: string;
  dueDate: string;
  sender: CompanyDetails;
  recipient: CompanyDetails;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  taxRate: number;
  discount: { type: 'percentage' | 'fixed'; value: number };
  currency: string;
  selectedTemplateId: string;
  manualPaymentLink?: string;
  has_branding?: boolean;
  is_public?: boolean;
  upiId?: string;
  customization?: CustomizationState;
  attachments?: Attachment[];
}

export interface InvoiceTemplateProps {
  invoice: InvoiceData;
  upiLink?: string;
  qrCodeDataUrl?: string;
  userPlan?: PlanData | null; // Pass the full plan object for more flexibility
  customization?: CustomizationState;
}

export interface InvoiceTemplateInfo {
  id: string;
  name: string;
  description: string;
  component: React.FC<InvoiceTemplateProps>; // Updated to use InvoiceTemplateProps
  thumbnailUrl: string; // URL for a small preview image
}

export enum PageView {
  Home = 'Home',
  CreateInvoice = 'CreateInvoice',
}

// For Admin Plan Management
export interface PlanData {
  id: string; // e.g., 'free_tier', 'pro_monthly'
  name: string; // e.g., 'Free', 'Pro'
  price: string; // e.g., '0', '15'
  price_suffix: string; // e.g., '', '/mo' (matches Supabase table)
  billing_cycle: 'monthly' | 'annually';
  features: string[];
  cta_text: string; // matches Supabase table
  is_current?: boolean; // For display on pricing page, client-side only
  has_branding: boolean; // True if "Powered by" should be shown
  invoice_limit: number | null; // null for unlimited
  sort_order?: number; // For ordering plans
  variant?: 'primary' | 'secondary'; // For styling on pricing page
  created_at?: string; // For Supabase table
  updated_at?: string; // For Supabase table
}


// For Admin User Management - Aligned with Supabase structure
export interface AdminUser {
  id: string; // Supabase Auth User ID
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
  raw_user_meta_data?: { 
    planId?: string;
    status?: 'Active' | 'Suspended' | 'Invited';
    role?: 'admin' | 'user'; // Added role
    [key: string]: any; 
  };
  user_metadata?: { 
    planId?: string;
    status?: 'Active' | 'Suspended' | 'Invited';
    role?: 'admin' | 'user'; // Added role
    [key: string]: any;
  };
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  invoicesGeneratedThisMonth: number;
}

// For Payment Records
export interface Payment {
  id: string; // payment id from gateway
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'successful' | 'failed';
  gateway: 'razorpay';
  order_id: string;
  signature?: string;
  created_at?: string;
}