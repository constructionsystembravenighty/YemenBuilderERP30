import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Wifi, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWASetup() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showNotificationPermission, setShowNotificationPermission] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone || 
                     document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Check if already installed
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install banner after a delay if not installed
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      
      toast({
        title: "تم تثبيت التطبيق بنجاح!",
        description: "يمكنك الآن الوصول للمنصة من الشاشة الرئيسية",
        duration: 5000,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      setShowNotificationPermission(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast({
          title: "جاري تثبيت التطبيق...",
          description: "سيتم إضافة المنصة إلى الشاشة الرئيسية",
        });
      }
      
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        variant: "destructive",
        title: "فشل في التثبيت",
        description: "حدث خطأ أثناء تثبيت التطبيق",
      });
    }
  };

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        variant: "destructive",
        title: "الإشعارات غير مدعومة",
        description: "المتصفح لا يدعم الإشعارات",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast({
          title: "تم تفعيل الإشعارات",
          description: "ستحصل على إشعارات للتحديثات المهمة",
        });
        
        // Register for push notifications if service worker is available
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          
          // Subscribe to push notifications
          try {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: null // Add your VAPID key here
            });
            
            console.log('Push subscription:', subscription);
            // Send subscription to server
          } catch (error) {
            console.log('Push subscription failed:', error);
          }
        }
      } else {
        toast({
          variant: "destructive",
          title: "الإشعارات مرفوضة",
          description: "لن تحصل على إشعارات التحديثات",
        });
      }
      
      setShowNotificationPermission(false);
    } catch (error) {
      console.error('Notification permission failed:', error);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleDismissNotification = () => {
    setShowNotificationPermission(false);
    localStorage.setItem('notification-permission-dismissed', Date.now().toString());
  };

  // Don't show banners if already installed or standalone
  if (isInstalled || isStandalone) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      {showInstallBanner && (deferredPrompt || isIOS) && (
        <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm md:left-auto md:right-4 md:max-w-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">تثبيت التطبيق</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissInstall}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-sm">
              احصل على تجربة أفضل مع تطبيق المنصة
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wifi className="h-3 w-3" />
                  <span>يعمل بدون إنترنت</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Monitor className="h-3 w-3" />
                  <span>تجربة تطبيق أصلي</span>
                </div>
              </div>
              
              {isIOS ? (
                <div className="rounded-lg bg-blue-50 p-3 text-xs dark:bg-blue-950">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    لتثبيت التطبيق على iOS:
                  </p>
                  <ol className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
                    <li>1. اضغط على زر المشاركة في Safari</li>
                    <li>2. اختر "إضافة إلى الشاشة الرئيسية"</li>
                    <li>3. اضغط "إضافة"</li>
                  </ol>
                </div>
              ) : (
                <Button 
                  onClick={handleInstallClick}
                  className="w-full"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  تثبيت التطبيق
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Permission Banner */}
      {showNotificationPermission && (
        <Card className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:border-orange-800 dark:from-orange-950 dark:to-yellow-950 md:left-auto md:right-4 md:max-w-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-base text-orange-900 dark:text-orange-100">
                  تفعيل الإشعارات
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissNotification}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-orange-800 dark:text-orange-200">
              احصل على إشعارات فورية للتحديثات المهمة
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button 
                onClick={handleNotificationPermission}
                size="sm"
                className="flex-1"
                variant="outline"
              >
                تفعيل الإشعارات
              </Button>
              <Button 
                onClick={handleDismissNotification}
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
              >
                لاحقاً
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// PWA Status Component for header
export function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone;
    setIsInstalled(standalone);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isInstalled) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-muted-foreground">
        {isOnline ? 'متصل' : 'غير متصل'}
      </span>
    </div>
  );
}