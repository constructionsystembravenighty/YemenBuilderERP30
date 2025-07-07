/**
 * Sync Status Indicator Component
 * Shows real-time synchronization status, version info, and offline capabilities
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Info,
  Zap,
  Database,
  Globe
} from 'lucide-react';
import { syncEngine, SyncState, SyncConflict } from '../lib/sync-engine';
import { VersionManager } from '../lib/version-manager';

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export function SyncStatusIndicator({ showDetails = false, className = '' }: SyncStatusIndicatorProps) {
  const [syncState, setSyncState] = useState<SyncState>(syncEngine.getSyncState());
  const [versionInfo, setVersionInfo] = useState<any>(null);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Initialize version info
    setVersionInfo(VersionManager.getCurrentVersion());

    // Listen to sync state changes
    const handleSyncStateChange = (state: SyncState) => {
      setSyncState(state);
    };

    // Listen to sync conflicts
    const handleSyncConflict = (event: CustomEvent) => {
      setConflicts(prev => [...prev, event.detail]);
    };

    // Listen to app updates
    const handleAppUpdate = (event: CustomEvent) => {
      setVersionInfo(event.detail.latest);
    };

    syncEngine.addListener(handleSyncStateChange);
    window.addEventListener('syncConflict', handleSyncConflict as any);
    window.addEventListener('appUpdated', handleAppUpdate as any);

    // Load initial conflicts
    setConflicts(syncEngine.getConflicts());

    return () => {
      syncEngine.removeListener(handleSyncStateChange);
      window.removeEventListener('syncConflict', handleSyncConflict as any);
      window.removeEventListener('appUpdated', handleAppUpdate as any);
    };
  }, []);

  const getStatusIcon = () => {
    if (!syncState.isOnline) {
      return <WifiOff className="h-4 w-4 text-amber-500" />;
    }
    
    if (syncState.isSyncing) {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    
    if (syncState.errors.length > 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    
    if (conflicts.length > 0) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!syncState.isOnline) {
      return 'وضع عدم الاتصال';
    }
    
    if (syncState.isSyncing) {
      return 'جاري المزامنة...';
    }
    
    if (syncState.errors.length > 0) {
      return 'خطأ في المزامنة';
    }
    
    if (conflicts.length > 0) {
      return 'تعارض في البيانات';
    }
    
    return 'متزامن';
  };

  const getStatusColor = () => {
    if (!syncState.isOnline) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (syncState.isSyncing) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (syncState.errors.length > 0) return 'bg-red-50 text-red-700 border-red-200';
    if (conflicts.length > 0) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  const handleManualSync = async () => {
    if (syncState.isOnline && !syncState.isSyncing) {
      await syncEngine.triggerSync();
    }
  };

  const handleResolveConflict = async (conflictId: string, resolution: 'local' | 'server' | 'merge') => {
    await syncEngine.resolveConflict(conflictId, resolution);
    setConflicts(syncEngine.getConflicts());
  };

  if (!showDetails) {
    // Compact indicator for header/toolbar
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 px-2"
        >
          {getStatusIcon()}
          <span className="text-xs mr-2">{getStatusText()}</span>
        </Button>
        
        {isExpanded && (
          <Card className="absolute top-12 left-0 z-50 w-80 shadow-lg">
            <CardContent className="p-4">
              <SyncStatusIndicator showDetails={true} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Detailed status panel
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {syncState.isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-amber-500" />
          )}
          <span className="font-medium">
            {syncState.isOnline ? 'متصل' : 'غير متصل'}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSync}
          disabled={!syncState.isOnline || syncState.isSyncing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
          مزامنة
        </Button>
      </div>

      {/* Sync Progress */}
      {syncState.isSyncing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>تقدم المزامنة</span>
            <span>{syncState.syncProgress}%</span>
          </div>
          <Progress value={syncState.syncProgress} className="h-2" />
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{syncState.pendingActions}</div>
          <div className="text-xs text-gray-500">عمليات معلقة</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{conflicts.length}</div>
          <div className="text-xs text-gray-500">تعارضات</div>
        </div>
      </div>

      {/* Last Sync Time */}
      {syncState.lastSyncTime && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>آخر مزامنة: {new Date(syncState.lastSyncTime).toLocaleString('ar-YE')}</span>
        </div>
      )}

      {/* Version Information */}
      {versionInfo && (
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="font-medium">معلومات النسخة</span>
          </div>
          <div className="text-sm space-y-1">
            <div>النسخة: {VersionManager.getVersionString()}</div>
            <div className="text-gray-500">{VersionManager.getBuildInfo()}</div>
          </div>
        </div>
      )}

      {/* Sync Errors */}
      {syncState.errors.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="font-medium">أخطاء المزامنة</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {syncState.errors.slice(-3).map((error, index) => (
              <div key={error.id || index} className="text-sm p-2 bg-red-50 rounded border">
                <div className="font-medium text-red-700">{error.message}</div>
                <div className="text-red-500 text-xs">
                  {new Date(error.timestamp).toLocaleString('ar-YE')}
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncEngine.clearErrors()}
            className="w-full"
          >
            مسح الأخطاء
          </Button>
        </div>
      )}

      {/* Conflicts Resolution */}
      {conflicts.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="font-medium">تعارضات البيانات</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {conflicts.slice(0, 3).map((conflict) => (
              <div key={conflict.id} className="text-sm p-2 bg-orange-50 rounded border space-y-2">
                <div className="font-medium text-orange-700">
                  {conflict.entity}: {conflict.entityId}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveConflict(conflict.id, 'local')}
                    className="text-xs"
                  >
                    محلي
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveConflict(conflict.id, 'server')}
                    className="text-xs"
                  >
                    خادم
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveConflict(conflict.id, 'merge')}
                    className="text-xs"
                  >
                    دمج
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PWA Features */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-purple-500" />
          <span className="font-medium">المزايا المتقدمة</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Badge variant="secondary" className="justify-center">
            <Database className="h-3 w-3 mr-1" />
            قاعدة بيانات محلية
          </Badge>
          <Badge variant="secondary" className="justify-center">
            <Globe className="h-3 w-3 mr-1" />
            عمل بدون إنترنت
          </Badge>
          <Badge variant="secondary" className="justify-center">
            <RefreshCw className="h-3 w-3 mr-1" />
            مزامنة آلية
          </Badge>
        </div>
      </div>
    </div>
  );
}