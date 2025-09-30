# ImgWRR - Professional Image Sharing Platform

A comprehensive, scalable, and secure image-sharing web platform optimized for deployment on Vercel, using serverless and edge functions for maximum performance.

## 🚀 Features

### Core Platform Features
- **Fast & Secure**: Optimized for Vercel's edge network
- **Multiple Formats**: JPG, PNG, GIF, WebP, HEIC, AVIF, PDF support
- **Large Files**: Up to 32MB file size limit
- **Auto-deletion**: Configurable timers from 5 minutes to 6 months

### Image Upload & Sharing
- **Drag & Drop**: Intuitive file upload interface
- **Bulk Upload**: Multiple file support
- **Direct Links**: Instant sharing URLs
- **Embed Codes**: HTML and BBCode generation
- **Privacy Controls**: Password protection and private albums
- **API Support**: External API integration

### User Management
- **Authentication**: JWT and OAuth2 support
- **2FA**: Two-factor authentication
- **Role-based Access**: User, moderator, admin roles
- **Albums**: Create and manage image collections

### Advanced Analytics
- **Network Intelligence**: IP geolocation, ISP detection, VPN/Proxy/Tor detection
- **Device Fingerprinting**: Comprehensive browser and device analysis
- **Behavioral Tracking**: Click patterns, session duration, interaction logs
- **Real-time Data**: Live analytics dashboard
- **Export Options**: CSV, JSON, TXT report generation

### Security & Compliance
- **End-to-end Encryption**: Sensitive data protection
- **GDPR Compliance**: Data protection regulations
- **XSS/CSRF Protection**: Security best practices
- **Rate Limiting**: API protection
- **Audit Logs**: Security event tracking

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component library
- **Lucide React**: Beautiful icons

### Backend
- **Vercel Functions**: Serverless API routes
- **Supabase**: PostgreSQL database with real-time features
- **Vercel Blob**: Image storage and CDN
- **Sharp**: Image processing and optimization

### Analytics & Security
- **Custom Analytics Engine**: Comprehensive data collection
- **Device Fingerprinting**: Advanced user identification
- **IP Intelligence**: Network analysis and risk scoring
- **Real-time Processing**: Live data aggregation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/imgwrr.git
   cd imgwrr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   
   # Security
   JWT_SECRET=your_jwt_secret
   ENCRYPTION_KEY=your_encryption_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the database migrations (see `/database` folder)
   - Configure Row Level Security (RLS) policies

5. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and authentication
- **images**: Image metadata and storage info
- **albums**: Image collections and organization
- **analytics**: Comprehensive tracking data
- **security_events**: Audit logs and security monitoring

### Key Features
- **Row Level Security**: Data isolation and privacy
- **Real-time Subscriptions**: Live data updates
- **Full-text Search**: Advanced image discovery
- **Automated Cleanup**: Expired data removal

## 🔧 API Endpoints

### Image Management
- `POST /api/images/upload` - Upload new images
- `GET /api/images/[id]` - Retrieve image data
- `DELETE /api/images/[id]` - Delete image
- `GET /api/images` - List user images

### Analytics
- `POST /api/analytics` - Submit analytics data
- `GET /api/analytics` - Retrieve analytics
- `GET /api/analytics/network-info` - Network intelligence

### User Management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/2fa` - Two-factor authentication

## 📊 Analytics Data Collected

### Network Information
- IP address (IPv4/IPv6)
- Geographic location (country, region, city)
- ISP and organization details
- VPN/Proxy/Tor detection
- Risk scoring and threat assessment

### Device Fingerprinting
- Browser type and version
- Operating system details
- Hardware specifications
- Screen resolution and capabilities
- Language preferences
- Canvas, WebGL, and audio fingerprints

### Behavioral Data
- Viewing duration and patterns
- Click tracking and interactions
- Session management
- Repeat visitor detection
- Referrer analysis

## 🔒 Security Features

### Data Protection
- **Encryption at Rest**: All sensitive data encrypted
- **Encryption in Transit**: HTTPS/TLS 1.3
- **Key Management**: Secure key rotation
- **Data Anonymization**: Privacy-preserving analytics

### Access Control
- **JWT Authentication**: Secure token-based auth
- **OAuth2 Integration**: Social login support
- **Role-based Permissions**: Granular access control
- **API Rate Limiting**: DDoS protection

### Monitoring & Compliance
- **Audit Logging**: Complete activity tracking
- **GDPR Compliance**: Data protection regulations
- **Security Scanning**: Automated vulnerability detection
- **Incident Response**: Automated threat detection

## 🚀 Performance Optimizations

### Edge Computing
- **Vercel Edge Functions**: Global distribution
- **CDN Integration**: Fast image delivery
- **Image Optimization**: Automatic format conversion
- **Lazy Loading**: On-demand resource loading

### Database Optimization
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Indexed and optimized queries
- **Caching Strategy**: Redis-based caching
- **Data Archiving**: Automated cleanup

## 📈 Monitoring & Analytics

### Real-time Dashboard
- **Live Statistics**: Real-time user activity
- **Performance Metrics**: System health monitoring
- **Security Alerts**: Threat detection notifications
- **Usage Analytics**: Detailed usage patterns

### Export & Reporting
- **CSV Export**: Data analysis support
- **JSON API**: Programmatic access
- **Custom Reports**: Flexible reporting
- **Scheduled Reports**: Automated delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.imgwrr.com](https://docs.imgwrr.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/imgwrr/issues)
- **Discord**: [Community Server](https://discord.gg/imgwrr)
- **Email**: support@imgwrr.com

## 🙏 Acknowledgments

- Vercel for the amazing serverless platform
- Supabase for the powerful database solution
- Radix UI for the accessible components
- The open-source community for inspiration

---

**Built with ❤️ for the community**