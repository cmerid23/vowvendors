export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; full_name: string | null; role: 'customer' | 'vendor' | 'admin'; phone: string | null; state: string | null; created_at: string }
        Insert: { id: string; email: string; full_name?: string | null; role?: string; phone?: string | null; state?: string | null; created_at?: string }
        Update: { full_name?: string | null; role?: string; phone?: string | null; state?: string | null; email?: string }
      }
      vendors: {
        Row: { id: string; user_id: string; business_name: string; category: 'photographer' | 'videographer' | 'decor' | 'music'; bio: string | null; state: string; city: string | null; phone: string | null; website: string | null; instagram_handle: string | null; starting_price: number | null; price_unit: string; is_featured: boolean; is_verified: boolean; is_active: boolean; avg_rating: number; review_count: number; created_at: string }
        Insert: { id?: string; user_id: string; business_name: string; category: string; bio?: string | null; state: string; city?: string | null; phone?: string | null; website?: string | null; instagram_handle?: string | null; starting_price?: number | null; price_unit?: string; is_featured?: boolean; is_verified?: boolean; is_active?: boolean; created_at?: string }
        Update: { business_name?: string; category?: string; bio?: string | null; state?: string; city?: string | null; phone?: string | null; website?: string | null; instagram_handle?: string | null; starting_price?: number | null; price_unit?: string; is_active?: boolean; is_featured?: boolean; is_verified?: boolean }
      }
      portfolio_images: {
        Row: { id: string; vendor_id: string; image_url: string; caption: string | null; source: string | null; display_order: number; created_at: string }
        Insert: { id?: string; vendor_id: string; image_url: string; caption?: string | null; source?: string | null; display_order?: number; created_at?: string }
        Update: { caption?: string | null; display_order?: number; image_url?: string }
      }
      leads: {
        Row: { id: string; name: string; email: string; phone: string | null; state: string | null; event_date: string | null; service_interest: string[] | null; message: string | null; source: string; vendor_id: string | null; status: string; created_at: string }
        Insert: { id?: string; name: string; email: string; phone?: string | null; state?: string | null; event_date?: string | null; service_interest?: string[] | null; message?: string | null; source?: string; vendor_id?: string | null; status?: string; created_at?: string }
        Update: { status?: string }
      }
      contact_requests: {
        Row: { id: string; from_name: string; from_email: string; from_phone: string | null; vendor_id: string; event_date: string | null; message: string; status: string; created_at: string }
        Insert: { id?: string; from_name: string; from_email: string; from_phone?: string | null; vendor_id: string; event_date?: string | null; message: string; status?: string; created_at?: string }
        Update: { status?: string }
      }
      chat_messages: {
        Row: { id: string; contact_request_id: string; sender_id: string; sender_name: string; message: string; read_at: string | null; created_at: string }
        Insert: { id?: string; contact_request_id: string; sender_id: string; sender_name: string; message: string; read_at?: string | null; created_at?: string }
        Update: { read_at?: string | null }
      }
      reviews: {
        Row: { id: string; vendor_id: string; reviewer_name: string; reviewer_email: string; rating: number; review_text: string | null; created_at: string }
        Insert: { id?: string; vendor_id: string; reviewer_name: string; reviewer_email: string; rating: number; review_text?: string | null; created_at?: string }
        Update: { review_text?: string | null }
      }
      favorites: {
        Row: { id: string; user_id: string; vendor_id: string; created_at: string }
        Insert: { id?: string; user_id: string; vendor_id: string; created_at?: string }
        Update: { vendor_id?: string }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Vendor = Database['public']['Tables']['vendors']['Row']
export type PortfolioImage = Database['public']['Tables']['portfolio_images']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type ContactRequest = Database['public']['Tables']['contact_requests']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
