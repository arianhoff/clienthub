/**
 * Helper types for Supabase query results
 * Use these to avoid TypeScript inference issues with .select()
 */

// Profile query types
export interface ProfileSelect {
  organization_id: string | null
  role: 'admin' | 'team' | 'client'
  client_id: string | null
}

// Organization query types
export interface OrganizationSelect {
  id?: string
  slug?: string
  name?: string
  subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled'
  trial_ends_at?: string | null
}

export interface OrganizationInsert {
  name: string
  slug: string
  plan?: 'freelance' | 'business' | 'agency'
  subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled'
  trial_ends_at?: string | null
}

// Client query types
export interface ClientSelect {
  id?: string
  organization_id?: string
  name?: string
  contact_email?: string | null
}

// Request query types
export interface RequestSelect {
  id?: string
  title?: string
  description?: string | null
  type?: string
  status?: 'new' | 'in_progress' | 'review' | 'changes_requested' | 'approved' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string | null
  created_at?: string
  updated_at?: string
}
