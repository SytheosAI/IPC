'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate WebP source with optimization parameters
  const generateOptimizedSrc = (originalSrc: string, format: 'webp' | 'original' = 'webp') => {
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('blob:')) {
      return originalSrc;
    }

    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    if (format === 'webp') params.set('f', 'webp');
    
    // If using a CDN or image optimization service
    if (originalSrc.includes('supabase') || originalSrc.includes('cloudinary')) {
      return `${originalSrc}?${params.toString()}`;
    }
    
    // For local images, use Next.js image optimization if available
    if (originalSrc.startsWith('/')) {
      return `/_next/image?url=${encodeURIComponent(originalSrc)}&${params.toString()}`;
    }
    
    return originalSrc;
  };

  // Check WebP support
  const supportsWebP = () => {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isInView]);

  // Set optimized source when in view
  useEffect(() => {
    if (isInView && !currentSrc) {
      const webpSrc = supportsWebP() ? generateOptimizedSrc(src, 'webp') : generateOptimizedSrc(src, 'original');
      setCurrentSrc(webpSrc);
    }
  }, [isInView, src, currentSrc, width, height, quality]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    // Fallback to original image if WebP fails
    if (currentSrc.includes('f=webp')) {
      setCurrentSrc(generateOptimizedSrc(src, 'original'));
      setError(false);
    } else {
      onError?.();
    }
  };

  const getPlaceholderSrc = () => {
    if (blurDataURL) return blurDataURL;
    
    // Generate a low-quality placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 10, 10);
    }
    return canvas.toDataURL();
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      )}
      
      {/* Loading spinner */}
      {!isLoaded && !error && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          Failed to load image
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={isInView ? currentSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      
      {/* Performance hint for critical images */}
      {priority && (
        <link
          rel="preload"
          as="image"
          href={currentSrc}
          // @ts-ignore
          fetchPriority="high"
        />
      )}
    </div>
  );
}

// Hook for batch image preloading
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isPreloading, setIsPreloading] = useState(false);

  const preloadImages = async (imageUrls: string[]) => {
    setIsPreloading(true);
    
    const promises = imageUrls.map((url) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, url]));
          resolve(url);
        };
        img.onerror = () => reject(url);
        img.src = url;
      });
    });

    try {
      await Promise.allSettled(promises);
    } finally {
      setIsPreloading(false);
    }
  };

  useEffect(() => {
    if (urls.length > 0) {
      preloadImages(urls);
    }
  }, [urls]);

  return {
    loadedImages,
    isPreloading,
    preloadImages
  };
}

// Progressive image loading component for galleries
export function ProgressiveImageGallery({ 
  images, 
  className = '' 
}: { 
  images: Array<{ src: string; alt: string; width?: number; height?: number }>;
  className?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(6);
  const { loadedImages, isPreloading } = useImagePreloader(
    images.slice(0, visibleCount).map(img => img.src)
  );

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, images.length));
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.slice(0, visibleCount).map((image, index) => (
          <OptimizedImage
            key={index}
            src={image.src}
            alt={image.alt}
            width={image.width || 400}
            height={image.height || 300}
            className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
            priority={index < 3}
          />
        ))}
      </div>
      
      {visibleCount < images.length && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={isPreloading}
            className="px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPreloading ? (
              <>
                <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              `Load More (${images.length - visibleCount} remaining)`
            )}
          </button>
        </div>
      )}
    </div>
  );
}