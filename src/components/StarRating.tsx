import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export default function StarRating({ rating, size = 16, showValue = false, reviewCount, className = '' }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`f${i}`} size={size} className="fill-[#f0b429] text-[#f0b429]" />
        ))}
        {hasHalf && (
          <div className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="absolute text-[#2a3545]" />
            <div className="absolute overflow-hidden" style={{ width: size / 2 }}>
              <Star size={size} className="fill-[#f0b429] text-[#f0b429]" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`e${i}`} size={size} className="text-[#2a3545]" />
        ))}
      </div>
      {showValue && <span className="text-sm font-semibold text-white ml-1">{rating}</span>}
      {reviewCount !== undefined && (
        <span className="text-[13px] text-[#5a6a7e]">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}
