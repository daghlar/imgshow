import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client component client
export const createClientSupabase = () => createClientComponentClient();

// Server component client
export const createServerSupabase = () => createServerComponentClient({ cookies });

// Database schema types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          avatar_url: string | null;
          role: 'user' | 'admin' | 'moderator';
          created_at: string;
          updated_at: string;
          last_login: string | null;
          is_2fa_enabled: boolean;
          is_verified: boolean;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'moderator';
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_2fa_enabled?: boolean;
          is_verified?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'moderator';
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_2fa_enabled?: boolean;
          is_verified?: boolean;
        };
      };
      images: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          original_name: string;
          mime_type: string;
          size: number;
          width: number;
          height: number;
          url: string;
          thumbnail_url: string | null;
          is_public: boolean;
          password: string | null;
          album_id: string | null;
          auto_delete_at: string | null;
          created_at: string;
          updated_at: string;
          view_count: number;
          download_count: number;
          tags: string[];
          metadata: any;
        };
        Insert: {
          id: string;
          user_id: string;
          filename: string;
          original_name: string;
          mime_type: string;
          size: number;
          width: number;
          height: number;
          url: string;
          thumbnail_url?: string | null;
          is_public?: boolean;
          password?: string | null;
          album_id?: string | null;
          auto_delete_at?: string | null;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          download_count?: number;
          tags?: string[];
          metadata?: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          original_name?: string;
          mime_type?: string;
          size?: number;
          width?: number;
          height?: number;
          url?: string;
          thumbnail_url?: string | null;
          is_public?: boolean;
          password?: string | null;
          album_id?: string | null;
          auto_delete_at?: string | null;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          download_count?: number;
          tags?: string[];
          metadata?: any;
        };
      };
      albums: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          password: string | null;
          cover_image_id: string | null;
          created_at: string;
          updated_at: string;
          image_count: number;
          total_views: number;
          tags: string[];
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          password?: string | null;
          cover_image_id?: string | null;
          created_at?: string;
          updated_at?: string;
          image_count?: number;
          total_views?: number;
          tags?: string[];
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          is_public?: boolean;
          password?: string | null;
          cover_image_id?: string | null;
          created_at?: string;
          updated_at?: string;
          image_count?: number;
          total_views?: number;
          tags?: string[];
        };
      };
      analytics: {
        Row: {
          id: string;
          image_id: string;
          session_id: string;
          user_id: string | null;
          ip_address: string;
          ip_version: 'IPv4' | 'IPv6';
          country: string;
          region: string;
          city: string;
          timezone: string;
          isp: string;
          asn: string;
          organization: string;
          is_vpn: boolean;
          is_proxy: boolean;
          is_tor: boolean;
          risk_score: number;
          user_agent: string;
          browser_name: string;
          browser_version: string;
          os_name: string;
          os_version: string;
          device_type: 'desktop' | 'mobile' | 'tablet' | 'bot';
          device_brand: string | null;
          device_model: string | null;
          screen_width: number;
          screen_height: number;
          color_depth: number;
          pixel_ratio: number;
          language: string;
          languages: string[];
          canvas_fingerprint: string | null;
          webgl_fingerprint: string | null;
          audio_fingerprint: string | null;
          font_fingerprint: string | null;
          hardware_fingerprint: string | null;
          adblock_detected: boolean;
          touch_support: boolean;
          cookie_support: boolean;
          js_support: boolean;
          referrer: string | null;
          referrer_domain: string | null;
          click_count: number;
          view_duration: number;
          interaction_count: number;
          is_repeat_visitor: boolean;
          session_duration: number;
          last_activity: string;
          connection_type: string | null;
          connection_speed: number | null;
          battery_level: number | null;
          is_charging: boolean | null;
          media_devices: string[];
          permissions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          image_id: string;
          session_id: string;
          user_id?: string | null;
          ip_address: string;
          ip_version: 'IPv4' | 'IPv6';
          country: string;
          region: string;
          city: string;
          timezone: string;
          isp: string;
          asn: string;
          organization: string;
          is_vpn: boolean;
          is_proxy: boolean;
          is_tor: boolean;
          risk_score: number;
          user_agent: string;
          browser_name: string;
          browser_version: string;
          os_name: string;
          os_version: string;
          device_type: 'desktop' | 'mobile' | 'tablet' | 'bot';
          device_brand?: string | null;
          device_model?: string | null;
          screen_width: number;
          screen_height: number;
          color_depth: number;
          pixel_ratio: number;
          language: string;
          languages: string[];
          canvas_fingerprint?: string | null;
          webgl_fingerprint?: string | null;
          audio_fingerprint?: string | null;
          font_fingerprint?: string | null;
          hardware_fingerprint?: string | null;
          adblock_detected?: boolean;
          touch_support?: boolean;
          cookie_support?: boolean;
          js_support?: boolean;
          referrer?: string | null;
          referrer_domain?: string | null;
          click_count?: number;
          view_duration?: number;
          interaction_count?: number;
          is_repeat_visitor?: boolean;
          session_duration?: number;
          last_activity?: string;
          connection_type?: string | null;
          connection_speed?: number | null;
          battery_level?: number | null;
          is_charging?: boolean | null;
          media_devices?: string[];
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_id?: string;
          session_id?: string;
          user_id?: string | null;
          ip_address?: string;
          ip_version?: 'IPv4' | 'IPv6';
          country?: string;
          region?: string;
          city?: string;
          timezone?: string;
          isp?: string;
          asn?: string;
          organization?: string;
          is_vpn?: boolean;
          is_proxy?: boolean;
          is_tor?: boolean;
          risk_score?: number;
          user_agent?: string;
          browser_name?: string;
          browser_version?: string;
          os_name?: string;
          os_version?: string;
          device_type?: 'desktop' | 'mobile' | 'tablet' | 'bot';
          device_brand?: string | null;
          device_model?: string | null;
          screen_width?: number;
          screen_height?: number;
          color_depth?: number;
          pixel_ratio?: number;
          language?: string;
          languages?: string[];
          canvas_fingerprint?: string | null;
          webgl_fingerprint?: string | null;
          audio_fingerprint?: string | null;
          font_fingerprint?: string | null;
          hardware_fingerprint?: string | null;
          adblock_detected?: boolean;
          touch_support?: boolean;
          cookie_support?: boolean;
          js_support?: boolean;
          referrer?: string | null;
          referrer_domain?: string | null;
          click_count?: number;
          view_duration?: number;
          interaction_count?: number;
          is_repeat_visitor?: boolean;
          session_duration?: number;
          last_activity?: string;
          connection_type?: string | null;
          connection_speed?: number | null;
          battery_level?: number | null;
          is_charging?: boolean | null;
          media_devices?: string[];
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      security_events: {
        Row: {
          id: string;
          type: 'login' | 'logout' | 'upload' | 'download' | 'view' | 'admin_action';
          user_id: string | null;
          ip_address: string;
          user_agent: string;
          details: any;
          risk_level: 'low' | 'medium' | 'high' | 'critical';
          created_at: string;
        };
        Insert: {
          id: string;
          type: 'login' | 'logout' | 'upload' | 'download' | 'view' | 'admin_action';
          user_id?: string | null;
          ip_address: string;
          user_agent: string;
          details: any;
          risk_level?: 'low' | 'medium' | 'high' | 'critical';
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: 'login' | 'logout' | 'upload' | 'download' | 'view' | 'admin_action';
          user_id?: string | null;
          ip_address?: string;
          user_agent?: string;
          details?: any;
          risk_level?: 'low' | 'medium' | 'high' | 'critical';
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
