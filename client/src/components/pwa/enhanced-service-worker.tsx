import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function EnhancedServiceWorker() {
  const { toast } = useToast();

  useEffect(() => {
    // Enhanced service worker registration with better error handling
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          console.log('SW: Starting enhanced service worker registration');
          
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none' // Always check for updates
          });

          console.log('SW: Registration successful with scope:', registration.scope);

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('SW: New service worker found');

            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                console.log('SW: State changed to:', newWorker.state);
                
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('SW: New version available');
                    // New version available
                    toast({
                      title: "تحديث متوفر",
                      description: "تم العثور على تحديث جديد للتطبيق",
                      action: (
                        <button
                          onClick={() => {
                            newWorker.postMessage({ action: 'skipWaiting' });
                            window.location.reload();
                          }}
                          className="px-3 py-1 bg-primary text-white rounded text-sm"
                        >
                          تحديث الآن
                        </button>
                      ),
                      duration: 10000,
                    });
                  } else {
                    console.log('SW: App ready for offline use');
                    toast({
                      title: "التطبيق جاهز للعمل بدون إنترنت",
                      description: "تم تخزين الملفات للاستخدام بدون اتصال",
                    });
                  }
                }
              });
            }
          });

          // Check for waiting service worker
          if (registration.waiting) {
            console.log('SW: Service worker waiting');
            toast({
              title: "تحديث في انتظار التطبيق",
              description: "أعد تشغيل التطبيق لتطبيق التحديث",
              action: (
                <button
                  onClick={() => {
                    registration.waiting?.postMessage({ action: 'skipWaiting' });
                    window.location.reload();
                  }}
                  className="px-3 py-1 bg-primary text-white rounded text-sm"
                >
                  إعادة التشغيل
                </button>
              ),
              duration: 10000,
            });
          }

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('SW: Message received:', event.data);
            
            if (event.data && event.data.type === 'CACHE_UPDATED') {
              toast({
                title: "تم تحديث البيانات",
                description: "تم تحديث بيانات التطبيق في الخلفية",
              });
            }

            if (event.data && event.data.type === 'OFFLINE_READY') {
              toast({
                title: "جاهز للعمل بدون إنترنت",
                description: "يمكن استخدام التطبيق بدون اتصال بالإنترنت",
              });
            }
          });

          // Periodic sync check (every 24 hours)
          setInterval(async () => {
            try {
              const updatedRegistration = await registration.update();
              console.log('SW: Periodic update check completed');
            } catch (error) {
              console.log('SW: Periodic update check failed:', error);
            }
          }, 24 * 60 * 60 * 1000);

        } catch (error) {
          console.error('SW: Registration failed:', error);
          
          // Don't show error toast for service worker registration failures
          // as they're not critical for app functionality
        }
      };

      // Register service worker when page loads
      if (document.readyState === 'loading') {
        window.addEventListener('load', registerServiceWorker);
      } else {
        registerServiceWorker();
      }

      // Handle service worker controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('SW: Controller changed');
        window.location.reload();
      });

    } else {
      console.log('SW: Service workers not supported');
    }

    // Network status monitoring
    const handleOnline = () => {
      console.log('Network: Online');
      toast({
        title: "تم استعادة الاتصال",
        description: "تم إعادة الاتصال بالإنترنت",
      });
    };

    const handleOffline = () => {
      console.log('Network: Offline');
      toast({
        title: "لا يوجد اتصال بالإنترنت",
        description: "التطبيق يعمل الآن في وضع عدم الاتصال",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return null; // This component doesn't render anything
}

export default EnhancedServiceWorker;