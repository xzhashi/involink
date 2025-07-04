import React from 'react';
// Adding user_metadata to Supabase User type definition
import type { User as SupabaseUser } from '@supabase/gotrue-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      app_config: {
        Row: {
          id: number
          key: string
          value: string | null
        }
        Insert: {
          id?: number
          key: string
          value?: string | null
        }
        Update: {
          id?: number
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published_at: string | null
          slug: string
          status: "draft" | "published"
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: "draft" | "published"
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: "draft" | "published"
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          attachments: Json[] | null
          client_id: string | null
          created_at: string
          id: string
          invoice_data_json: Json
          invoice_number: string
          is_public: boolean
          recurring_end_date: string | null
          recurring_frequency: "weekly" | "monthly" | "yearly" | null
          recurring_next_issue_date: string | null
          recurring_status: "active" | "paused" | "finished" | null
          recurring_template_id: string | null
          status: "draft" | "sent" | "paid" | "partially_paid" | "overdue" | "viewed" | "accepted" | "declined"
          type: "invoice" | "quote" | "recurring_template"
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json[] | null
          client_id?: string | null
          created_at?: string
          id?: string
          invoice_data_json: Json
          invoice_number: string
          is_public?: boolean
          recurring_end_date?: string | null
          recurring_frequency?: "weekly" | "monthly" | "yearly" | null
          recurring_next_issue_date?: string | null
          recurring_status?: "active" | "paused" | "finished" | null
          recurring_template_id?: string | null
          status: "draft" | "sent" | "paid" | "partially_paid" | "overdue" | "viewed" | "accepted" | "declined"
          type: "invoice" | "quote" | "recurring_template"
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json[] | null
          client_id?: string | null
          created_at?: string
          id?: string
          invoice_data_json?: Json
          invoice_number?: string
          is_public?: boolean
          recurring_end_date?: string | null
          recurring_frequency?: "weekly" | "monthly" | "yearly" | null
          recurring_next_issue_date?: string | null
          recurring_status?: "active" | "paused" | "finished" | null
          recurring_template_id?: string | null
          status?: "draft" | "sent" | "paid" | "partially_paid" | "overdue" | "viewed" | "accepted" | "declined"
          type?: "invoice" | "quote" | "recurring_template"
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_recurring_template_id_fkey"
            columns: ["recurring_template_id"]
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          gateway: "razorpay"
          id: string
          order_id: string
          plan_id: string
          signature: string | null
          status: "created" | "successful" | "failed"
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          gateway?: "razorpay"
          id: string
          order_id: string
          plan_id: string
          signature?: string | null
          status: "created" | "successful" | "failed"
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          gateway?: "razorpay"
          id?: string
          order_id?: string
          plan_id?: string
          signature?: string | null
          status?: "created" | "successful" | "failed"
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "plans_table"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      plans_table: {
        Row: {
          advanced_reports: boolean
          api_access: boolean
          billing_cycle: "monthly" | "annually"
          client_limit: number | null
          created_at: string
          cta_text: string
          features: string[]
          has_branding: boolean
          id: string
          invoice_limit: number | null
          is_current: boolean | null
          name: string
          premium_templates: boolean
          price: string
          price_suffix: string
          product_limit: number | null
          sort_order: number | null
          team_member_limit: number | null
          updated_at: string
          variant: "primary" | "secondary" | null
        }
        Insert: {
          advanced_reports?: boolean
          api_access?: boolean
          billing_cycle?: "monthly" | "annually"
          client_limit?: number | null
          created_at?: string
          cta_text: string
          features: string[]
          has_branding?: boolean
          id: string
          invoice_limit?: number | null
          is_current?: boolean | null
          name: string
          premium_templates?: boolean
          price: string
          price_suffix: string
          product_limit?: number | null
          sort_order?: number | null
          team_member_limit?: number | null
          updated_at?: string
          variant?: "primary" | "secondary" | null
        }
        Update: {
          advanced_reports?: boolean
          api_access?: boolean
          billing_cycle?: "monthly" | "annually"
          client_limit?: number | null
          created_at?: string
          cta_text?: string
          features?: string[]
          has_branding?: boolean
          id?: string
          invoice_limit?: number | null
          is_current?: boolean | null
          name?: string
          premium_templates?: boolean
          price?: string
          price_suffix?: string
          product_limit?: number | null
          sort_order?: number | null
          team_member_limit?: number | null
          updated_at?: string
          variant?: "primary" | "secondary" | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          unit_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          unit_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          unit_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      taxes: {
        Row: {
          id: string
          name: string
          rate: number
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          rate: number
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          rate?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "taxes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_api_keys: {
        Row: {
          created_at: string
          hashed_key: string
          id: string
          key_prefix: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hashed_key: string
          id?: string
          key_prefix: string
          user_id: string
        }
        Update: {
          created_at?: string
          hashed_key?: string
          id?: string
          key_prefix?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_api_keys_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type User = SupabaseUser & {
  user_metadata: {
    planId?: string;
    status?: 'Active' | 'Suspended' | 'Invited';
    role?: 'admin' | 'user';
    company_details?: CompanyDetails;
    default_currency?: string;
    team_owner_id?: string;
    [key: string]: any;
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

export interface Product {
  id: string; // Supabase UUID
  user_id: string;
  name: string;
  description?: string;
  unit_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface Tax {
  id: string; // Supabase UUID
  user_id: string;
  name: string;
  rate: number;
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
  taxes: Tax[];
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
  taxes: Tax[];
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
  isPremium?: boolean; // New: Flag for premium templates
}

export enum PageView {
  Home = 'Home',
  CreateInvoice = 'CreateInvoice',
}

// For Admin Plan Management
export interface PlanData {
  id: string;
  name: string;
  price: string;
  price_suffix: string;
  billing_cycle: 'monthly' | 'annually';
  features: string[]; // Marketing text for pricing page
  cta_text: string;
  is_current?: boolean; // Client-side only

  // Functional Limits & Features
  has_branding: boolean;
  invoice_limit: number | null;
  client_limit: number | null;
  product_limit: number | null;
  team_member_limit: number | null;
  
  api_access: boolean;
  advanced_reports: boolean;
  premium_templates: boolean;
  
  sort_order?: number;
  variant?: 'primary' | 'secondary';
  created_at?: string;
  updated_at?: string;
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
    role?: 'admin' | 'user';
    company_details?: CompanyDetails;
    default_currency?: string;
    team_owner_id?: string;
    [key: string]: any; 
  };
  user_metadata?: { 
    planId?: string;
    status?: 'Active' | 'Suspended' | 'Invited';
    role?: 'admin' | 'user';
    company_details?: CompanyDetails;
    default_currency?: string;
    team_owner_id?: string;
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

// For Contact Form Submissions
export interface ContactSubmission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
}

export interface UserApiKey {
    id: string;
    user_id: string;
    key_prefix: string;
    created_at: string;
    last_4: string; // Only the last 4 characters for display
}

export interface Blog {
  id: string; // Supabase UUID
  author_id: string; // Supabase auth user ID
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  status: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
  author_email?: string; // For display on the admin page
}