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
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          plan: 'freelance' | 'business' | 'agency'
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: 'freelance' | 'business' | 'agency'
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: 'freelance' | 'business' | 'agency'
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'team' | 'client'
          organization_id: string | null
          client_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'team' | 'client'
          organization_id?: string | null
          client_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'team' | 'client'
          organization_id?: string | null
          client_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          organization_id: string
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          logo_url: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          organization_id: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          logo_url?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          organization_id?: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          logo_url?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string
          status: 'new' | 'in_progress' | 'review' | 'changes_requested' | 'approved' | 'completed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          client_id: string
          organization_id: string
          assigned_to: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: string
          status?: 'new' | 'in_progress' | 'review' | 'changes_requested' | 'approved' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          client_id: string
          organization_id: string
          assigned_to?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: string
          status?: 'new' | 'in_progress' | 'review' | 'changes_requested' | 'approved' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          client_id?: string
          organization_id?: string
          assigned_to?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          request_id: string
          user_id: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          request_id: string
          user_id: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          request_id?: string
          user_id?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          file_name: string
          file_url: string
          file_size: number
          file_type: string
          request_id: string | null
          comment_id: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_url: string
          file_size: number
          file_type: string
          request_id?: string | null
          comment_id?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_url?: string
          file_size?: number
          file_type?: string
          request_id?: string | null
          comment_id?: string | null
          uploaded_by?: string
          created_at?: string
        }
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
  }
}

// Helper types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Request = Database['public']['Tables']['requests']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Attachment = Database['public']['Tables']['attachments']['Row']
