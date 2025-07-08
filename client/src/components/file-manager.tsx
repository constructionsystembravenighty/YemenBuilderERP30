import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Folder, 
  Download, 
  Upload, 
  Trash2, 
  Search,
  FolderPlus,
  Smartphone,
  Archive,
  File
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  path: string;
  createdAt: string;
  mimeType?: string;
  isApk?: boolean;
}

interface FileManagerProps {
  className?: string;
}

export function FileManager({ className }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for file listing
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['/api/files', currentPath],
    queryFn: () => apiRequest(`/api/files?path=${encodeURIComponent(currentPath)}`),
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: (name: string) => apiRequest('/api/files/folder', {
      method: 'POST',
      body: JSON.stringify({ name, path: currentPath })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({ title: 'تم إنشاء المجلد بنجاح', description: 'Folder created successfully' });
    }
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({ title: 'تم رفع الملف بنجاح', description: 'File uploaded successfully' });
    }
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (filePath: string) => apiRequest('/api/files', {
      method: 'DELETE',
      body: JSON.stringify({ path: filePath })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({ title: 'تم حذف الملف بنجاح', description: 'File deleted successfully' });
    }
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return <Folder className="h-4 w-4 text-blue-500" />;
    if (file.isApk || file.name.endsWith('.apk')) return <Smartphone className="h-4 w-4 text-green-500" />;
    if (file.name.endsWith('.zip') || file.name.endsWith('.tar.gz')) return <Archive className="h-4 w-4 text-yellow-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPath);
    
    uploadFileMutation.mutate(formData);
  };

  const handleCreateFolder = () => {
    const name = prompt('اسم المجلد الجديد / Folder name:');
    if (name) {
      createFolderMutation.mutate(name);
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    setSelectedFiles([]);
  };

  const filteredFiles = files.filter((file: FileItem) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            مدير الملفات / File Manager
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateFolder}
              disabled={createFolderMutation.isPending}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              مجلد جديد
            </Button>
            <label>
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  رفع ملف
                </span>
              </Button>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadFileMutation.isPending}
              />
            </label>
          </div>
        </div>
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateToPath('/')}
            className="h-auto p-1"
          >
            الرئيسية / Root
          </Button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <span>/</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToPath('/' + breadcrumbs.slice(0, index + 1).join('/'))}
                className="h-auto p-1"
              >
                {crumb}
              </Button>
            </React.Fragment>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث في الملفات / Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            جاري التحميل / Loading...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد ملفات / No files found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file: FileItem) => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-accent/50 ${
                  selectedFiles.includes(file.id) ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles([...selectedFiles, file.id]);
                      } else {
                        setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                      }
                    }}
                    className="rounded"
                  />
                  
                  {getFileIcon(file)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{file.name}</span>
                      {file.isApk && (
                        <Badge variant="secondary" className="text-xs">
                          APK
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {file.type === 'file' ? formatFileSize(file.size) : 'Folder'} • {new Date(file.createdAt).toLocaleDateString('ar')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {file.type === 'folder' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToPath(file.path)}
                    >
                      فتح / Open
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={`/api/files/download?path=${encodeURIComponent(file.path)}`} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFileMutation.mutate(file.path)}
                    disabled={deleteFileMutation.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedFiles.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedFiles.length} ملف محدد / files selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedFiles.forEach(fileId => {
                      const file = files.find((f: FileItem) => f.id === fileId);
                      if (file) deleteFileMutation.mutate(file.path);
                    });
                    setSelectedFiles([]);
                  }}
                  disabled={deleteFileMutation.isPending}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  حذف المحدد
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}