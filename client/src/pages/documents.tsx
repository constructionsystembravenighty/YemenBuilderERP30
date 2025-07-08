import { FileManager } from '@/components/file-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Smartphone, 
  Download, 
  Archive,
  HardDrive,
  FolderOpen
} from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة المستندات والملفات</h1>
          <p className="text-muted-foreground mt-2">
            Document & File Management
          </p>
        </div>
      </div>

      {/* APK Storage Info */}
      <Card className="glass-card border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Smartphone className="h-5 w-5" />
            مخزن ملفات APK / APK Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Archive className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">موقع APK</p>
                <p className="text-sm text-muted-foreground">/apk-builds/</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">تحميل مباشر</p>
                <p className="text-sm text-muted-foreground">Direct Download</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HardDrive className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">مساحة آمنة</p>
                <p className="text-sm text-muted-foreground">Secure Storage</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              📱 <strong>APK Files</strong>: All Android application files are automatically saved in the dedicated APK storage folder.
            </p>
            <p>
              🗂️ <strong>Organization</strong>: Files are organized with timestamps for easy version tracking and management.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File Manager */}
      <FileManager />

      {/* Storage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">إجمالي الملفات</p>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Smartphone className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">ملفات APK</p>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">APK Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FolderOpen className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">المجلدات</p>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Folders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HardDrive className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">المساحة المستخدمة</p>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Used Space</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            إجراءات سريعة / Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <p className="font-medium">تصفح APK</p>
                <p className="text-xs text-muted-foreground">Browse APK Files</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <p className="font-medium">تحميل أحدث APK</p>
                <p className="text-xs text-muted-foreground">Download Latest APK</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Archive className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="font-medium">أرشيف الإصدارات</p>
                <p className="text-xs text-muted-foreground">Version Archive</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <p className="font-medium">مستندات المشروع</p>
                <p className="text-xs text-muted-foreground">Project Documents</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}