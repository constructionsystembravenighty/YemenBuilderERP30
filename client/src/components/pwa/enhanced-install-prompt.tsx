/**
 * Enhanced PWA Installation Component
 * Provides comprehensive installation experience across all platforms
 * with Arabic-first design and advanced offline capabilities
 */

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, Monitor, Wifi, WifiOff, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallPromptProps {
  onDismiss?: () => void;
}

export function EnhancedInstallPrompt({ onDismiss }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installMethod, setInstallMethod] = useState<'auto' | 'manual'>('auto');
  const { toast } = useToast();

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
      setInstallMethod('manual');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast({
        title: "تم تثبيت التطبيق بنجاح",
        description: "يمكنك الآن الوصول للتطبيق من الشاشة الرئيسية",
      });
    };

    // Listen for network changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        toast({
          title: "تم بدء التثبيت",
          description: "يتم تثبيت التطبيق الآن...",
        });
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        title: "فشل في التثبيت",
        description: "حدث خطأ أثناء تثبيت التطبيق",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const getInstallInstructions = () => {
    switch (platform) {
      case 'ios':
        return {
          title: "تثبيت التطبيق على iOS",
          steps: [
            "اضغط على زر المشاركة في Safari",
            "اختر 'إضافة إلى الشاشة الرئيسية'",
            "اضغط 'إضافة' لتأكيد التثبيت"
          ]
        };
      case 'android':
        return {
          title: "تثبيت التطبيق على Android",
          steps: [
            "اضغط على زر 'تثبيت' أدناه",
            "اختر 'تثبيت' في النافذة المنبثقة",
            "ستجد التطبيق في قائمة التطبيقات"
          ]
        };
      case 'desktop':
        return {
          title: "تثبيت التطبيق على الحاسوب",
          steps: [
            "اضغط على زر 'تثبيت' أدناه",
            "اختر 'تثبيت' في النافذة المنبثقة",
            "ستجد التطبيق في قائمة البرامج"
          ]
        };
      default:
        return {
          title: "تثبيت التطبيق",
          steps: ["اتبع التعليمات التي تظهر في المتصفح"]
        };
    }
  };

  const instructions = getInstallInstructions();

  if (isInstalled) {
    return null; // Don't show prompt if already installed
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios':
      case 'android':
        return <Smartphone className="h-8 w-8 text-primary" />;
      default:
        return <Monitor className="h-8 w-8 text-primary" />;
    }
  };

  const canInstall = deferredPrompt || platform === 'ios';

  return (
    <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPlatformIcon()}
            <div>
              <CardTitle className="text-lg">
                تثبيت منصة إدارة البناء
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                احصل على تجربة أفضل مع التطبيق المثبت
                {isOnline ? (
                  <Badge variant="secondary" className="gap-1">
                    <Wifi className="h-3 w-3" />
                    متصل
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <WifiOff className="h-3 w-3" />
                    غير متصل
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>يعمل بدون إنترنت</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>تشغيل أسرع</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>إشعارات فورية</span>
            </div>
          </div>

          {/* Installation method */}
          {installMethod === 'auto' && canInstall ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 gap-2"
                size="lg"
              >
                <Download className="h-4 w-4" />
                {isInstalling ? 'جاري التثبيت...' : 'تثبيت التطبيق'}
              </Button>
              {!isOnline && (
                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>سيتم التثبيت عند عودة الاتصال</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-medium">{instructions.title}</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                {instructions.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Additional features */}
          <div className="pt-3 border-t text-xs text-muted-foreground">
            <p>
              ✨ <strong>ميزات خاصة:</strong> مزامنة تلقائية للبيانات، وضع العمل الليلي، 
              ودعم كامل للغة العربية مع تخطيط RTL.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to manage PWA installation state
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return { canInstall, isInstalled };
}