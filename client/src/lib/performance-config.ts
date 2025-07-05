// Ultra-High Performance Configuration
// 120fps, 8K support, mobile-first optimization

export const PERFORMANCE_CONFIG = {
  // Rendering Performance
  TARGET_FPS: 120,
  ANIMATION_DURATION: 150, // Reduced for 120fps
  DEBOUNCE_DELAY: 16, // ~60fps input handling
  
  // Data Loading
  PAGINATION_SIZE: {
    mobile: 20,
    tablet: 50,
    desktop: 100,
    ultrawide: 200
  },
  
  // Virtual Scrolling
  VIRTUAL_ITEM_HEIGHT: 60,
  VIRTUAL_BUFFER_SIZE: 10,
  
  // Image Optimization
  IMAGE_SIZES: {
    thumb: { width: 150, height: 150, quality: 80 },
    medium: { width: 800, height: 600, quality: 90 },
    large: { width: 1920, height: 1080, quality: 95 },
    ultra: { width: 3840, height: 2160, quality: 100 }, // 4K
    max: { width: 7680, height: 4320, quality: 100 }    // 8K
  },
  
  // Cache Configuration
  CACHE_TTL: {
    static: 1000 * 60 * 60 * 24, // 24 hours
    dynamic: 1000 * 60 * 5,      // 5 minutes
    realtime: 1000 * 30          // 30 seconds
  },
  
  // Network Optimization
  CONCURRENT_REQUESTS: 6,
  REQUEST_TIMEOUT: 8000,
  RETRY_ATTEMPTS: 3,
  
  // Memory Management
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB
  GC_THRESHOLD: 0.8,
  
  // Device Detection
  BREAKPOINTS: {
    mobile: 320,
    mobileLarge: 480,
    tablet: 768,
    desktop: 1024,
    desktopLarge: 1440,
    ultrawide: 2560,
    ultra4k: 3840,
    ultra8k: 7680
  }
};

// High-Performance Device Detection
export const detectDevice = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;
  const isTouch = 'ontouchstart' in window;
  
  // Calculate effective resolution
  const effectiveWidth = width * pixelRatio;
  const effectiveHeight = height * pixelRatio;
  
  return {
    width,
    height,
    pixelRatio,
    effectiveWidth,
    effectiveHeight,
    isTouch,
    isMobile: width < PERFORMANCE_CONFIG.BREAKPOINTS.tablet,
    isTablet: width >= PERFORMANCE_CONFIG.BREAKPOINTS.tablet && width < PERFORMANCE_CONFIG.BREAKPOINTS.desktop,
    isDesktop: width >= PERFORMANCE_CONFIG.BREAKPOINTS.desktop,
    isUltrawide: width >= PERFORMANCE_CONFIG.BREAKPOINTS.ultrawide,
    is4K: effectiveWidth >= 3840,
    is8K: effectiveWidth >= 7680,
    supportsHighRefresh: 'requestIdleCallback' in window,
    memoryInfo: (performance as any).memory ? {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit
    } : null
  };
};

// Performance Monitoring
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  
  startMonitoring() {
    const updateFPS = () => {
      this.frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - this.lastTime;
      
      if (elapsed >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / elapsed);
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        // Log performance warnings
        if (this.fps < 60) {
          console.warn(`Performance warning: FPS dropped to ${this.fps}`);
        }
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    requestAnimationFrame(updateFPS);
  }
  
  getFPS() {
    return this.fps;
  }
  
  measureRenderTime<T>(fn: () => T): { result: T; renderTime: number } {
    const start = performance.now();
    const result = fn();
    const renderTime = performance.now() - start;
    return { result, renderTime };
  }
}

export const performanceMonitor = new PerformanceMonitor();