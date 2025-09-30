import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || request.ip || '127.0.0.1';

    // Get IP information from multiple sources
    const [ipApiData, ipInfoData] = await Promise.allSettled([
      // IP-API (free tier)
      axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,proxy,hosting`),
      
      // IPInfo.io (free tier)
      axios.get(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN || ''}`)
    ]);

    let networkInfo: Record<string, unknown> = {
      ip_address: ip,
      ip_version: ip.includes(':') ? 'IPv6' : 'IPv4',
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'UTC',
      isp: 'Unknown',
      asn: 'Unknown',
      organization: 'Unknown',
      is_vpn: false,
      is_proxy: false,
      is_tor: false,
      risk_score: 0,
    };

    // Process IP-API response
    if (ipApiData.status === 'fulfilled' && ipApiData.value.data.status === 'success') {
      const data = ipApiData.value.data;
      networkInfo = {
        ...networkInfo,
        country: data.country || 'Unknown',
        region: data.regionName || 'Unknown',
        city: data.city || 'Unknown',
        timezone: data.timezone || 'UTC',
        isp: data.isp || 'Unknown',
        asn: data.as || 'Unknown',
        organization: data.org || 'Unknown',
        is_vpn: data.hosting || false,
        is_proxy: data.proxy || false,
        risk_score: calculateRiskScore(data),
      };
    }

    // Process IPInfo response
    if (ipInfoData.status === 'fulfilled' && ipInfoData.value.data) {
      const data = ipInfoData.value.data;
      networkInfo = {
        ...networkInfo,
        country: data.country || networkInfo.country,
        region: data.region || networkInfo.region,
        city: data.city || networkInfo.city,
        timezone: data.timezone || networkInfo.timezone,
        isp: data.org || networkInfo.isp,
        is_vpn: data.hosting || networkInfo.is_vpn,
        is_proxy: data.proxy || networkInfo.is_proxy,
      };
    }

    // Additional security checks
    networkInfo.is_tor = await checkTorExitNode(ip);
    networkInfo.risk_score = calculateFinalRiskScore(networkInfo);

    return NextResponse.json(networkInfo);

  } catch (error) {
    console.error('Network info error:', error);
    
    // Return basic info on error
    return NextResponse.json({
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 
                 request.ip || 
                 '127.0.0.1',
      ip_version: 'IPv4',
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'UTC',
      isp: 'Unknown',
      asn: 'Unknown',
      organization: 'Unknown',
      is_vpn: false,
      is_proxy: false,
      is_tor: false,
      risk_score: 0,
    });
  }
}

function calculateRiskScore(data: Record<string, unknown>): number {
  let score = 0;

  // VPN/Proxy detection
  if (data.hosting) score += 30;
  if (data.proxy) score += 40;

  // High-risk countries (example)
  const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
  if (highRiskCountries.includes(data.countryCode)) {
    score += 20;
  }

  // Known VPN/Proxy ISPs
  const vpnIsps = ['VPN', 'Proxy', 'Tor', 'Anonymous'];
  if (vpnIsps.some(vpn => data.isp?.includes(vpn))) {
    score += 35;
  }

  return Math.min(100, score);
}

function calculateFinalRiskScore(networkInfo: Record<string, unknown>): number {
  let score = 0;

  if (networkInfo.is_vpn) score += 30;
  if (networkInfo.is_proxy) score += 40;
  if (networkInfo.is_tor) score += 50;

  // High-risk countries
  const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
  if (highRiskCountries.includes(networkInfo.country)) {
    score += 20;
  }

  return Math.min(100, score);
}

async function checkTorExitNode(ip: string): Promise<boolean> {
  try {
    // This would typically check against a Tor exit node list
    // For now, we'll use a simple heuristic
    const response = await axios.get(`https://check.torproject.org/api/ip?ip=${ip}`);
    return response.data?.is_tor || false;
  } catch (error) {
    return false;
  }
}
