import { useState, useEffect, useRef } from 'react';
import { detectDevice, PERFORMANCE_CONFIG } from '../../lib/performance-config';
import { cn } from '../../lib/utils';

interface MobileOptimizedCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: 'light' | 'medium' | 'heavy';
  glow?: boolean;
  interactive?: boolean;
  loading?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export function MobileOptimizedCard({
  children,
  className = '',
  blur = 'medium',
  glow = false,
  interactive = true,
  loading = false,
  priority = 'medium'
}: MobileOptimizedCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  // Device detection for optimal rendering
  const device = detectDevice();
  
  // Dynamic blur intensity based on device capabilities
  const blurIntensity = {
    light: device.is8K ? 'backdrop-blur-sm' : device.is4K ? 'backdrop-blur-xs' : 'backdrop-blur-sm',
    medium: device.is8K ? 'backdrop-blur-lg' : device.is4K ? 'backdrop-blur-md' : 'backdrop-blur-md',
    heavy: device.is8K ? 'backdrop-blur-2xl' : device.is4K ? 'backdrop-blur-xl' : 'backdrop-blur-lg'
  }[blur];
  
  // Priority-based performance optimization
  const animationDuration = {
    low: 300,
    medium: PERFORMANCE_CONFIG.ANIMATION_DURATION,
    high: 100,
    critical: 50
  }[priority];
  
  // Touch handlers for ultra-responsive mobile interaction
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!interactive) return;
    
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsPressed(true);
    
    // Haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(1);
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!interactive || !touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // Only trigger if touch didn't move too much (not a swipe)
    if (deltaX < 10 && deltaY < 10) {
      // Touch tap completed
    }
    
    setIsPressed(false);
    touchStartRef.current = null;
  };
  
  // Mouse handlers for desktop
  const handleMouseEnter = () => {
    if (!device.isTouch && interactive) {
      setIsHovered(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!device.isTouch && interactive) {
      setIsHovered(false);
    }
  };
  
  // Performance optimization for high refresh displays
  useEffect(() => {
    if (device.supportsHighRefresh && cardRef.current) {
      cardRef.current.style.willChange = 'transform, opacity';
    }
    
    return () => {
      if (cardRef.current) {
        cardRef.current.style.willChange = 'auto';
      }
    };
  }, [device.supportsHighRefresh]);
  
  // Loading skeleton
  if (loading) {
    return (
      <div className={cn(
        'h-32 rounded-2xl animate-pulse',
        'bg-gradient-to-br from-white/10 to-white/5',
        blurIntensity,
        className
      )}>
        <div className="h-full w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }
  
  return (
    <div
      ref={cardRef}
      className={cn(
        // Base glassmorphic styling
        'relative overflow-hidden rounded-2xl border border-white/20',
        'bg-gradient-to-br from-white/15 to-white/5',
        blurIntensity,
        
        // Interactive states
        interactive && [
          'transition-all duration-300 ease-out cursor-pointer',
          'hover:border-white/30 hover:shadow-2xl',
          'active:scale-[0.98] active:shadow-lg',
          isPressed && 'scale-[0.98] shadow-lg',
          isHovered && 'border-white/30 shadow-2xl'
        ],
        
        // Glow effect
        glow && [
          'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
          'hover:shadow-[0_0_50px_rgba(59,130,246,0.25)]'
        ],
        
        // Mobile-first optimizations
        device.isMobile && [
          'min-h-touch-target', // Ensure 44px minimum touch target
          'active:scale-[0.95]' // More pronounced feedback on mobile
        ],
        
        // Ultra-high resolution optimizations
        device.is8K && 'border-2 border-white/25',
        device.is4K && 'border-[1.5px] border-white/22',
        
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transitionDuration: `${animationDuration}ms`,
        transform: `translateZ(0)`, // Force hardware acceleration
        backfaceVisibility: 'hidden'
      }}
    >
      {/* Ultra-subtle animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className={cn(
          'absolute inset-0 bg-gradient-to-r',
          'from-transparent via-white/5 to-transparent',
          'translate-x-[-100%] animate-shimmer'
        )} />
      </div>
      
      {/* Content wrapper */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Corner accent (for high-priority items) */}
      {priority === 'critical' && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-400/60" />
      )}
      
      {/* Inline styles for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .min-h-touch-target {
          min-height: 44px;
        }
        
        /* High refresh rate optimizations */
        @media (min-resolution: 120dpi) {
          .transition-all {
            transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        }
        
        /* Ultra-high resolution scaling */
        @media (min-width: 3840px) {
          .rounded-2xl {
            border-radius: 1.5rem;
          }
          
          .p-6 {
            padding: 2rem;
          }
        }
        
        @media (min-width: 7680px) {
          .rounded-2xl {
            border-radius: 2rem;
          }
          
          .p-6 {
            padding: 3rem;
          }
        }
      `}</style>
    </div>
  );
}