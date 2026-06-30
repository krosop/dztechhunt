import { useState, useCallback } from 'react';

interface CategoryImageProps {
  src: string;
  className?: string;
}

export default function CategoryImage({ src, className }: CategoryImageProps) {
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Check if source is valid
  const hasValidSrc = src && src.length > 10 && !src.includes('product-pc-case');

  // Determine which URL to use
  const imgSrc = useFallback ? (src || '') : (hasValidSrc ? src : null);

  const handleError = useCallback(() => {
    if (!useFallback && hasValidSrc) {
      // Try original URL without proxy
      const original = src.includes('weserv.nl') ? null : src;
      if (original) {
        setUseFallback(true);
        return;
      }
    }
    setHasError(true);
  }, [useFallback, hasValidSrc, src]);

  // No valid image → show skeleton placeholder
  if (!imgSrc || hasError) {
    return (
      <div className={`${className} bg-[#0d131c] relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d131c] via-[#111821] to-[#0d131c] animate-pulse" />
      </div>
    );
  }

  // Show image immediately — no opacity transition, no delay
  return (
    <div className={`${className} bg-[#0d131c] relative overflow-hidden`}>
      <img
        src={imgSrc}
        alt=""
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain p-2"
        onError={handleError}
        loading="eager"
        decoding="sync"
        fetchPriority="high"
      />
    </div>
  );
}
