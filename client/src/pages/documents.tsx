import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Upload,
  Download,
  Eye,
  Trash2,
  File,
  FileImage,
  FileSpreadsheet,
  FileCode,
  FolderOpen,
  Calendar,
  User,
  Tag,
  Share2,
  MoreVertical,
  CloudUpload,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "@/components/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { formatArabicDate } from "@/lib/arabic-utils";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents?companyId=1"],
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects?companyId=1"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        return response.json();
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setSelectedFiles([]);
      setUploadProgress(0);
      setIsUploadOpen(false);
      toast({
        title: "تم رفع الملفات بنجاح",
        description: "تم إضافة الملفات إلى النظام",
      });
    },
    onError: () => {
      setUploadProgress(0);
      toast({
        title: "خطأ في رفع الملفات",
        description: "حدث خطأ أثناء رفع الملفات",
        variant: "destructive",
      });
    },
  });

  const filteredDocuments = documents?.filter((document: any) => {
    const matchesSearch = document.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || document.type === typeFilter;
    const matchesProject = projectFilter === "all" || 
                          (projectFilter === "none" && !document.projectId) ||
                          document.projectId?.toString() === projectFilter;
    return matchesSearch && matchesType && matchesProject;
  });

  const getFileIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      pdf: FileText,
      doc: FileText,
      docx: FileText,
      xls: FileSpreadsheet,
      xlsx: FileSpreadsheet,
      csv: FileSpreadsheet,
      jpg: FileImage,
      jpeg: FileImage,
      png: FileImage,
      gif: FileImage,
      svg: FileImage,
      js: FileCode,
      ts: FileCode,
      html: FileCode,
      css: FileCode,
    };
    
    const Icon = iconMap[type] || File;
    return <Icon className="h-5 w-5" />;
  };

  const getFileIconColor = (type: string) => {
    const colorMap: Record<string, string> = {
      pdf: "text-red-500",
      doc: "text-blue-500",
      docx: "text-blue-500",
      xls: "text-green-500",
      xlsx: "text-green-500",
      csv: "text-green-500",
      jpg: "text-purple-500",
      jpeg: "text-purple-500",
      png: "text-purple-500",
      gif: "text-purple-500",
      svg: "text-purple-500",
      js: "text-yellow-500",
      ts: "text-blue-600",
      html: "text-orange-500",
      css: "text-pink-500",
    };
    
    return colorMap[type] || "text-gray-500";
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 بايت";
    
    const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('file', file);
    });
    formData.append('companyId', '1');
    formData.append('uploadedBy', '1');
    formData.append('name', selectedFiles[0].name);
    formData.append('nameAr', selectedFiles[0].name);

    uploadMutation.mutate(formData);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const downloadDocument = (document: any) => {
    // In a real implementation, this would download the file
    toast({
      title: "تحميل الملف",
      description: `جاري تحميل ${document.nameAr || document.name}`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const documentTypes = [...new Set(documents?.map((doc: any) => doc.type).filter(Boolean))];
  const recentDocuments = documents?.slice(0, 5) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">إدارة الوثائق</h1>
          <p className="text-gray-600">رفع وإدارة وثائق الشركة والمشاريع</p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white">
              <Upload className="h-4 w-4 ml-2" />
              رفع ملف
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>رفع ملفات جديدة</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* File Upload Area */}
              <div
                className="glass-card p-8 rounded-lg border-2 border-dashed border-gray-300 hover:border-accent transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <CloudUpload className="h-12 w-12 mx-auto mb-4 text-accent" />
                  <p className="text-charcoal-text font-medium mb-2">اسحب الملفات هنا أو انقر للتحديد</p>
                  <p className="text-sm text-gray-500">PDF, DOC, XLS, PNG, JPG - الحد الأقصى: 10MB لكل ملف</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-charcoal-text">الملفات المحددة</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="glass-card p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-reverse space-x-3">
                          <div className={`w-8 h-8 glass-card rounded-lg flex items-center justify-center ${getFileIconColor(file.name.split('.').pop() || '')}`}>
                            {getFileIcon(file.name.split('.').pop() || '')}
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-text text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Progress */}
              {uploadMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">جاري الرفع...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="progress-gradient" />
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-end space-x-reverse space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadOpen(false)}
                  disabled={uploadMutation.isPending}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploadMutation.isPending}
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 ml-2" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 ml-2" />
                      رفع الملفات
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي الوثائق</p>
              <p className="text-2xl font-bold text-primary">{documents?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">ملفات PDF</p>
              <p className="text-2xl font-bold text-red-500">
                {documents?.filter((doc: any) => doc.type === 'pdf').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">مستندات المشاريع</p>
              <p className="text-2xl font-bold text-accent">
                {documents?.filter((doc: any) => doc.projectId).length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent bg-opacity-20 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-accent" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">هذا الشهر</p>
              <p className="text-2xl font-bold text-secondary">
                {documents?.filter((doc: any) => {
                  const createdDate = new Date(doc.createdAt);
                  const thisMonth = new Date();
                  return createdDate.getMonth() === thisMonth.getMonth() && 
                         createdDate.getFullYear() === thisMonth.getFullYear();
                }).length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary bg-opacity-20 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="xl:col-span-2">
          <GlassmorphicCard floating>
            <GlassHeader
              title="Document Library"
              titleAr="مكتبة الوثائق"
              description="جميع وثائق الشركة"
            />
            
            <GlassContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الوثائق..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input pr-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="glass-input w-32">
                      <SelectValue placeholder="النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="glass-input w-32">
                      <SelectValue placeholder="المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المشاريع</SelectItem>
                      <SelectItem value="none">بدون مشروع</SelectItem>
                      {projects?.map((project: any) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.nameAr || project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" className="glass-input">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3">
                {filteredDocuments?.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">لا توجد وثائق</p>
                  </div>
                ) : (
                  filteredDocuments?.map((document: any) => (
                    <GlassmorphicCard key={document.id} hover className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-reverse space-x-3">
                          <div className={`w-10 h-10 glass-card rounded-lg flex items-center justify-center ${getFileIconColor(document.type)}`}>
                            {getFileIcon(document.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium text-charcoal-text">
                                {document.nameAr || document.name}
                              </h4>
                              <Badge className="bg-gray-100 text-gray-800">
                                {document.type.toUpperCase()}
                              </Badge>
                              {document.isPublic && (
                                <Badge className="bg-green-100 text-green-800">
                                  <Share2 className="h-3 w-3 ml-1" />
                                  عام
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>المرفق بواسطة: موظف</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatArabicDate(document.createdAt)}</span>
                              </div>
                              {document.size && (
                                <span>{formatFileSize(document.size)}</span>
                              )}
                              {document.projectId && (
                                <div className="flex items-center gap-1">
                                  <FolderOpen className="h-3 w-3" />
                                  <span>
                                    {projects?.find((p: any) => p.id === document.projectId)?.nameAr || 'مشروع'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-reverse space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadDocument(document)}
                            className="h-8 w-8 text-accent hover:text-accent/80"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 ml-2" />
                                معاينة
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="h-4 w-4 ml-2" />
                                مشاركة
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </GlassmorphicCard>
                  ))
                )}
              </div>
            </GlassContent>
          </GlassmorphicCard>
        </div>

        {/* Recent Documents & Analytics */}
        <div className="space-y-6">
          {/* Recent Documents */}
          <GlassmorphicCard floating className="p-6">
            <GlassHeader
              title="Recent Documents"
              titleAr="الوثائق الحديثة"
              description="آخر الملفات المرفوعة"
            />
            
            <GlassContent>
              <div className="space-y-3">
                {recentDocuments.map((document: any) => (
                  <div key={document.id} className="glass-card p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className={`w-8 h-8 glass-card rounded-lg flex items-center justify-center ${getFileIconColor(document.type)}`}>
                          {getFileIcon(document.type)}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-text text-sm">
                            {document.nameAr || document.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatArabicDate(document.createdAt, "relative")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadDocument(document)}
                        className="h-6 w-6 text-accent hover:text-accent/80"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassContent>
          </GlassmorphicCard>

          {/* File Type Distribution */}
          <GlassmorphicCard floating className="p-6">
            <GlassHeader
              title="File Types"
              titleAr="أنواع الملفات"
              description="توزيع أنواع الملفات"
            />
            
            <GlassContent>
              <div className="space-y-3">
                {documentTypes.map((type) => {
                  const count = documents?.filter((doc: any) => doc.type === type).length || 0;
                  const percentage = documents?.length ? (count / documents.length) * 100 : 0;
                  
                  return (
                    <div key={type} className="glass-card p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 ${getFileIconColor(type)}`}>
                            {getFileIcon(type)}
                          </div>
                          <span className="text-sm font-medium text-charcoal-text">
                            {type.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-primary">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassContent>
          </GlassmorphicCard>

          {/* Storage Usage */}
          <GlassmorphicCard floating className="p-6">
            <GlassHeader
              title="Storage Usage"
              titleAr="استخدام التخزين"
              description="المساحة المستخدمة"
            />
            
            <GlassContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatFileSize(
                      documents?.reduce((sum: number, doc: any) => sum + (doc.size || 0), 0) || 0
                    )}
                  </div>
                  <p className="text-sm text-gray-500">من 1 جيجابايت مستخدمة</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">التخزين المستخدم</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="progress-gradient" />
                </div>
                
                <div className="glass-card p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-charcoal-text">التخزين السحابي نشط</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">متصل</Badge>
                  </div>
                </div>
              </div>
            </GlassContent>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
}
