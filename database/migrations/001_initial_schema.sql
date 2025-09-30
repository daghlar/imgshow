-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    two_fa_secret TEXT,
    recovery_codes TEXT[],
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Create albums table
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    password TEXT,
    cover_image_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image_count INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{}'
);

-- Create images table
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    password TEXT,
    auto_delete_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    exif_data JSONB,
    color_palette TEXT[],
    dominant_color VARCHAR(7),
    quality_score INTEGER,
    is_animated BOOLEAN DEFAULT FALSE,
    duration DECIMAL(10,3)
);

-- Create analytics table
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Network Information
    ip_address INET NOT NULL,
    ip_version VARCHAR(4) DEFAULT 'IPv4',
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    isp VARCHAR(255),
    asn VARCHAR(50),
    organization VARCHAR(255),
    is_vpn BOOLEAN DEFAULT FALSE,
    is_proxy BOOLEAN DEFAULT FALSE,
    is_tor BOOLEAN DEFAULT FALSE,
    risk_score INTEGER DEFAULT 0,
    
    -- Device Information
    user_agent TEXT,
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    device_type VARCHAR(20) DEFAULT 'desktop',
    device_brand VARCHAR(100),
    device_model VARCHAR(100),
    screen_width INTEGER,
    screen_height INTEGER,
    color_depth INTEGER,
    pixel_ratio DECIMAL(3,2),
    language VARCHAR(10),
    languages TEXT[],
    
    -- Fingerprinting
    canvas_fingerprint TEXT,
    webgl_fingerprint TEXT,
    audio_fingerprint TEXT,
    font_fingerprint TEXT,
    hardware_fingerprint TEXT,
    adblock_detected BOOLEAN DEFAULT FALSE,
    touch_support BOOLEAN DEFAULT FALSE,
    cookie_support BOOLEAN DEFAULT FALSE,
    js_support BOOLEAN DEFAULT TRUE,
    
    -- Behavioral Data
    referrer TEXT,
    referrer_domain VARCHAR(255),
    click_count INTEGER DEFAULT 0,
    view_duration INTEGER DEFAULT 0,
    interaction_count INTEGER DEFAULT 0,
    is_repeat_visitor BOOLEAN DEFAULT FALSE,
    session_duration INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE,
    
    -- Technical Details
    connection_type VARCHAR(50),
    connection_speed DECIMAL(10,2),
    battery_level INTEGER,
    is_charging BOOLEAN,
    media_devices TEXT[],
    permissions TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security_events table
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('login', 'logout', 'upload', 'download', 'view', 'admin_action', 'security_alert')),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id)
);

-- Create admin_reports table
CREATE TABLE admin_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('user', 'image', 'album', 'analytics', 'security')),
    data JSONB NOT NULL,
    filters JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_albums_user_id ON albums(user_id);
CREATE INDEX idx_albums_is_public ON albums(is_public);
CREATE INDEX idx_albums_created_at ON albums(created_at);
CREATE INDEX idx_albums_tags ON albums USING GIN(tags);

CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_images_album_id ON images(album_id);
CREATE INDEX idx_images_is_public ON images(is_public);
CREATE INDEX idx_images_auto_delete_at ON images(auto_delete_at);
CREATE INDEX idx_images_created_at ON images(created_at);
CREATE INDEX idx_images_tags ON images USING GIN(tags);
CREATE INDEX idx_images_metadata ON images USING GIN(metadata);

CREATE INDEX idx_analytics_image_id ON analytics(image_id);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_session_id ON analytics(session_id);
CREATE INDEX idx_analytics_ip_address ON analytics(ip_address);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_analytics_country ON analytics(country);
CREATE INDEX idx_analytics_device_type ON analytics(device_type);

CREATE INDEX idx_security_events_type ON security_events(type);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);
CREATE INDEX idx_security_events_risk_level ON security_events(risk_level);

CREATE INDEX idx_admin_reports_type ON admin_reports(type);
CREATE INDEX idx_admin_reports_created_by ON admin_reports(created_by);
CREATE INDEX idx_admin_reports_created_at ON admin_reports(created_at);
CREATE INDEX idx_admin_reports_status ON admin_reports(status);

-- Create full-text search indexes
CREATE INDEX idx_images_search ON images USING GIN(to_tsvector('english', original_name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_albums_search ON albums USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update album image count
CREATE OR REPLACE FUNCTION update_album_image_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE albums SET image_count = image_count + 1 WHERE id = NEW.album_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE albums SET image_count = image_count - 1 WHERE id = OLD.album_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.album_id != NEW.album_id THEN
            UPDATE albums SET image_count = image_count - 1 WHERE id = OLD.album_id;
            UPDATE albums SET image_count = image_count + 1 WHERE id = NEW.album_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply album image count triggers
CREATE TRIGGER update_album_image_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON images
    FOR EACH ROW EXECUTE FUNCTION update_album_image_count();

-- Create function to clean up expired images
CREATE OR REPLACE FUNCTION cleanup_expired_images()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM images 
    WHERE auto_delete_at IS NOT NULL 
    AND auto_delete_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Create function to get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(
    p_image_id UUID DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    total_views BIGINT,
    unique_visitors BIGINT,
    countries TEXT[],
    top_browsers TEXT[],
    top_os TEXT[],
    avg_session_duration NUMERIC,
    bounce_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT session_id) as unique_visitors,
        ARRAY_AGG(DISTINCT country) as countries,
        ARRAY_AGG(DISTINCT browser_name) as top_browsers,
        ARRAY_AGG(DISTINCT os_name) as top_os,
        AVG(session_duration) as avg_session_duration,
        (COUNT(*) FILTER (WHERE session_duration < 30)::NUMERIC / COUNT(*)::NUMERIC * 100) as bounce_rate
    FROM analytics
    WHERE (p_image_id IS NULL OR image_id = p_image_id)
    AND (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
END;
$$ language 'plpgsql';

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Albums policies
CREATE POLICY "Users can view own albums" ON albums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own albums" ON albums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own albums" ON albums FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own albums" ON albums FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public albums are viewable by all" ON albums FOR SELECT USING (is_public = true);

-- Images policies
CREATE POLICY "Users can view own images" ON images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own images" ON images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own images" ON images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own images" ON images FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public images are viewable by all" ON images FOR SELECT USING (is_public = true);

-- Analytics policies (admin only)
CREATE POLICY "Only admins can view analytics" ON analytics FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Security events policies (admin only)
CREATE POLICY "Only admins can view security events" ON security_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Admin reports policies
CREATE POLICY "Users can view own reports" ON admin_reports FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Admins can view all reports" ON admin_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
CREATE POLICY "Users can create reports" ON admin_reports FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create a view for public image statistics
CREATE VIEW public_image_stats AS
SELECT 
    i.id,
    i.original_name,
    i.url,
    i.thumbnail_url,
    i.width,
    i.height,
    i.size,
    i.view_count,
    i.download_count,
    i.created_at,
    u.username as uploader_username,
    a.name as album_name
FROM images i
LEFT JOIN users u ON i.user_id = u.id
LEFT JOIN albums a ON i.album_id = a.id
WHERE i.is_public = true;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public_image_stats TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
