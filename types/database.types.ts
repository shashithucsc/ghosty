// Supabase Database Types
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
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          email_verified: boolean
          activation_token: string | null
          activation_token_expires: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          email_verified?: boolean
          activation_token?: string | null
          activation_token_expires?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          email_verified?: boolean
          activation_token?: string | null
          activation_token_expires?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          anonymous_name: string
          avatar: string
          real_name: string
          date_of_birth: string
          age: number
          gender: 'Male' | 'Female' | 'Non-binary' | 'Other'
          university: string
          faculty: string
          bio: string
          interests: string[]
          is_verified: boolean
          preferences_age_min: number
          preferences_age_max: number
          preferences_gender: string[]
          preferences_interests: string[]
          preferences_hopes: string
          profile_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          anonymous_name: string
          avatar: string
          real_name: string
          date_of_birth: string
          age: number
          gender: 'Male' | 'Female' | 'Non-binary' | 'Other'
          university: string
          faculty: string
          bio: string
          interests?: string[]
          is_verified?: boolean
          preferences_age_min: number
          preferences_age_max: number
          preferences_gender?: string[]
          preferences_interests?: string[]
          preferences_hopes?: string
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          anonymous_name?: string
          avatar?: string
          real_name?: string
          date_of_birth?: string
          age?: number
          gender?: 'Male' | 'Female' | 'Non-binary' | 'Other'
          university?: string
          faculty?: string
          bio?: string
          interests?: string[]
          is_verified?: boolean
          preferences_age_min?: number
          preferences_age_max?: number
          preferences_gender?: string[]
          preferences_interests?: string[]
          preferences_hopes?: string
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      verification_files: {
        Row: {
          id: string
          user_id: string
          file_type: 'facebook_screenshot' | 'student_id' | 'academic_document'
          file_path: string
          file_name: string
          file_size: number
          mime_type: string
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_type: 'facebook_screenshot' | 'student_id' | 'academic_document'
          file_path: string
          file_name: string
          file_size: number
          mime_type: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_type?: 'facebook_screenshot' | 'student_id' | 'academic_document'
          file_path?: string
          file_name?: string
          file_size?: number
          mime_type?: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
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
