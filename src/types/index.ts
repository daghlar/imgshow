// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_2fa_enabled: boolean;
  is_verified: boolean;
}

// Image Types
export interface Image {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  width: number;
  height: number;
  url: string;
  thumbnail_url?: string;
  is_public: boolean;
  password?: string;
  album_id?: string;
  auto_delete_at?: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  download_count: number;
  tags: string[];
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  exif?: Record<string, unknown>;
  color_palette?: string[];
  dominant_color?: string;
  is_animated?: boolean;
  duration?: number; // for GIFs/videos
  quality_score?: number;
}

// Album Types
export interface Album {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  password?: string;
  cover_image_id?: string;
  created_at: string;
  updated_at: string;
  image_count: number;
  total_views: number;
  tags: string[];
}

// Analytics Types
export interface AnalyticsData {
  id: string;
  image_id: string;
  session_id: string;
  user_id?: string;
  
  // Network Information
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
  
  // Device Information
  user_agent: string;
  browser_name: string;
  browser_version: string;
  os_name: string;
  os_version: string;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'bot';
  device_brand?: string;
  device_model?: string;
  screen_width: number;
  screen_height: number;
  color_depth: number;
  pixel_ratio: number;
  language: string;
  languages: string[];
  
  // Fingerprinting
  canvas_fingerprint?: string;
  webgl_fingerprint?: string;
  audio_fingerprint?: string;
  font_fingerprint?: string;
  hardware_fingerprint?: string;
  adblock_detected: boolean;
  touch_support: boolean;
  cookie_support: boolean;
  js_support: boolean;
  
  // Behavioral Data
  referrer?: string;
  referrer_domain?: string;
  click_count: number;
  view_duration: number;
  interaction_count: number;
  is_repeat_visitor: boolean;
  session_duration: number;
  last_activity: string;
  
  // Technical Details
  connection_type?: string;
  connection_speed?: number;
  battery_level?: number;
  is_charging?: boolean;
  media_devices: string[];
  permissions: string[];
  
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Upload Types
export interface UploadOptions {
  auto_delete_minutes?: number;
  is_public?: boolean;
  password?: string;
  album_id?: string;
  tags?: string[];
  quality?: number;
  max_width?: number;
  max_height?: number;
  convert_to_webp?: boolean;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
}

// Admin Types
export interface AdminStats {
  total_users: number;
  total_images: number;
  total_albums: number;
  total_views: number;
  total_downloads: number;
  storage_used: number;
  bandwidth_used: number;
  active_users_today: number;
  new_users_today: number;
  new_images_today: number;
}

export interface AdminReport {
  id: string;
  type: 'user' | 'image' | 'album' | 'analytics';
  data: Record<string, unknown>;
  filters: Record<string, unknown>;
  created_at: string;
  created_by: string;
}

// Security Types
export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'upload' | 'download' | 'view' | 'admin_action';
  user_id?: string;
  ip_address: string;
  user_agent: string;
  details: Record<string, unknown>;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

// Export Types
export interface ExportOptions {
  format: 'csv' | 'json' | 'txt';
  date_range?: {
    start: string;
    end: string;
  };
  filters?: Record<string, unknown>;
  fields?: string[];
}
