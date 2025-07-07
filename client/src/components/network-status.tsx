import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff, Database } from 'lucide-react';
import { networkManager, offlineAPI } from '@/lib/offline-api';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(networkManager.getStatus());
  const [syncStatus, setSyncStatus] = useState<{
    pendingActions: number;
    lastSync: string;
  }>({ pendingActions: 0, lastSync: 'Never' });
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleStatusChange = (online: boolean) => {
      setIsOnline(online);
      
      if (online) {
        toast({
          title: "متصل بالإنترنت",
          description: "تم استعادة الاتصال، سيتم مزامنة البيانات",
          duration: 3000,
        });
      } else {
        toast({
          title: "وضع عدم الاتصال",
          description: "العمل بالبيانات المحفوظة محلياً",
          duration: 3000,
        });
      }
    };

    networkManager.addListener(handleStatusChange);
    
    // Update sync status periodically
    const interval = setInterval(async () => {
      try {
        const status = await offlineAPI.getSyncStatus();
        setSyncStatus({
          pendingActions: status.pendingActions,
          lastSync: status.lastSync
        });
      } catch (error) {
        console.error('Failed to get sync status:', error);
      }
    }, 5000);

    return () => {
      networkManager.removeListener(handleStatusChange);
      clearInterval(interval);
    };
  }, [toast]);

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        variant: "destructive",
        title: "لا يوجد اتصال",
        description: "يجب الاتصال بالإنترنت للمزامنة",
      });
      return;
    }

    setIsSyncing(true);
    try {
      await offlineAPI.syncNow();
      const status = await offlineAPI.getSyncStatus();
      setSyncStatus({
        pendingActions: status.pendingActions,
        lastSync: status.lastSync
      });
      
      toast({
        title: "تمت المزامنة بنجاح",
        description: "تم تحديث جميع البيانات",
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        variant: "destructive",
        title: "فشلت المزامنة",
        description: "حدث خطأ أثناء مزامنة البيانات",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const StatusIcon = isOnline ? Wifi : WifiOff;
  const CloudIcon = isOnline ? Cloud : CloudOff;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 text-sm">
        {/* Network Status Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border cursor-pointer ${
                isOnline 
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700" 
                  : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700"
              }`}
            >
              <StatusIcon className="h-3 w-3" />
              <span>
                {isOnline ? "متصل" : "غير متصل"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-center">
            <div className="space-y-1">
              <p className="font-medium">
                {isOnline ? "متصل بالإنترنت" : "وضع عدم الاتصال"}
              </p>
              <p className="text-xs">
                {isOnline 
                  ? "البيانات متزامنة مع الخادم" 
                  : "العمل بالبيانات المحفوظة محلياً"
                }
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Local Storage Indicator */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 cursor-pointer">
              <Database className="h-3 w-3" />
              <span>محلي</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>البيانات محفوظة محلياً</p>
            <p className="text-xs">يعمل بدون إنترنت</p>
          </TooltipContent>
        </Tooltip>

        {/* Sync Status */}
        {syncStatus.pendingActions > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 cursor-pointer">
                <CloudIcon className="h-3 w-3" />
                <span>{syncStatus.pendingActions}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{syncStatus.pendingActions} تغيير في انتظار المزامنة</p>
              <p className="text-xs">
                آخر مزامنة: {
                  syncStatus.lastSync === 'Never' 
                    ? 'لم تتم' 
                    : new Date(syncStatus.lastSync).toLocaleDateString('ar')
                }
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Sync Button */}
        {isOnline && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSync}
                disabled={isSyncing}
                className="h-6 w-6 p-0"
              >
                <RefreshCw 
                  className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} 
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>مزامنة البيانات</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Offline Mode Banner
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(networkManager.getStatus());

  useEffect(() => {
    const handleStatusChange = (online: boolean) => setIsOnline(online);
    networkManager.addListener(handleStatusChange);
    return () => networkManager.removeListener(handleStatusChange);
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 border-b">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-yellow-800 dark:text-yellow-200">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            وضع عدم الاتصال - جميع البيانات محفوظة محلياً وستتم المزامنة عند العودة للإنترنت
          </span>
        </div>
      </div>
    </div>
  );
}

// Hook for components to use network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(networkManager.getStatus());

  useEffect(() => {
    const handleStatusChange = (online: boolean) => setIsOnline(online);
    networkManager.addListener(handleStatusChange);
    return () => networkManager.removeListener(handleStatusChange);
  }, []);

  return isOnline;
}