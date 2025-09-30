import { AnalyticsData } from '@/types';
import { UAParser } from 'ua-parser-js';
import CryptoJS from 'crypto-js';

export class AnalyticsCollector {
  private sessionId: string;
  private startTime: number;
  private interactionCount: number = 0;
  private clickCount: number = 0;
  private lastActivity: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.lastActivity = Date.now();
    this.initializeEventListeners();
  }

  private generateSessionId(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  private initializeEventListeners(): void {
    // Track clicks
    document.addEventListener('click', () => {
      this.clickCount++;
      this.interactionCount++;
      this.updateLastActivity();
    });

    // Track keyboard interactions
    document.addEventListener('keydown', () => {
      this.interactionCount++;
      this.updateLastActivity();
    });

    // Track scroll events
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      this.interactionCount++;
      this.updateLastActivity();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackScrollDepth();
      }, 100);
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackViewDuration();
      } else {
        this.updateLastActivity();
      }
    });

    // Track beforeunload
    window.addEventListener('beforeunload', () => {
      this.trackViewDuration();
    });
  }

  private updateLastActivity(): void {
    this.lastActivity = Date.now();
  }

  private trackScrollDepth(): void {
    const scrollDepth = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    // Store scroll depth in session storage for later use
    sessionStorage.setItem('scroll_depth', scrollDepth.toString());
  }

  private trackViewDuration(): number {
    return Date.now() - this.startTime;
  }

  // Network Information Collection
  private async getNetworkInfo(): Promise<Partial<AnalyticsData>> {
    try {
      const response = await fetch('/api/analytics/network-info');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get network info:', error);
      return {};
    }
  }

  // Device Fingerprinting
  private async getDeviceFingerprint(): Promise<Partial<AnalyticsData>> {
    const parser = new UAParser();
    const result = parser.getResult();

    // Canvas fingerprinting
    const canvasFingerprint = this.getCanvasFingerprint();
    
    // WebGL fingerprinting
    const webglFingerprint = this.getWebGLFingerprint();
    
    // Audio fingerprinting
    const audioFingerprint = this.getAudioFingerprint();
    
    // Font fingerprinting
    const fontFingerprint = this.getFontFingerprint();
    
    // Hardware fingerprinting
    const hardwareFingerprint = this.getHardwareFingerprint();

    return {
      user_agent: navigator.userAgent,
      browser_name: result.browser.name || 'Unknown',
      browser_version: result.browser.version || 'Unknown',
      os_name: result.os.name || 'Unknown',
      os_version: result.os.version || 'Unknown',
      device_type: this.getDeviceType(result.device.type),
      device_brand: result.device.vendor || undefined,
      device_model: result.device.model || undefined,
      screen_width: screen.width,
      screen_height: screen.height,
      color_depth: screen.colorDepth,
      pixel_ratio: window.devicePixelRatio || 1,
      language: navigator.language,
      languages: navigator.languages || [navigator.language],
      canvas_fingerprint: canvasFingerprint,
      webgl_fingerprint: webglFingerprint,
      audio_fingerprint: audioFingerprint,
      font_fingerprint: fontFingerprint,
      hardware_fingerprint: hardwareFingerprint,
      adblock_detected: this.detectAdBlock(),
      touch_support: 'ontouchstart' in window,
      cookie_support: navigator.cookieEnabled,
      js_support: true,
      connection_type: this.getConnectionType(),
      connection_speed: this.getConnectionSpeed(),
      battery_level: await this.getBatteryLevel(),
      is_charging: await this.getChargingStatus(),
      media_devices: await this.getMediaDevices(),
      permissions: await this.getPermissions(),
    };
  }

  private getDeviceType(deviceType?: string): 'desktop' | 'mobile' | 'tablet' | 'bot' {
    if (deviceType === 'mobile') return 'mobile';
    if (deviceType === 'tablet') return 'tablet';
    if (navigator.userAgent.includes('bot') || navigator.userAgent.includes('crawler')) return 'bot';
    return 'desktop';
  }

  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      canvas.width = 200;
      canvas.height = 50;
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Canvas fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Canvas fingerprint', 4, 17);

      return canvas.toDataURL();
    } catch {
      return '';
    }
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return '';

      const fingerprint = {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        extensions: gl.getSupportedExtensions(),
      };

      return CryptoJS.SHA256(JSON.stringify(fingerprint)).toString();
    } catch (error) {
      return '';
    }
  }

  private getAudioFingerprint(): string {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);

      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const fingerprint = {
        sampleRate: audioContext.sampleRate,
        maxChannelCount: audioContext.destination.maxChannelCount,
        numberOfInputs: audioContext.destination.numberOfInputs,
        numberOfOutputs: audioContext.destination.numberOfOutputs,
        channelCount: audioContext.destination.channelCount,
        channelCountMode: audioContext.destination.channelCountMode,
        channelInterpretation: audioContext.destination.channelInterpretation,
      };

      audioContext.close();
      return CryptoJS.SHA256(JSON.stringify(fingerprint)).toString();
    } catch (error) {
      return '';
    }
  }

  private getFontFingerprint(): string {
    const fonts = [
      'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
      'Calibri', 'Cambria', 'Candara', 'Century Gothic', 'Comic Sans MS',
      'Consolas', 'Courier', 'Courier New', 'Georgia', 'Helvetica',
      'Impact', 'Lucida Console', 'Lucida Sans Unicode', 'Microsoft Sans Serif',
      'Palatino', 'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS',
      'Verdana', 'Webdings', 'Wingdings'
    ];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const detectedFonts: string[] = [];
    const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const testSize = '72px';
    const baseFonts = ['monospace', 'sans-serif', 'serif'];

    for (const font of fonts) {
      let detected = false;
      for (const baseFont of baseFonts) {
        ctx.font = `${testSize} ${font}, ${baseFont}`;
        const metrics1 = ctx.measureText(testString);
        ctx.font = `${testSize} ${baseFont}`;
        const metrics2 = ctx.measureText(testString);
        if (metrics1.width !== metrics2.width) {
          detected = true;
          break;
        }
      }
      if (detected) {
        detectedFonts.push(font);
      }
    }

    return CryptoJS.SHA256(detectedFonts.join(',')).toString();
  }

  private getHardwareFingerprint(): string {
    const hardware = {
      cores: navigator.hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      platform: navigator.platform,
      vendor: navigator.vendor,
      vendorSub: navigator.vendorSub,
      product: navigator.product,
      productSub: navigator.productSub,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      appCodeName: navigator.appCodeName,
      buildID: (navigator as any).buildID || '',
      oscpu: (navigator as any).oscpu || '',
      cpuClass: (navigator as any).cpuClass || '',
      doNotTrack: navigator.doNotTrack,
      onLine: navigator.onLine,
    };

    return CryptoJS.SHA256(JSON.stringify(hardware)).toString();
  }

  private detectAdBlock(): boolean {
    try {
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-999px';
      testAd.style.top = '-999px';
      document.body.appendChild(testAd);

      setTimeout(() => {
        const isBlocked = testAd.offsetHeight === 0;
        document.body.removeChild(testAd);
        return isBlocked;
      }, 100);

      return false;
    } catch (error) {
      return false;
    }
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? connection.effectiveType || connection.type || 'unknown' : 'unknown';
  }

  private getConnectionSpeed(): number {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? connection.downlink || 0 : 0;
  }

  private async getBatteryLevel(): Promise<number> {
    try {
      const battery = await (navigator as any).getBattery();
      return Math.round(battery.level * 100);
    } catch (error) {
      return 0;
    }
  }

  private async getChargingStatus(): Promise<boolean> {
    try {
      const battery = await (navigator as any).getBattery();
      return battery.charging;
    } catch (error) {
      return false;
    }
  }

  private async getMediaDevices(): Promise<string[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.map(device => device.kind);
    } catch (error) {
      return [];
    }
  }

  private async getPermissions(): Promise<string[]> {
    const permissions = [
      'camera', 'microphone', 'geolocation', 'notifications', 'persistent-storage'
    ];
    
    const grantedPermissions: string[] = [];
    
    for (const permission of permissions) {
      try {
        const result = await navigator.permissions.query({ name: permission as PermissionName });
        if (result.state === 'granted') {
          grantedPermissions.push(permission);
        }
      } catch (error) {
        // Permission not supported
      }
    }
    
    return grantedPermissions;
  }

  // Public method to collect all analytics data
  public async collectAnalyticsData(imageId: string, userId?: string): Promise<AnalyticsData> {
    const networkInfo = await this.getNetworkInfo();
    const deviceInfo = await this.getDeviceFingerprint();
    const viewDuration = this.trackViewDuration();
    const scrollDepth = parseInt(sessionStorage.getItem('scroll_depth') || '0');

    const analyticsData: AnalyticsData = {
      id: CryptoJS.lib.WordArray.random(16).toString(),
      image_id: imageId,
      session_id: this.sessionId,
      user_id: userId,
      
      // Network Information
      ip_address: networkInfo.ip_address || '',
      ip_version: networkInfo.ip_version || 'IPv4',
      country: networkInfo.country || 'Unknown',
      region: networkInfo.region || 'Unknown',
      city: networkInfo.city || 'Unknown',
      timezone: networkInfo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      isp: networkInfo.isp || 'Unknown',
      asn: networkInfo.asn || 'Unknown',
      organization: networkInfo.organization || 'Unknown',
      is_vpn: networkInfo.is_vpn || false,
      is_proxy: networkInfo.is_proxy || false,
      is_tor: networkInfo.is_tor || false,
      risk_score: networkInfo.risk_score || 0,
      
      // Device Information
      user_agent: deviceInfo.user_agent || navigator.userAgent,
      browser_name: deviceInfo.browser_name || 'Unknown',
      browser_version: deviceInfo.browser_version || 'Unknown',
      os_name: deviceInfo.os_name || 'Unknown',
      os_version: deviceInfo.os_version || 'Unknown',
      device_type: deviceInfo.device_type || 'desktop',
      device_brand: deviceInfo.device_brand,
      device_model: deviceInfo.device_model,
      screen_width: deviceInfo.screen_width || screen.width,
      screen_height: deviceInfo.screen_height || screen.height,
      color_depth: deviceInfo.color_depth || screen.colorDepth,
      pixel_ratio: deviceInfo.pixel_ratio || window.devicePixelRatio,
      language: deviceInfo.language || navigator.language,
      languages: deviceInfo.languages || [navigator.language],
      
      // Fingerprinting
      canvas_fingerprint: deviceInfo.canvas_fingerprint,
      webgl_fingerprint: deviceInfo.webgl_fingerprint,
      audio_fingerprint: deviceInfo.audio_fingerprint,
      font_fingerprint: deviceInfo.font_fingerprint,
      hardware_fingerprint: deviceInfo.hardware_fingerprint,
      adblock_detected: deviceInfo.adblock_detected || false,
      touch_support: deviceInfo.touch_support || false,
      cookie_support: deviceInfo.cookie_support || false,
      js_support: deviceInfo.js_support || true,
      
      // Behavioral Data
      referrer: document.referrer || undefined,
      referrer_domain: document.referrer ? new URL(document.referrer).hostname : undefined,
      click_count: this.clickCount,
      view_duration: viewDuration,
      interaction_count: this.interactionCount,
      is_repeat_visitor: this.isRepeatVisitor(),
      session_duration: Date.now() - this.startTime,
      last_activity: new Date(this.lastActivity).toISOString(),
      
      // Technical Details
      connection_type: deviceInfo.connection_type,
      connection_speed: deviceInfo.connection_speed,
      battery_level: deviceInfo.battery_level,
      is_charging: deviceInfo.is_charging,
      media_devices: deviceInfo.media_devices || [],
      permissions: deviceInfo.permissions || [],
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return analyticsData;
  }

  private isRepeatVisitor(): boolean {
    const visits = localStorage.getItem('imgwrr_visits');
    if (!visits) {
      localStorage.setItem('imgwrr_visits', '1');
      return false;
    }
    
    const visitCount = parseInt(visits) + 1;
    localStorage.setItem('imgwrr_visits', visitCount.toString());
    return visitCount > 1;
  }

  // Method to send analytics data to server
  public async sendAnalyticsData(analyticsData: AnalyticsData): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
      });
    } catch (error) {
      console.error('Failed to send analytics data:', error);
    }
  }
}
