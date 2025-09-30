'use client';

import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
// import { ImageProcessor } from '@/lib/storage/image-processor';
import { AnalyticsCollector } from '@/lib/analytics/collector';
import { UploadOptions, Image as ImageType, UploadProgress } from '@/types';
import { Upload, Image as ImageIcon, Copy, Share2, Clock } from 'lucide-react';

export default function HomePage() {
  const [uploadedImages, setUploadedImages] = useState<ImageType[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage] = useState<ImageType | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [uploadOptions, setUploadOptions] = useState<UploadOptions>({
    auto_delete_minutes: 20,
    is_public: true,
    convert_to_webp: true,
    quality: 80,
  });

  // const imageProcessor = useRef(new ImageProcessor());
  // const analyticsCollector = useRef(new AnalyticsCollector());

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress({
      loaded: 0,
      total: acceptedFiles.length,
      percentage: 0,
      status: 'uploading',
      message: 'Starting upload...',
    });

    try {
      const processedImages: ImageType[] = [];

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        
        setUploadProgress({
          loaded: i,
          total: acceptedFiles.length,
          percentage: (i / acceptedFiles.length) * 100,
          status: 'uploading',
          message: `Processing ${file.name}...`,
        });

        try {
          // Upload file directly to server for processing
          const formData = new FormData();
          formData.append('file', file);
          formData.append('options', JSON.stringify(uploadOptions));
          
          const response = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const uploadedImage = await response.json();
          processedImages.push(uploadedImage);

          setUploadProgress({
            loaded: i + 1,
            total: acceptedFiles.length,
            percentage: ((i + 1) / acceptedFiles.length) * 100,
            status: 'uploading',
            message: `Uploaded ${file.name}`,
          });
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
        }
      }

      setUploadedImages(prev => [...prev, ...processedImages]);
      setUploadProgress({
        loaded: acceptedFiles.length,
        total: acceptedFiles.length,
        percentage: 100,
        status: 'completed',
        message: 'Upload completed!',
      });

      // Reset progress after 2 seconds
      setTimeout(() => {
        setUploadProgress(null);
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress({
        loaded: 0,
        total: acceptedFiles.length,
        percentage: 0,
        status: 'error',
        message: 'Upload failed. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadOptions]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.avif'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 32 * 1024 * 1024, // 32MB
    multiple: true,
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success toast
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const generateEmbedCode = (image: ImageType, type: 'html' | 'bbcode') => {
    if (type === 'html') {
      return `<img src="${image.url}" alt="${image.original_name}" width="${image.width}" height="${image.height}" />`;
    } else {
      return `[img]${image.url}[/img]`;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeRemaining = (deleteAt: string) => {
    const now = new Date();
    const deleteTime = new Date(deleteAt);
    const diff = deleteTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ImageIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">ImgWRR</h1>
            </div>
            <nav className="flex space-x-4">
              <button className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </button>
              <button className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Albums
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Upload & Share Images
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fast, secure, and temporary image sharing. Your images are automatically deleted after the specified time.
            </p>
          </div>

          {/* Upload Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-delete after
              </label>
              <select
                value={uploadOptions.auto_delete_minutes}
                onChange={(e) => setUploadOptions(prev => ({
                  ...prev,
                  auto_delete_minutes: parseInt(e.target.value)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>5 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={60}>1 hour</option>
                <option value={1440}>1 day</option>
                <option value={10080}>1 week</option>
                <option value={43200}>1 month</option>
                <option value={259200}>6 months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy
              </label>
              <select
                value={uploadOptions.is_public ? 'public' : 'private'}
                onChange={(e) => setUploadOptions(prev => ({
                  ...prev,
                  is_public: e.target.value === 'public'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality
              </label>
              <select
                value={uploadOptions.quality}
                onChange={(e) => setUploadOptions(prev => ({
                  ...prev,
                  quality: parseInt(e.target.value)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={60}>Low (60%)</option>
                <option value={80}>Medium (80%)</option>
                <option value={90}>High (90%)</option>
                <option value={100}>Original (100%)</option>
              </select>
            </div>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive
                ? 'Drop the files here...'
                : 'Drag & drop images here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, GIF, WebP, HEIC, AVIF, PDF (max 32MB)
            </p>
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{uploadProgress.message}</span>
                <span>{uploadProgress.percentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    uploadProgress.status === 'error'
                      ? 'bg-red-500'
                      : uploadProgress.status === 'completed'
                      ? 'bg-green-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Uploaded Images ({uploadedImages.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedImages.map((image) => (
                <div
                  key={image.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {image.thumbnail_url ? (
                      <img
                        src={image.thumbnail_url}
                        alt={image.original_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 truncate">
                      {image.original_name}
                    </h4>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                      <span>{formatFileSize(image.size)}</span>
                      <span>{image.width}×{image.height}</span>
                    </div>
                    {image.auto_delete_at && (
                      <div className="flex items-center text-sm text-orange-600 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTimeRemaining(image.auto_delete_at)}
                      </div>
                    )}
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => copyToClipboard(image.url)}
                        className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 flex items-center justify-center"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 flex items-center justify-center"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Share Modal */}
      {showShareModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Share Image
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direct Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={selectedImage.url}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedImage.url)}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Embed
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={generateEmbedCode(selectedImage, 'html')}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => copyToClipboard(generateEmbedCode(selectedImage, 'html'))}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BBCode
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={generateEmbedCode(selectedImage, 'bbcode')}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => copyToClipboard(generateEmbedCode(selectedImage, 'bbcode'))}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}