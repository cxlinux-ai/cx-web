// Temporary override for Supabase types until proper generation
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'poster' | 'driver' | 'admin'
          company_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
      [key: string]: any
    }
  }
}
