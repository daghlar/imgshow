import sharp from 'sharp';
import { put } from '@vercel/blob';
import { Image, UploadOptions, ImageMetadata } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class ImageProcessor {
  private readonly MAX_FILE_SIZE = 32 * 1024 * 1024; // 32MB
  private readonly SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'avif', 'pdf'];
  private readonly QUALITY_LEVELS = {
    low: 60,
    medium: 80,
    high: 90,
    original: 100
  };

  async processImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<{ image: Image; thumbnail?: Image }> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileId = uuidv4();
    const fileExtension = this.getFileExtension(file.name);
    const filename = `${fileId}.${fileExtension}`;
    const thumbnailFilename = `${fileId}_thumb.webp`;

    // Process image
    const processedImage = await this.processImageFile(file, options);
    
    // Upload to Vercel Blob
    const imageUrl = await this.uploadToBlob(processedImage.buffer, filename, file.type);
    const thumbnailUrl = processedImage.thumbnail 
      ? await this.uploadToBlob(processedImage.thumbnail, thumbnailFilename, 'image/webp')
      : undefined;

    // Get image metadata
    const metadata = await this.extractMetadata(processedImage.buffer, file);

    // Create image record
    const image: Image = {
      id: fileId,
      user_id: '', // Will be set by the calling function
      filename,
      original_name: file.name,
      mime_type: file.type,
      size: file.size,
      width: processedImage.width,
      height: processedImage.height,
      url: imageUrl,
      thumbnail_url: thumbnailUrl,
      is_public: options.is_public ?? true,
      password: options.password,
      album_id: options.album_id,
      auto_delete_at: options.auto_delete_minutes 
        ? new Date(Date.now() + options.auto_delete_minutes * 60 * 1000).toISOString()
        : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      view_count: 0,
      download_count: 0,
      tags: options.tags || [],
      metadata,
    };

    const thumbnail: Image | undefined = processedImage.thumbnail ? {
      id: `${fileId}_thumb`,
      user_id: '',
      filename: thumbnailFilename,
      original_name: `${file.name}_thumbnail`,
      mime_type: 'image/webp',
      size: processedImage.thumbnail.length,
      width: processedImage.thumbnailWidth,
      height: processedImage.thumbnailHeight,
      url: thumbnailUrl!,
      is_public: options.is_public ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      view_count: 0,
      download_count: 0,
      tags: [],
      metadata: {},
    } : undefined;

    return { image, thumbnail };
  }

  private validateFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check file format
    const extension = this.getFileExtension(file.name).toLowerCase();
    if (!this.SUPPORTED_FORMATS.includes(extension)) {
      throw new Error(`Unsupported file format. Supported formats: ${this.SUPPORTED_FORMATS.join(', ')}`);
    }

    // Check MIME type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      throw new Error('File must be an image or PDF');
    }
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private async processImageFile(
    file: File,
    options: UploadOptions
  ): Promise<{
    buffer: Buffer;
    width: number;
    height: number;
    thumbnail?: Buffer;
    thumbnailWidth: number;
    thumbnailHeight: number;
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get image info
    const imageInfo = await sharp(buffer).metadata();
    const { width = 0, height = 0 } = imageInfo;

    // Apply transformations
    let processedImage = sharp(buffer);

    // Resize if needed
    if (options.max_width || options.max_height) {
      const resizeOptions: any = {
        fit: 'inside',
        withoutEnlargement: true,
      };

      if (options.max_width) resizeOptions.width = options.max_width;
      if (options.max_height) resizeOptions.height = options.max_height;

      processedImage = processedImage.resize(resizeOptions);
    }

    // Convert to WebP if requested or if original is not WebP
    if (options.convert_to_webp !== false) {
      const quality = this.getQualityLevel(options.quality);
      processedImage = processedImage.webp({ quality });
    }

    // Apply quality settings
    if (options.quality && options.convert_to_webp !== false) {
      const quality = this.getQualityLevel(options.quality);
      processedImage = processedImage.webp({ quality });
    }

    // Process the image
    const processedBuffer = await processedImage.toBuffer();

    // Create thumbnail
    const thumbnail = await this.createThumbnail(buffer);

    return {
      buffer: processedBuffer,
      width,
      height,
      thumbnail: thumbnail.buffer,
      thumbnailWidth: thumbnail.width,
      thumbnailHeight: thumbnail.height,
    };
  }

  private async createThumbnail(buffer: Buffer): Promise<{
    buffer: Buffer;
    width: number;
    height: number;
  }> {
    const thumbnail = await sharp(buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toBuffer();

    const { width, height } = await sharp(thumbnail).metadata();

    return {
      buffer: thumbnail,
      width: width || 300,
      height: height || 300,
    };
  }

  private getQualityLevel(quality?: number): number {
    if (!quality) return this.QUALITY_LEVELS.medium;
    
    if (quality <= 30) return this.QUALITY_LEVELS.low;
    if (quality <= 70) return this.QUALITY_LEVELS.medium;
    if (quality <= 90) return this.QUALITY_LEVELS.high;
    return this.QUALITY_LEVELS.original;
  }

  private async uploadToBlob(
    buffer: Buffer,
    filename: string,
    contentType: string
  ): Promise<string> {
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
    });

    return blob.url;
  }

  private async extractMetadata(buffer: Buffer, file: File): Promise<ImageMetadata> {
    try {
      const metadata = await sharp(buffer).metadata();
      
      // Extract color palette
      const { data, info } = await sharp(buffer)
        .resize(150, 150)
        .raw()
        .toBuffer({ resolveWithObject: true });

      const colorPalette = this.extractColorPalette(data, info.width, info.height);
      const dominantColor = this.getDominantColor(colorPalette);

      return {
        exif: metadata.exif ? JSON.parse(JSON.stringify(metadata.exif)) : undefined,
        color_palette: colorPalette,
        dominant_color: dominantColor,
        is_animated: metadata.pages ? metadata.pages > 1 : false,
        duration: metadata.duration,
        quality_score: this.calculateQualityScore(metadata),
      };
    } catch (error) {
      console.error('Failed to extract metadata:', error);
      return {};
    }
  }

  private extractColorPalette(
    data: Buffer,
    width: number,
    height: number
  ): string[] {
    const colors = new Map<string, number>();
    const step = 4; // RGBA

    for (let i = 0; i < data.length; i += step * 10) { // Sample every 10th pixel
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) continue; // Skip transparent pixels

      const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colors.set(color, (colors.get(color) || 0) + 1);
    }

    // Sort by frequency and return top 10 colors
    return Array.from(colors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([color]) => color);
  }

  private getDominantColor(colorPalette: string[]): string {
    return colorPalette[0] || '#000000';
  }

  private calculateQualityScore(metadata: any): number {
    let score = 100;

    // Reduce score for low resolution
    if (metadata.width < 800 || metadata.height < 600) {
      score -= 20;
    }

    // Reduce score for very high compression
    if (metadata.density && metadata.density < 72) {
      score -= 15;
    }

    // Reduce score for very small file size (might indicate heavy compression)
    if (metadata.size && metadata.size < 50000) { // 50KB
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  // Method to delete image from blob storage
  async deleteImage(url: string): Promise<void> {
    try {
      // Vercel Blob doesn't have a direct delete method in the client
      // This would need to be handled by a server-side API route
      await fetch('/api/images/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  }

  // Method to get image info without processing
  async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    format: string;
    hasAlpha: boolean;
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const metadata = await sharp(buffer).metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: file.size,
      format: metadata.format || 'unknown',
      hasAlpha: metadata.hasAlpha || false,
    };
  }
}
