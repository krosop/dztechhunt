import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCarouselProps {
  children: React.ReactNode;
  cardWidth?: number;
  gap?: number;
  showArrows?: boolean;
  autoScroll?: boolean;
  autoScrollSpeed?: number;
  className?: string;
}

export default function HorizontalCarousel({
  children,
  cardWidth = 280,
  gap = 16,
  showArrows = true,
  autoScroll = false,
  autoScrollSpeed = 30,
  className = '',
}: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const animFrameRef = useRef<number | undefined>(undefined);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  useEffect(() => {
    if (!autoScroll) return;
    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      if (!isPaused && scrollRef.current) {
        scrollRef.current.scrollLeft += (autoScrollSpeed * delta) / 1000;
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
          scrollRef.current.scrollLeft = 0;
        }
        checkScroll();
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [autoScroll, autoScrollSpeed, isPaused, checkScroll]);

  const scrollBy = (dir: number) => {
    if (!scrollRef.current) return;
    const scrollAmount = cardWidth + gap;
    scrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {showArrows && canScrollLeft && (
        <button
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1a2332] border border-[#2a3545] flex items-center justify-center hover:bg-[#00d4aa] hover:border-[#00d4aa] hover:text-[#0a0e14] text-white transition-all duration-200 shadow-lg active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-2 px-2"
        style={{ gap: `${gap}px`, WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>

      {showArrows && canScrollRight && (
        <button
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1a2332] border border-[#2a3545] flex items-center justify-center hover:bg-[#00d4aa] hover:border-[#00d4aa] hover:text-[#0a0e14] text-white transition-all duration-200 shadow-lg active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
