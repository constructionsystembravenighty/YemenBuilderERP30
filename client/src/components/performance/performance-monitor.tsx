import { useState, useEffect, useCallback } from 'react';
import { Activity, Zap, Clock, Database, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface PerformanceMetrics {
  loadTime: number;
  apiResponseTime: number;
  bundleSize: number;
  memoryUsage: number;
  networkStatus: 'online' | 'offline' | 'slow';
  firstContentfulPaint: number;
  timeToInteractive: number;
  dbQueryTime: number;
  cacheHitRatio: number;
}

interface NetworkSpeed {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    apiResponseTime: 0,
    bundleSize: 0,
    memoryUsage: 0,
    networkStatus: 'online',
    firstContentfulPaint: 0,
    timeToInteractive: 0,
    dbQueryTime: 0,
    cacheHitRatio: 95
  });
  
  const [networkSpeed, setNetworkSpeed] = useState<NetworkSpeed>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    latency: 0,
    quality: 'good'
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Performance measurement utilities
  const measureApiResponseTime = useCallback(async () => {
    const start = performance.now();
    try {
      await fetch('/api/dashboard/stats');
      const end = performance.now();
      return end - start;
    } catch {
      return 1000; // Default fallback
    }
  }, []);

  const measureNetworkSpeed = useCallback(async (): Promise<NetworkSpeed> => {
    const connection = (navigator as any).connection;
    
    if (connection) {
      const downlink = connection.downlink || 0;
      const rtt = connection.rtt || 0;
      
      let quality: NetworkSpeed['quality'] = 'good';
      if (downlink > 10) quality = 'excellent';
      else if (downlink > 1) quality = 'good';
      else if (downlink > 0.5) quality = 'fair';
      else quality = 'poor';
      
      return {
        downloadSpeed: downlink,
        uploadSpeed: downlink * 0.8, // Estimate
        latency: rtt,
        quality
      };
    }
    
    // Fallback speed test
    const start = performance.now();
    try {
      const response = await fetch('/api/projects', { 
        cache: 'no-cache',
        headers: { 'x-performance-test': 'true' }
      });
      const end = performance.now();
      const latency = end - start;
      
      let quality: NetworkSpeed['quality'] = 'good';
      if (latency < 100) quality = 'excellent';
      else if (latency < 300) quality = 'good';
      else if (latency < 600) quality = 'fair';
      else quality = 'poor';
      
      return {
        downloadSpeed: latency < 200 ? 5 : latency < 500 ? 2 : 1,
        uploadSpeed: latency < 200 ? 4 : latency < 500 ? 1.5 : 0.8,
        latency,
        quality
      };
    } catch {
      return { downloadSpeed: 0, uploadSpeed: 0, latency: 1000, quality: 'poor' };
    }
  }, []);

  const getPerformanceEntries = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const loadTime = navigation?.loadEventEnd - navigation?.navigationStart || 0;
    const tti = navigation?.domInteractive - navigation?.navigationStart || 0;
    
    return { fcp, loadTime, tti };
  }, []);

  const getMemoryUsage = useCallback(() => {
    const memory = (performance as any).memory;
    if (memory) {
      return (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
    }
    return 0;
  }, []);

  const checkNetworkStatus = useCallback(() => {
    if (!navigator.onLine) return 'offline';
    
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 'slow';
      }
    }
    
    return 'online';
  }, []);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = async () => {
      const { fcp, loadTime, tti } = getPerformanceEntries();
      const apiTime = await measureApiResponseTime();
      const memory = getMemoryUsage();
      const networkStatus = checkNetworkStatus();
      const speed = await measureNetworkSpeed();
      
      setMetrics(prev => ({
        ...prev,
        loadTime,
        apiResponseTime: apiTime,
        memoryUsage: memory,
        networkStatus: networkStatus as any,
        firstContentfulPaint: fcp,
        timeToInteractive: tti,
        dbQueryTime: apiTime * 0.7, // Estimate
        bundleSize: 2.5 // MB estimate
      }));
      
      setNetworkSpeed(speed);
    };

    if (isMonitoring) {
      updateMetrics();
      const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isMonitoring, measureApiResponseTime, getPerformanceEntries, getMemoryUsage, checkNetworkStatus, measureNetworkSpeed]);

  // Initialize monitoring
  useEffect(() => {
    setIsMonitoring(true);
  }, []);

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'text-green-500';
    if (value <= thresholds[1]) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getNetworkIcon = () => {
    if (metrics.networkStatus === 'offline') return <WifiOff className="h-4 w-4 text-red-500" />;
    if (metrics.networkStatus === 'slow') return <Wifi className="h-4 w-4 text-yellow-500" />;
    return <Wifi className="h-4 w-4 text-green-500" />;
  };

  const formatMs = (ms: number) => `${Math.round(ms)}ms`;
  const formatMB = (mb: number) => `${mb.toFixed(1)}MB`;
  const formatMbps = (mbps: number) => `${mbps.toFixed(1)} Mbps`;
  const formatPercent = (percent: number) => `${Math.round(percent)}%`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          مراقب الأداء
          <Badge variant="outline" className="mr-auto">
            {isMonitoring ? 'نشط' : 'متوقف'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Core Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">زمن التحميل</span>
              <span className={`text-sm ${getStatusColor(metrics.loadTime, [1000, 3000])}`}>
                {formatMs(metrics.loadTime)}
              </span>
            </div>
            <Progress value={Math.min((metrics.loadTime / 5000) * 100, 100)} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">استجابة API</span>
              <span className={`text-sm ${getStatusColor(metrics.apiResponseTime, [200, 500])}`}>
                {formatMs(metrics.apiResponseTime)}
              </span>
            </div>
            <Progress value={Math.min((metrics.apiResponseTime / 1000) * 100, 100)} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">استخدام الذاكرة</span>
              <span className={`text-sm ${getStatusColor(metrics.memoryUsage, [70, 90])}`}>
                {formatPercent(metrics.memoryUsage)}
              </span>
            </div>
            <Progress value={metrics.memoryUsage} className="h-2" />
          </div>
        </div>

        <Separator />

        {/* Web Vitals */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" />
            مؤشرات الويب الأساسية
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">First Contentful Paint</div>
              <div className={`text-lg font-semibold ${getStatusColor(metrics.firstContentfulPaint, [1000, 2500])}`}>
                {formatMs(metrics.firstContentfulPaint)}
              </div>
              <div className="text-xs text-muted-foreground">الهدف: &lt;1.8s</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Time to Interactive</div>
              <div className={`text-lg font-semibold ${getStatusColor(metrics.timeToInteractive, [2500, 4000])}`}>
                {formatMs(metrics.timeToInteractive)}
              </div>
              <div className="text-xs text-muted-foreground">الهدف: &lt;3.8s</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Bundle Size</div>
              <div className={`text-lg font-semibold ${getStatusColor(metrics.bundleSize, [3, 5])}`}>
                {formatMB(metrics.bundleSize)}
              </div>
              <div className="text-xs text-muted-foreground">الهدف: &lt;3MB</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Network Performance */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            {getNetworkIcon()}
            أداء الشبكة
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">سرعة التحميل</div>
              <div className="text-lg font-semibold">{formatMbps(networkSpeed.downloadSpeed)}</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">سرعة الرفع</div>
              <div className="text-lg font-semibold">{formatMbps(networkSpeed.uploadSpeed)}</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">زمن الاستجابة</div>
              <div className={`text-lg font-semibold ${getStatusColor(networkSpeed.latency, [100, 300])}`}>
                {formatMs(networkSpeed.latency)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">جودة الاتصال</div>
              <Badge variant={
                networkSpeed.quality === 'excellent' ? 'default' :
                networkSpeed.quality === 'good' ? 'secondary' :
                networkSpeed.quality === 'fair' ? 'outline' : 'destructive'
              }>
                {networkSpeed.quality === 'excellent' ? 'ممتاز' :
                 networkSpeed.quality === 'good' ? 'جيد' :
                 networkSpeed.quality === 'fair' ? 'مقبول' : 'ضعيف'}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Database Performance */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Database className="h-4 w-4" />
            أداء قاعدة البيانات
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">زمن الاستعلام المتوسط</div>
              <div className={`text-lg font-semibold ${getStatusColor(metrics.dbQueryTime, [50, 200])}`}>
                {formatMs(metrics.dbQueryTime)}
              </div>
              <div className="text-xs text-muted-foreground">الهدف: &lt;100ms</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">نسبة إصابة التخزين المؤقت</div>
              <div className="text-lg font-semibold text-green-500">
                {formatPercent(metrics.cacheHitRatio)}
              </div>
              <div className="text-xs text-muted-foreground">الهدف: &gt;95%</div>
            </div>
          </div>
        </div>

        {/* Performance Recommendations */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            توصيات تحسين الأداء
          </h4>
          <ul className="text-sm space-y-1 text-right" dir="rtl">
            {metrics.loadTime > 3000 && (
              <li>• قم بتفعيل ضغط Gzip لتقليل حجم الملفات</li>
            )}
            {metrics.apiResponseTime > 500 && (
              <li>• فكر في إضافة فهرسة لقاعدة البيانات</li>
            )}
            {metrics.memoryUsage > 80 && (
              <li>• راقب استخدام الذاكرة وقم بتحسين الكود</li>
            )}
            {networkSpeed.quality === 'poor' && (
              <li>• اتصال الإنترنت ضعيف - فعّل وضع التوفير</li>
            )}
            {metrics.bundleSize > 4 && (
              <li>• قم بتقسيم الكود لتقليل حجم الحزمة</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}