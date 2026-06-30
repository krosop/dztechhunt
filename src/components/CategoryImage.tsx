import { useState, useEffect, useMemo } from 'react';
import { proxiedImageUrl } from '@/hooks/useProductImage';

interface CategoryImageProps {
  src: string;
  className?: string;
}

export default function CategoryImage({ src, className }: CategoryImageProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const hasSrc = src && src.length > 10 && !src.includes('product-pc-case');

  const imgSrc = useMemo(() => {
    if (!hasSrc) return null;
    const proxied = proxiedImageUrl(src);
    return proxied || src;
  }, [src, hasSrc]);

  const fallbackSrc = useMemo(() => {
    if (!hasSrc) return null;
    // If proxy URL is being used, retry with original URL on failure
    const proxied = proxiedImageUrl(src);
    return proxied && proxied !== src ? src : null;
  }, [src, hasSrc]);

  // Reset loading state when src changes
  useEffect(() => {
    setImgLoaded(false);
    setRetrying(false);
  }, [src]);

  if (!imgSrc) {
    return (
      <div className={`${className} bg-[#0d131c] relative overflow-hidden animate-pulse`}>
        <div className="absolute inset-0" style={{
          background: `linear-gradient(90deg, #0d131c 0%, #111821 50%, #0d131c 100%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`${className} bg-[#0d131c] relative overflow-hidden`}>
      <img
        src={retrying ? (fallbackSrc || imgSrc) : imgSrc}
        alt={''}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-contain p-2 transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImgLoaded(true)}
        onError={() => {
          if (!retrying && fallbackSrc) {
            setRetrying(true);
          } else {
            // Both proxy and original failed — keep skeleton visible
            setImgLoaded(false);
          }
        }}
        loading="eager"
        decoding="auto"
        fetchPriority="high"
      />
      {!imgLoaded && (
        <div className="absolute inset-0" style={{
          background: `linear-gradient(90deg, #0d131c 0%, #111821 50%, #0d131c 100%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}>
          <style>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
