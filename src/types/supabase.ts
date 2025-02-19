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
      user_profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: string
          favorite_personas: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: string
          favorite_personas?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: string
          favorite_personas?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}