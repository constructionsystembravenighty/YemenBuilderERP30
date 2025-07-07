import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, X, Smartphone, Wifi, Zap, Shield } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function AndroidPWASetup() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Enhanced Android and Chrome detection
    const userAgent = navigator.userAgent;
    const androidDevice = /Android/.test(userAgent);
    const chromeDevice = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    
    setIsAndroid(androidDevice);
    setIsChrome(chromeDevice);

    // Check if app is already running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone || 
                     document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    if (standalone) {
      setIsInstalled(true);
      return;
    }

    console.log('PWA: Android PWA Setup initialized', { androidDevice, chromeDevice });

    // Enhanced beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('PWA: beforeinstallprompt event fired for Android');
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show banner for Android Chrome users
      if (androidDevice && chromeDevice) {
        setTimeout(() => {
          setShowInstallBanner(true);
          console.log('PWA: Showing install banner for Android Chrome');
        }, 1500);
      }
    };

    // App installed handler
    const handleAppInstalled = () => {
      console.log('PWA: App installed successfully');
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      
      toast({
        title: "تم تثبيت التطبيق بنجاح",
        description: "يمكنك الآن الوصول للمنصة من الشاشة الرئيسية",
        duration: 5000,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Force trigger check for PWA installability
    if (androidDevice && chromeDevice && !standalone) {
      // Check if PWA criteria are met
      setTimeout(() => {
        if (!deferredPrompt) {
          console.log('PWA: No beforeinstallprompt event, checking PWA criteria...');
          // Show manual installation instructions
          setShowInstallBanner(true);
        }
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('PWA: No deferred prompt - showing manual instructions');
      // Manual installation instructions for Android
      toast({
        title: "تثبيت التطبيق يدوياً",
        description: "انقر على قائمة المتصفح (⋮) ← اختر 'إضافة إلى الشاشة الرئيسية'",
        duration: 10000,
      });
      
      // Try to trigger fallback installation method
      if (isAndroid && isChrome) {
        console.log('PWA: Attempting to trigger manual installation flow');
        // Some Android versions may not fire beforeinstallprompt immediately
        // Keep the banner visible for manual installation
        return;
      }
      return;
    }

    try {
      console.log('PWA: Triggering installation prompt');
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('PWA: User installation choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        toast({
          title: "جاري تثبيت التطبيق...",
          description: "سيظهر التطبيق في الشاشة الرئيسية خلال ثوانٍ قليلة",
        });
        setIsInstalled(true);
      } else {
        toast({
          title: "تم إلغاء التثبيت",
          description: "يمكنك تثبيت التطبيق في أي وقت من قائمة المتصفح",
        });
      }
      
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } catch (error) {
      console.error('PWA: Installation error:', error);
      toast({
        variant: "destructive",
        title: "خطأ في التثبيت",
        description: "جرب التثبيت اليدوي: قائمة المتصفح ← 'إضافة إلى الشاشة الرئيسية'",
      });
    }
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem('android-pwa-install-dismissed', Date.now().toString());
    console.log('PWA: Install banner dismissed');
  };

  // Don't show banner if not Android or already installed
  if (!isAndroid || isInstalled || isStandalone) {
    return null;
  }

  return (
    <>
      {/* Enhanced Android Install Banner */}
      {showInstallBanner && (
        <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm shadow-xl md:left-auto md:right-4 md:max-w-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary p-2">
                  <Download className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">تثبيت التطبيق</CardTitle>
                  <CardDescription className="text-xs">
                    للحصول على أفضل تجربة استخدام
                  </CardDescription>
                </div>
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
          </CardHeader>
          <CardContent className="pt-0">
            {/* Features */}
            <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col items-center text-center text-muted-foreground">
                <Wifi className="h-3 w-3 mb-1" />
                <span>يعمل بدون إنترنت</span>
              </div>
              <div className="flex flex-col items-center text-center text-muted-foreground">
                <Zap className="h-3 w-3 mb-1" />
                <span>سرعة فائقة</span>
              </div>
              <div className="flex flex-col items-center text-center text-muted-foreground">
                <Shield className="h-3 w-3 mb-1" />
                <span>آمن ومحدث</span>
              </div>
            </div>
            
            {/* Install Button */}
            <div className="flex gap-2">
              <Button 
                onClick={handleInstallClick}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                size="sm"
              >
                <Download className="ml-2 h-4 w-4" />
                {deferredPrompt ? 'تثبيت الآن' : 'إرشادات التثبيت'}
              </Button>
              <Button 
                onClick={handleDismissInstall}
                size="sm"
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                لاحقاً
              </Button>
            </div>

            {/* Manual installation hint for Android */}
            {!deferredPrompt && (
              <div className="mt-3 rounded-lg bg-primary/5 p-2">
                <p className="text-xs text-primary font-medium">
                  للتثبيت اليدوي: اضغط على ⋮ ← "إضافة إلى الشاشة الرئيسية"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default AndroidPWASetup;