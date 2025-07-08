import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function ServiceWorkerSetup() {
  const { toast } = useToast();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });

          console.log('SW: ServiceWorker registration successful:', registration);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast({
                    title: "تحديث متوفر",
                    description: "تم العثور على تحديث جديد للتطبيق",
                    action: (
                      <button
                        onClick={() => window.location.reload()}
                        className="px-3 py-1 bg-primary text-white rounded text-sm"
                      >
                        تحديث
                      </button>
                    )
                  });
                }
              });
            }
          });

        } catch (error) {
          console.warn('SW: Registration failed, continuing without offline support:', error);
          // App works fine without service worker
        }
      });
    }

    // Handle install prompt
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show install prompt after a delay
      setTimeout(() => {
        toast({
          title: "تثبيت التطبيق",
          description: "يمكنك تثبيت التطبيق على جهازك للوصول السريع",
          action: (
            <button
              onClick={async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  console.log(`User response to the install prompt: ${outcome}`);
                  deferredPrompt = null;
                }
              }}
              className="px-3 py-1 bg-primary text-white rounded text-sm"
            >
              تثبيت
            </button>
          )
        });
      }, 5000); // Show after 5 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle app installed
    window.addEventListener('appinstalled', () => {
      toast({
        title: "تم التثبيت بنجاح",
        description: "تم تثبيت التطبيق على جهازك بنجاح"
      });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  // Background sync setup
  useEffect(() => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register for background sync
        registration.sync.register('background-sync').catch((error) => {
          console.error('Background sync registration failed:', error);
        });
      });
    }
  }, []);

  return null;
}

// Offline status hook
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Push notification setup
export function usePushNotifications() {
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      // Request permission for notifications
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            toast({
              title: "تم تفعيل التنبيهات",
              description: "ستتلقى تنبيهات حول آخر التطورات في مشاريعك"
            });
          }
        });
      }
    }
  }, [toast]);

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          lang: 'ar',
          dir: 'rtl',
          ...options
        });
      });
    }
  };

  return { sendNotification };
}