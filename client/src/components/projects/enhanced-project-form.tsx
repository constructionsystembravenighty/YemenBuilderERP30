import { useState, useEffect } from 'react';
import { Plus, Save, Calculator, MapPin, Calendar, Users, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/arabic-utils';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const projectFormSchema = z.object({
  name: z.string().min(1, 'اسم المشروع مطلوب'),
  nameAr: z.string().min(1, 'الاسم باللغة العربية مطلوب'),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  projectType: z.enum(['residential', 'commercial', 'infrastructure', 'industrial']),
  status: z.enum(['planning', 'active', 'on_hold', 'completed']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  budget: z.number().min(1, 'الميزانية مطلوبة'),
  currency: z.enum(['YER', 'USD']).default('YER'),
  location: z.string().min(1, 'الموقع مطلوب'),
  locationAr: z.string().min(1, 'الموقع باللغة العربية مطلوب'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  area: z.number().min(1, 'المساحة مطلوبة'),
  complexity: z.enum(['simple', 'medium', 'complex']).default('medium'),
  specifications: z.array(z.string()).default([]),
  managerId: z.number().optional(),
  companyId: z.number()
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface EnhancedProjectFormProps {
  onClose: () => void;
  projectId?: number;
  isEdit?: boolean;
}

export function EnhancedProjectForm({ onClose, projectId, isEdit = false }: EnhancedProjectFormProps) {
  const [currentTab, setCurrentTab] = useState('basic');
  const [costEstimate, setCostEstimate] = useState<any>(null);
  const [isCalculatingCost, setIsCalculatingCost] = useState(false);
  const [selectedSpecifications, setSelectedSpecifications] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectType: 'residential',
      status: 'planning',
      priority: 'medium',
      currency: 'YER',
      complexity: 'medium',
      specifications: [],
      companyId: 1 // Default company
    }
  });

  // Fetch existing project data if editing
  const { data: existingProject } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: isEdit && !!projectId
  });

  // Fetch users for manager selection
  const { data: users } = useQuery({ queryKey: ['/api/users'] });

  // Create/Update project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectFormData) => 
      isEdit 
        ? apiRequest(`/api/projects/${projectId}`, { method: 'PUT', body: data })
        : apiRequest('/api/projects', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      onClose();
    }
  });

  // Cost estimation mutation
  const costEstimationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/intelligence/cost-estimation', { method: 'POST', body: data }),
    onSuccess: (data) => {
      setCostEstimate(data);
      form.setValue('budget', data.estimatedCost);
    }
  });

  useEffect(() => {
    if (existingProject && isEdit) {
      form.reset({
        ...existingProject,
        startDate: existingProject.startDate ? new Date(existingProject.startDate) : undefined,
        endDate: existingProject.endDate ? new Date(existingProject.endDate) : undefined
      });
      setSelectedSpecifications(existingProject.specifications || []);
    }
  }, [existingProject, isEdit, form]);

  const projectTypes = [
    { value: 'residential', label: 'Residential', labelAr: 'سكني' },
    { value: 'commercial', label: 'Commercial', labelAr: 'تجاري' },
    { value: 'infrastructure', label: 'Infrastructure', labelAr: 'بنية تحتية' },
    { value: 'industrial', label: 'Industrial', labelAr: 'صناعي' }
  ];

  const complexityLevels = [
    { value: 'simple', label: 'Simple', labelAr: 'بسيط' },
    { value: 'medium', label: 'Medium', labelAr: 'متوسط' },
    { value: 'complex', label: 'Complex', labelAr: 'معقد' }
  ];

  const statusOptions = [
    { value: 'planning', label: 'Planning', labelAr: 'قيد التخطيط' },
    { value: 'active', label: 'Active', labelAr: 'نشط' },
    { value: 'on_hold', label: 'On Hold', labelAr: 'معلق' },
    { value: 'completed', label: 'Completed', labelAr: 'مكتمل' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', labelAr: 'منخفض' },
    { value: 'medium', label: 'Medium', labelAr: 'متوسط' },
    { value: 'high', label: 'High', labelAr: 'عالي' },
    { value: 'critical', label: 'Critical', labelAr: 'حرج' }
  ];

  const specificationOptions = [
    'high_quality_materials', 'earthquake_resistant', 'energy_efficient',
    'smart_building', 'solar_panels', 'modern_design', 'traditional_design',
    'garden_landscaping', 'parking_garage', 'basement', 'elevator',
    'central_air_conditioning', 'security_system', 'fire_safety'
  ];

  const calculateEstimatedCost = async () => {
    const formData = form.getValues();
    if (!formData.projectType || !formData.area || !formData.location) {
      return;
    }

    setIsCalculatingCost(true);
    try {
      await costEstimationMutation.mutateAsync({
        projectType: formData.projectType,
        area: formData.area,
        location: formData.location,
        complexity: formData.complexity,
        specifications: selectedSpecifications
      });
    } finally {
      setIsCalculatingCost(false);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    const submitData = {
      ...data,
      specifications: selectedSpecifications
    };
    await createProjectMutation.mutateAsync(submitData);
  };

  const toggleSpecification = (spec: string) => {
    setSelectedSpecifications(prev => 
      prev.includes(spec) 
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const getSpecificationLabel = (spec: string) => {
    const labels: Record<string, string> = {
      high_quality_materials: 'مواد عالية الجودة',
      earthquake_resistant: 'مقاوم للزلازل',
      energy_efficient: 'موفر للطاقة',
      smart_building: 'مبنى ذكي',
      solar_panels: 'ألواح شمسية',
      modern_design: 'تصميم عصري',
      traditional_design: 'تصميم تقليدي',
      garden_landscaping: 'تنسيق حدائق',
      parking_garage: 'مرآب سيارات',
      basement: 'قبو',
      elevator: 'مصعد',
      central_air_conditioning: 'تكييف مركزي',
      security_system: 'نظام أمان',
      fire_safety: 'أنظمة الإطفاء'
    };
    return labels[spec] || spec;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {isEdit ? 'تعديل المشروع' : 'إنشاء مشروع جديد'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">معلومات أساسية</TabsTrigger>
                  <TabsTrigger value="details">التفاصيل</TabsTrigger>
                  <TabsTrigger value="specifications">المواصفات</TabsTrigger>
                  <TabsTrigger value="cost">التكلفة</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المشروع</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل اسم المشروع" dir="rtl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name (English)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter project name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع المشروع</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع المشروع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projectTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.labelAr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الأولوية</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الأولوية" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorityOptions.map(priority => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  {priority.labelAr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="locationAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الموقع</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل موقع المشروع" dir="rtl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المساحة (متر مربع)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                              placeholder="أدخل المساحة" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف المشروع</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="أدخل وصف المشروع" dir="rtl" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حالة المشروع</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.labelAr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="complexity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مستوى التعقيد</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر مستوى التعقيد" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {complexityLevels.map(complexity => (
                                <SelectItem key={complexity.value} value={complexity.value}>
                                  {complexity.labelAr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ البداية</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className="w-full justify-start text-right">
                                  <Calendar className="ml-2 h-4 w-4" />
                                  {field.value ? formatDate(field.value) : "اختر التاريخ"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ النهاية المتوقع</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className="w-full justify-start text-right">
                                  <Calendar className="ml-2 h-4 w-4" />
                                  {field.value ? formatDate(field.value) : "اختر التاريخ"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {users && (
                    <FormField
                      control={form.control}
                      name="managerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مدير المشروع</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر مدير المشروع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map((user: any) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.nameAr} - {user.role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>

                <TabsContent value="specifications" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold">مواصفات إضافية</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {specificationOptions.map(spec => (
                        <div key={spec} className="flex items-center space-x-2">
                          <Checkbox
                            id={spec}
                            checked={selectedSpecifications.includes(spec)}
                            onCheckedChange={() => toggleSpecification(spec)}
                          />
                          <label htmlFor={spec} className="text-sm cursor-pointer">
                            {getSpecificationLabel(spec)}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    {selectedSpecifications.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">المواصفات المختارة:</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedSpecifications.map(spec => (
                            <Badge key={spec} variant="secondary">
                              {getSpecificationLabel(spec)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="cost" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">تقدير التكلفة</h4>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={calculateEstimatedCost}
                        disabled={isCalculatingCost}
                        className="flex items-center gap-2"
                      >
                        <Calculator className="h-4 w-4" />
                        {isCalculatingCost ? 'جاري الحساب...' : 'احسب التكلفة'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الميزانية</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(Number(e.target.value))}
                                placeholder="أدخل الميزانية" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>العملة</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر العملة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="YER">ريال يمني (YER)</SelectItem>
                                <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {costEstimate && (
                      <Card className="p-4 bg-muted/50">
                        <h5 className="font-semibold mb-3">تقدير التكلفة التلقائي</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>التكلفة الإجمالية:</span>
                            <span className="font-semibold">{formatCurrency(costEstimate.estimatedCost)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span>المواد:</span>
                            <span>{formatCurrency(costEstimate.breakdown.materials)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>العمالة:</span>
                            <span>{formatCurrency(costEstimate.breakdown.labor)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>المعدات:</span>
                            <span>{formatCurrency(costEstimate.breakdown.equipment)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>المصاريف العامة:</span>
                            <span>{formatCurrency(costEstimate.breakdown.overhead)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span>مستوى الثقة:</span>
                            <Badge variant={costEstimate.confidence > 0.8 ? 'default' : 'secondary'}>
                              {Math.round(costEstimate.confidence * 100)}%
                            </Badge>
                          </div>
                          {costEstimate.timeline && (
                            <div className="flex justify-between">
                              <span>المدة المتوقعة:</span>
                              <span>{costEstimate.timeline} يوم</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProjectMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {createProjectMutation.isPending ? 'جاري الحفظ...' : (isEdit ? 'تحديث' : 'إنشاء المشروع')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}