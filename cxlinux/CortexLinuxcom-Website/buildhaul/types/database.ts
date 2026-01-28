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
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role: 'poster' | 'driver' | 'admin'
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'poster' | 'driver' | 'admin'
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          owner_id: string
          name: string
          business_type: 'general_contractor' | 'material_supplier' | 'mining' | 'developer' | 'other'
          address: string
          city: string
          state: string
          zip: string
          phone: string
          email: string
          logo_url: string | null
          stripe_account_id: string | null
          verified: boolean
          rating: number
          total_loads_posted: number
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          business_type: 'general_contractor' | 'material_supplier' | 'mining' | 'developer' | 'other'
          address: string
          city: string
          state: string
          zip: string
          phone: string
          email: string
          logo_url?: string | null
          stripe_account_id?: string | null
          verified?: boolean
          rating?: number
          total_loads_posted?: number
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          business_type?: 'general_contractor' | 'material_supplier' | 'mining' | 'developer' | 'other'
          address?: string
          city?: string
          state?: string
          zip?: string
          phone?: string
          email?: string
          logo_url?: string | null
          stripe_account_id?: string | null
          verified?: boolean
          rating?: number
          total_loads_posted?: number
          created_at?: string
        }
      }
      trucks: {
        Row: {
          id: string
          driver_id: string
          truck_type: 'lowboy' | 'end_dump' | 'belly_dump' | 'side_dump' | 'flatbed' | 'water_truck' | 'other'
          make: string
          model: string
          year: number
          license_plate: string
          capacity_tons: number
          insurance_verified: boolean
          insurance_expiry: string | null
          dot_number: string | null
          mc_number: string | null
          photos: string[]
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          truck_type: 'lowboy' | 'end_dump' | 'belly_dump' | 'side_dump' | 'flatbed' | 'water_truck' | 'other'
          make: string
          model: string
          year: number
          license_plate: string
          capacity_tons: number
          insurance_verified?: boolean
          insurance_expiry?: string | null
          dot_number?: string | null
          mc_number?: string | null
          photos?: string[]
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          truck_type?: 'lowboy' | 'end_dump' | 'belly_dump' | 'side_dump' | 'flatbed' | 'water_truck' | 'other'
          make?: string
          model?: string
          year?: number
          license_plate?: string
          capacity_tons?: number
          insurance_verified?: boolean
          insurance_expiry?: string | null
          dot_number?: string | null
          mc_number?: string | null
          photos?: string[]
          active?: boolean
          created_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          profile_id: string
          company_name: string | null
          address: string
          city: string
          state: string
          zip: string
          cdl_number: string
          cdl_state: string
          cdl_expiry: string
          years_experience: number
          stripe_account_id: string | null
          verified: boolean
          rating: number
          completed_loads: number
          on_time_percentage: number
          available: boolean
          current_location: string | null
          service_radius_miles: number
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          company_name?: string | null
          address: string
          city: string
          state: string
          zip: string
          cdl_number: string
          cdl_state: string
          cdl_expiry: string
          years_experience: number
          stripe_account_id?: string | null
          verified?: boolean
          rating?: number
          completed_loads?: number
          on_time_percentage?: number
          available?: boolean
          current_location?: string | null
          service_radius_miles?: number
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          company_name?: string | null
          address?: string
          city?: string
          state?: string
          zip?: string
          cdl_number?: string
          cdl_state?: string
          cdl_expiry?: string
          years_experience?: number
          stripe_account_id?: string | null
          verified?: boolean
          rating?: number
          completed_loads?: number
          on_time_percentage?: number
          available?: boolean
          current_location?: string | null
          service_radius_miles?: number
          created_at?: string
        }
      }
      loads: {
        Row: {
          id: string
          company_id: string
          posted_by: string
          status: 'draft' | 'posted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          material_type: 'aggregate' | 'sand' | 'gravel' | 'asphalt' | 'concrete' | 'dirt' | 'rock' | 'topsoil' | 'base_course' | 'rip_rap' | 'other'
          material_description: string | null
          weight_tons: number
          truck_type_required: 'lowboy' | 'end_dump' | 'belly_dump' | 'side_dump' | 'flatbed' | 'water_truck' | 'other'
          trucks_needed: number
          pickup_location_name: string
          pickup_address: string
          pickup_city: string
          pickup_state: string
          pickup_zip: string
          pickup_coordinates: string
          pickup_instructions: string | null
          delivery_location_name: string
          delivery_address: string
          delivery_city: string
          delivery_state: string
          delivery_zip: string
          delivery_coordinates: string
          delivery_instructions: string | null
          distance_miles: number
          scheduled_date: string
          pickup_time_start: string
          pickup_time_end: string
          pricing_type: 'fixed' | 'hourly' | 'per_ton' | 'bid'
          rate_amount: number
          estimated_total: number
          round_trips: number
          urgent: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          posted_by: string
          status?: 'draft' | 'posted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          material_type: 'aggregate' | 'sand' | 'gravel' | 'asphalt' | 'concrete' | 'dirt' | 'rock' | 'topsoil' | 'base_course' | 'rip_rap' | 'other'
          material_description?: string | null
          weight_tons: number
          truck_type_required: 'lowboy' | 'end_dump' | 'belly_dump' | 'side_dump' | 'flatbed' | 'water_truck' | 'other'
          trucks_needed?: number
          pickup_location_name: string
          pickup_address: string
          pickup_city: string
          pickup_state: string
          pickup_zip: string
          pickup_coordinates: string
          pickup_instructions?: string | null
          delivery_location_name: string
          delivery_address: string
          delivery_city: string
          delivery_state: string
          delivery_zip: string
          delivery_coordinates: string
          delivery_instructions?: string | null
          distance_miles: number
          scheduled_date: string
          pickup_time_start: string
          pickup_time_end: string
          pricing_type: 'fixed' | 'hourly' | 'per_ton' | 'bid'
          rate_amount: number
          estimated_total: number
          round_trips?: number
          urgent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          posted_by?: string
          status?: 'draft' | 'posted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          material_type?: 'aggregate' | 'sand' | 'gravel' | 'asphalt' | 'concrete' | 'dirt' | 'rock' | 'topsoil' | 'base_course' | 'rip_rap' | 'other'
          material_description?: string | null
          weight_tons?: number
          truck_type_required?: 'lowboy' | 'end_dump' | 'belly_dump' | 'side_dump' | 'flatbed' | 'water_truck' | 'other'
          trucks_needed?: number
          pickup_location_name?: string
          pickup_address?: string
          pickup_city?: string
          pickup_state?: string
          pickup_zip?: string
          pickup_coordinates?: string
          pickup_instructions?: string | null
          delivery_location_name?: string
          delivery_address?: string
          delivery_city?: string
          delivery_state?: string
          delivery_zip?: string
          delivery_coordinates?: string
          delivery_instructions?: string | null
          distance_miles?: number
          scheduled_date?: string
          pickup_time_start?: string
          pickup_time_end?: string
          pricing_type?: 'fixed' | 'hourly' | 'per_ton' | 'bid'
          rate_amount?: number
          estimated_total?: number
          round_trips?: number
          urgent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      load_assignments: {
        Row: {
          id: string
          load_id: string
          driver_id: string
          truck_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'en_route_pickup' | 'at_pickup' | 'loaded' | 'en_route_delivery' | 'at_delivery' | 'completed' | 'cancelled'
          assigned_at: string
          accepted_at: string | null
          pickup_arrived_at: string | null
          loaded_at: string | null
          delivery_arrived_at: string | null
          completed_at: string | null
          actual_weight_tons: number | null
          driver_notes: string | null
          poster_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          load_id: string
          driver_id: string
          truck_id: string
          status?: 'pending' | 'accepted' | 'rejected' | 'en_route_pickup' | 'at_pickup' | 'loaded' | 'en_route_delivery' | 'at_delivery' | 'completed' | 'cancelled'
          assigned_at?: string
          accepted_at?: string | null
          pickup_arrived_at?: string | null
          loaded_at?: string | null
          delivery_arrived_at?: string | null
          completed_at?: string | null
          actual_weight_tons?: number | null
          driver_notes?: string | null
          poster_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          load_id?: string
          driver_id?: string
          truck_id?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'en_route_pickup' | 'at_pickup' | 'loaded' | 'en_route_delivery' | 'at_delivery' | 'completed' | 'cancelled'
          assigned_at?: string
          accepted_at?: string | null
          pickup_arrived_at?: string | null
          loaded_at?: string | null
          delivery_arrived_at?: string | null
          completed_at?: string | null
          actual_weight_tons?: number | null
          driver_notes?: string | null
          poster_notes?: string | null
          created_at?: string
        }
      }
      bids: {
        Row: {
          id: string
          load_id: string
          driver_id: string
          amount: number
          message: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          load_id: string
          driver_id: string
          amount: number
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          load_id?: string
          driver_id?: string
          amount?: number
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at?: string
          responded_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          load_id: string
          assignment_id: string
          company_id: string
          driver_id: string
          amount: number
          platform_fee: number
          driver_payout: number
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          load_id: string
          assignment_id: string
          company_id: string
          driver_id: string
          amount: number
          platform_fee: number
          driver_payout: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          load_id?: string
          assignment_id?: string
          company_id?: string
          driver_id?: string
          amount?: number
          platform_fee?: number
          driver_payout?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          load_id: string
          reviewer_id: string
          reviewee_id: string
          reviewer_role: 'poster' | 'driver'
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          load_id: string
          reviewer_id: string
          reviewee_id: string
          reviewer_role: 'poster' | 'driver'
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          load_id?: string
          reviewer_id?: string
          reviewee_id?: string
          reviewer_role?: 'poster' | 'driver'
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'load_posted' | 'bid_received' | 'bid_accepted' | 'assignment' | 'status_update' | 'payment' | 'review' | 'system'
          title: string
          message: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'load_posted' | 'bid_received' | 'bid_accepted' | 'assignment' | 'status_update' | 'payment' | 'review' | 'system'
          title: string
          message: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'load_posted' | 'bid_received' | 'bid_accepted' | 'assignment' | 'status_update' | 'payment' | 'review' | 'system'
          title?: string
          message?: string
          data?: Json | null
          read?: boolean
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
      user_role: 'poster' | 'driver' | 'admin'
      business_type: 'general_contractor' | 'material_supplier' | 'mining' | 'developer' | 'other'
      truck_type: 'lowboy' | 'end_dump' | 'belly_dump' | 'side_dump' | 'flatbed' | 'water_truck' | 'other'
      material_type: 'aggregate' | 'sand' | 'gravel' | 'asphalt' | 'concrete' | 'dirt' | 'rock' | 'topsoil' | 'base_course' | 'rip_rap' | 'other'
      load_status: 'draft' | 'posted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
      assignment_status: 'pending' | 'accepted' | 'rejected' | 'en_route_pickup' | 'at_pickup' | 'loaded' | 'en_route_delivery' | 'at_delivery' | 'completed' | 'cancelled'
      bid_status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
      pricing_type: 'fixed' | 'hourly' | 'per_ton' | 'bid'
      notification_type: 'load_posted' | 'bid_received' | 'bid_accepted' | 'assignment' | 'status_update' | 'payment' | 'review' | 'system'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
export type Json = any
