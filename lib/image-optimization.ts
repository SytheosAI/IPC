/**
 * Image Optimization Utilities
 * Handles WebP conversion, compression, and lazy loading optimization
 */

export interface ImageOptimizationOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  blur?: number;
  progressive?: boolean;
}

export interface OptimizedImageResult {
  src: string;
  webpSrc?: string;
  blurDataURL?: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Check if the browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    const webpTest = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    const img = new Image();
    
    img.onload = img.onerror = () => {
      resolve(img.height === 2);
    };
    
    img.src = webpTest;
  });
}

/**
 * Generate optimized image URLs with parameters
 */
export function generateOptimizedUrl(
  src: string, 
  options: ImageOptimizationOptions = {}
): string {
  const {
    quality = 75,
    width,
    height,
    format = 'auto'
  } = options;

  // Handle data URLs and blob URLs
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  
  if (format !== 'auto') {
    params.set('f', format);
  }

  // Handle Supabase Storage URLs
  if (src.includes('supabase.co/storage')) {
    const url = new URL(src);
    // Supabase supports image transformations
    url.searchParams.set('width', width?.toString() || '');
    url.searchParams.set('height', height?.toString() || '');
    url.searchParams.set('quality', quality.toString());
    if (format === 'webp') {
      url.searchParams.set('format', 'webp');
    }
    return url.toString();
  }

  // Handle Next.js Image Optimization
  if (src.startsWith('/') && typeof window !== 'undefined') {
    return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
  }

  // Handle external CDNs (Cloudinary, ImageKit, etc.)
  if (src.includes('cloudinary.com')) {
    return `${src}?${params.toString()}`;
  }

  // Default fallback
  return src;
}

/**
 * Create a low-quality placeholder image
 */
export function generateBlurDataURL(
  width: number = 10, 
  height: number = 10,
  color: string = '#f3f4f6'
): string {
  if (typeof window === 'undefined') {
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/></svg>`
    )}`;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

/**
 * Compress and convert image to WebP using Canvas API
 */
export function compressImageToWebP(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<{ webpBlob: Blob; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const {
      quality = 0.8,
      width,
      height
    } = options;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Calculate dimensions maintaining aspect ratio
      let { width: imgWidth, height: imgHeight } = img;
      
      if (width || height) {
        const aspectRatio = imgWidth / imgHeight;
        
        if (width && height) {
          imgWidth = width;
          imgHeight = height;
        } else if (width) {
          imgWidth = width;
          imgHeight = width / aspectRatio;
        } else if (height) {
          imgHeight = height;
          imgWidth = height * aspectRatio;
        }
      }

      canvas.width = imgWidth;
      canvas.height = imgHeight;

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw and compress
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              webpBlob: blob,
              originalSize: file.size,
              compressedSize: blob.size
            });
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Batch optimize multiple images
 */
export async function batchOptimizeImages(
  files: File[],
  options: ImageOptimizationOptions = {}
): Promise<Array<{
  original: File;
  optimized: Blob;
  compressionRatio: number;
  sizeSaved: number;
}>> {
  const results = await Promise.allSettled(
    files.map(async (file) => {
      const { webpBlob, originalSize, compressedSize } = await compressImageToWebP(file, options);
      
      return {
        original: file,
        optimized: webpBlob,
        compressionRatio: Math.round((1 - compressedSize / originalSize) * 100),
        sizeSaved: originalSize - compressedSize
      };
    })
  );

  return results
    .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
    .map(result => result.value);
}

/**
 * Image loading performance monitor
 */
export class ImagePerformanceMonitor {
  private metrics: Map<string, {
    startTime: number;
    loadTime?: number;
    size?: number;
    cached?: boolean;
  }> = new Map();

  startTracking(src: string, size?: number) {
    this.metrics.set(src, {
      startTime: performance.now(),
      size,
      cached: false
    });
  }

  endTracking(src: string, cached: boolean = false) {
    const metric = this.metrics.get(src);
    if (metric) {
      metric.loadTime = performance.now() - metric.startTime;
      metric.cached = cached;
    }
  }

  getMetrics() {
    const metrics = Array.from(this.metrics.entries()).map(([src, data]) => ({
      src,
      ...data
    }));

    return {
      totalImages: metrics.length,
      averageLoadTime: metrics.reduce((sum, m) => sum + (m.loadTime || 0), 0) / metrics.length,
      cachedImages: metrics.filter(m => m.cached).length,
      totalSize: metrics.reduce((sum, m) => sum + (m.size || 0), 0),
      slowestImage: metrics.reduce((slowest, current) => 
        (current.loadTime || 0) > (slowest.loadTime || 0) ? current : slowest
      ),
      fastestImage: metrics.reduce((fastest, current) => 
        (current.loadTime || 0) < (fastest.loadTime || 0) ? current : fastest
      )
    };
  }

  clear() {
    this.metrics.clear();
  }
}

/**
 * Progressive image loading for galleries
 */
export class ProgressiveImageLoader {
  private loadedImages: Set<string> = new Set();
  private loadingQueue: string[] = [];
  private isLoading: boolean = false;
  private concurrency: number = 3;

  constructor(concurrency: number = 3) {
    this.concurrency = concurrency;
  }

  async loadImages(urls: string[]): Promise<void> {
    this.loadingQueue.push(...urls.filter(url => !this.loadedImages.has(url)));
    
    if (!this.isLoading) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isLoading = true;
    
    while (this.loadingQueue.length > 0) {
      const batch = this.loadingQueue.splice(0, this.concurrency);
      
      await Promise.allSettled(
        batch.map(url => this.loadSingleImage(url))
      );
    }
    
    this.isLoading = false;
  }

  private loadSingleImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.add(url);
        resolve();
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
  }

  isImageLoaded(url: string): boolean {
    return this.loadedImages.has(url);
  }

  getLoadedCount(): number {
    return this.loadedImages.size;
  }

  clear(): void {
    this.loadedImages.clear();
    this.loadingQueue = [];
    this.isLoading = false;
  }
}

// Global image performance monitor instance
export const imagePerformanceMonitor = new ImagePerformanceMonitor();

// Global progressive loader instance
export const progressiveImageLoader = new ProgressiveImageLoader();