import React, { useState, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CalendarIcon,
  Plus,
  Minus,
  Upload,
  X,
  Check,
  AlertCircle,
  Info,
  Star,
  Image as ImageIcon,
  FileText,
  DollarSign,
  MapPin,
  Clock,
  Users,
  Building,
  Wrench,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatArabicDate, toArabicNumerals } from "@/lib/arabic-utils";
import { formatCurrency } from "@/lib/currency";

// Enhanced field types for construction management
export type EnhancedFieldType =
  | "text"
  | "textarea" 
  | "number"
  | "currency"
  | "percentage"
  | "email"
  | "tel"
  | "url"
  | "password"
  | "date"
  | "time"
  | "datetime"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "switch"
  | "slider"
  | "rating"
  | "file"
  | "image"
  | "location"
  | "array"
  | "object"
  | "conditional"
  | "stepwizard";

export interface EnhancedFormField {
  name: string;
  label: string;
  labelAr?: string;
  type: EnhancedFieldType;
  placeholder?: string;
  placeholderAr?: string;
  description?: string;
  descriptionAr?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  
  // Validation options
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: z.ZodType;
  
  // Field-specific options
  options?: Array<{
    value: string;
    label: string;
    labelAr?: string;
    description?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  
  // Conditional rendering
  showWhen?: {
    field: string;
    value: any;
    operator?: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  };
  
  // Array field configuration
  arrayConfig?: {
    minItems?: number;
    maxItems?: number;
    itemFields: EnhancedFormField[];
    addButtonText?: string;
    addButtonTextAr?: string;
  };
  
  // File upload configuration
  fileConfig?: {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    preview?: boolean;
  };
  
  // Currency configuration
  currencyConfig?: {
    currency?: "YER" | "USD" | "EUR";
    showExchange?: boolean;
  };
  
  // Location configuration
  locationConfig?: {
    enableGPS?: boolean;
    allowManualEntry?: boolean;
    defaultLocation?: { lat: number; lng: number };
  };
  
  // Styling
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  icon?: React.ReactNode;
  
  // Construction-specific enhancements
  constructionType?: "equipment" | "material" | "project" | "employee" | "financial";
  industryValidation?: {
    equipmentTypes?: string[];
    materialCategories?: string[];
    yemenLocations?: string[];
    constructionRoles?: string[];
  };
}

interface EnhancedFormProps {
  fields: EnhancedFormField[];
  schema: z.ZodSchema;
  onSubmit: (data: any) => Promise<void> | void;
  defaultValues?: Record<string, any>;
  title?: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  submitText?: string;
  submitTextAr?: string;
  isLoading?: boolean;
  className?: string;
  
  // Form behavior
  autoSave?: boolean;
  autoSaveInterval?: number;
  showProgress?: boolean;
  enableDrafts?: boolean;
  enableValidationOnChange?: boolean;
  
  // Multi-step configuration
  isMultiStep?: boolean;
  stepConfig?: {
    steps: Array<{
      title: string;
      titleAr?: string;
      description?: string;
      fields: string[];
    }>;
    showStepProgress?: boolean;
    allowStepJumping?: boolean;
  };
  
  // Callbacks
  onFieldChange?: (fieldName: string, value: any) => void;
  onStepChange?: (step: number) => void;
  onDraftSave?: (data: any) => void;
  onValidationError?: (errors: any) => void;
}

export function EnhancedFormBuilder({
  fields,
  schema,
  onSubmit,
  defaultValues = {},
  title,
  titleAr,
  description,
  descriptionAr,
  submitText = "Submit",
  submitTextAr = "إرسال",
  isLoading = false,
  className,
  autoSave = false,
  autoSaveInterval = 30000,
  showProgress = false,
  enableDrafts = false,
  enableValidationOnChange = false,
  isMultiStep = false,
  stepConfig,
  onFieldChange,
  onStepChange,
  onDraftSave,
  onValidationError,
}: EnhancedFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: enableValidationOnChange ? "onChange" : "onSubmit",
  });

  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave) return;
    
    const interval = setInterval(() => {
      const formData = form.getValues();
      onDraftSave?.(formData);
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 2000);
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, autoSaveInterval, form, onDraftSave]);

  // Watch for field changes
  React.useEffect(() => {
    if (!onFieldChange) return;
    
    const subscription = form.watch((value, { name }) => {
      if (name) {
        onFieldChange(name, value[name]);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, onFieldChange]);

  // Calculate form completion progress
  const calculateProgress = useCallback(() => {
    const allFields = fields.filter(field => !field.hidden);
    const filledFields = allFields.filter(field => {
      const value = form.getValues(field.name);
      return value !== undefined && value !== "" && value !== null;
    });
    return Math.round((filledFields.length / allFields.length) * 100);
  }, [fields, form]);

  // Check if field should be shown based on conditions
  const shouldShowField = useCallback((field: EnhancedFormField) => {
    if (field.hidden) return false;
    if (!field.showWhen) return true;
    
    const watchedValue = form.watch(field.showWhen.field);
    const { value, operator = "equals" } = field.showWhen;
    
    switch (operator) {
      case "equals":
        return watchedValue === value;
      case "not_equals":
        return watchedValue !== value;
      case "contains":
        return Array.isArray(watchedValue) ? watchedValue.includes(value) : false;
      case "greater_than":
        return Number(watchedValue) > Number(value);
      case "less_than":
        return Number(watchedValue) < Number(value);
      default:
        return true;
    }
  }, [form]);

  // File upload handler
  const handleFileUpload = (fieldName: string, files: FileList | null) => {
    if (!files) return;
    
    const field = fields.find(f => f.name === fieldName);
    const maxSize = field?.fileConfig?.maxSize || 10 * 1024 * 1024; // 10MB default
    
    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxSize) {
        form.setError(fieldName, {
          type: "manual",
          message: `حجم الملف كبير جداً. الحد الأقصى ${Math.round(maxSize / 1024 / 1024)} MB`
        });
        return false;
      }
      return true;
    });
    
    setUploadedFiles(prev => ({
      ...prev,
      [fieldName]: field?.fileConfig?.multiple ? validFiles : [validFiles[0]]
    }));
    
    form.setValue(fieldName, field?.fileConfig?.multiple ? validFiles : validFiles[0]);
  };

  // Render different field types
  const renderField = (field: EnhancedFormField) => {
    if (!shouldShowField(field)) return null;

    const commonProps = {
      disabled: field.disabled || isLoading,
      className: cn("glass-input", field.className),
    };

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
      case "url":
      case "password":
        return (
          <FormControl>
            <div className="relative">
              {field.icon && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {field.icon}
                </div>
              )}
              <Input
                type={field.type}
                placeholder={field.placeholderAr || field.placeholder}
                {...commonProps}
                className={cn(commonProps.className, field.icon && "pr-10")}
                {...form.register(field.name)}
              />
            </div>
          </FormControl>
        );

      case "textarea":
        return (
          <FormControl>
            <Textarea
              placeholder={field.placeholderAr || field.placeholder}
              {...commonProps}
              className={cn(commonProps.className, "resize-none min-h-[100px]")}
              {...form.register(field.name)}
            />
          </FormControl>
        );

      case "number":
        return (
          <FormControl>
            <Input
              type="number"
              placeholder={field.placeholderAr || field.placeholder}
              min={field.min}
              max={field.max}
              {...commonProps}
              {...form.register(field.name, { valueAsNumber: true })}
            />
          </FormControl>
        );

      case "currency":
        return (
          <FormControl>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                min={0}
                {...commonProps}
                className={cn(commonProps.className, "pr-10")}
                {...form.register(field.name, { valueAsNumber: true })}
              />
              {field.currencyConfig?.currency && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {field.currencyConfig.currency}
                </span>
              )}
            </div>
          </FormControl>
        );

      case "percentage":
        return (
          <FormControl>
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                min={0}
                max={100}
                {...commonProps}
                className={cn(commonProps.className, "pl-8")}
                {...form.register(field.name, { valueAsNumber: true })}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                %
              </span>
            </div>
          </FormControl>
        );

      case "date":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right font-normal glass-input",
                          !formField.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {formField.value ? (
                          formatArabicDate(new Date(formField.value))
                        ) : (
                          <span>{field.placeholderAr || "اختر التاريخ"}</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value ? new Date(formField.value) : undefined}
                      onSelect={(date) => formField.onChange(date?.toISOString().split('T')[0])}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        );

      case "select":
        return (
          <Select onValueChange={(value) => form.setValue(field.name, value)}>
            <FormControl>
              <SelectTrigger className="glass-input">
                <SelectValue placeholder={field.placeholderAr || field.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.labelAr || option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <div className="grid grid-cols-1 gap-2">
                  {field.options?.map((option) => (
                    <FormItem
                      key={option.value}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={formField.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValue = formField.value || [];
                            if (checked) {
                              formField.onChange([...currentValue, option.value]);
                            } else {
                              formField.onChange(
                                currentValue.filter((val: string) => val !== option.value)
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {option.labelAr || option.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
              </FormItem>
            )}
          />
        );

      case "radio":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                    className="flex flex-col space-y-1"
                  >
                    {field.options?.map((option) => (
                      <FormItem
                        key={option.value}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option.value} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.labelAr || option.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        );

      case "switch":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {field.labelAr || field.label}
                  </FormLabel>
                  {field.description && (
                    <FormDescription>
                      {field.descriptionAr || field.description}
                    </FormDescription>
                  )}
                </div>
                <FormControl>
                  <Switch
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      case "slider":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      min={field.min || 0}
                      max={field.max || 100}
                      step={1}
                      value={[formField.value || field.min || 0]}
                      onValueChange={(vals) => formField.onChange(vals[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{toArabicNumerals((field.min || 0).toString())}</span>
                      <span>{toArabicNumerals((formField.value || 0).toString())}</span>
                      <span>{toArabicNumerals((field.max || 100).toString())}</span>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        );

      case "rating":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => formField.onChange(rating)}
                        className={cn(
                          "text-2xl transition-colors",
                          rating <= (formField.value || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        )}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        );

      case "file":
      case "image":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormControl>
                  <div className="space-y-2">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => document.getElementById(`file-${field.name}`)?.click()}
                    >
                      <input
                        id={`file-${field.name}`}
                        type="file"
                        accept={field.fileConfig?.accept}
                        multiple={field.fileConfig?.multiple}
                        onChange={(e) => handleFileUpload(field.name, e.target.files)}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-2">
                        {field.type === "image" ? (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                        <p className="text-sm text-gray-600">
                          انقر لتحميل {field.type === "image" ? "صورة" : "ملف"}
                        </p>
                        {field.fileConfig?.maxSize && (
                          <p className="text-xs text-gray-500">
                            الحد الأقصى: {Math.round(field.fileConfig.maxSize / 1024 / 1024)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {uploadedFiles[field.name] && (
                      <div className="grid grid-cols-1 gap-2">
                        {uploadedFiles[field.name].map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
                          >
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm flex-1 truncate">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newFiles = uploadedFiles[field.name].filter((_, i) => i !== index);
                                setUploadedFiles(prev => ({
                                  ...prev,
                                  [field.name]: newFiles
                                }));
                                form.setValue(field.name, field.fileConfig?.multiple ? newFiles : null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        );

      case "array":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => {
              const { fields: arrayFields, append, remove } = useFieldArray({
                control: form.control,
                name: field.name,
              });

              return (
                <FormItem>
                  <div className="space-y-4">
                    {arrayFields.map((item, index) => (
                      <Card key={item.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-sm font-medium">
                            {field.labelAr || field.label} {toArabicNumerals((index + 1).toString())}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {field.arrayConfig?.itemFields.map((subField) => (
                            <FormField
                              key={`${field.name}.${index}.${subField.name}`}
                              control={form.control}
                              name={`${field.name}.${index}.${subField.name}`}
                              render={() => (
                                <FormItem>
                                  <FormLabel>
                                    {subField.labelAr || subField.label}
                                    {subField.required && (
                                      <span className="text-red-500 mr-1">*</span>
                                    )}
                                  </FormLabel>
                                  {renderField({...subField, name: `${field.name}.${index}.${subField.name}`})}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </Card>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({})}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      {field.arrayConfig?.addButtonTextAr || "إضافة عنصر"}
                    </Button>
                  </div>
                </FormItem>
              );
            }}
          />
        );

      default:
        return (
          <FormControl>
            <Input
              placeholder={field.placeholderAr || field.placeholder}
              {...commonProps}
              {...form.register(field.name)}
            />
          </FormControl>
        );
    }
  };

  // Multi-step navigation
  const nextStep = () => {
    if (stepConfig && currentStep < stepConfig.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      onStepChange?.(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      onStepChange?.(currentStep - 1);
    }
  };

  // Get fields for current step
  const getCurrentStepFields = () => {
    if (!isMultiStep || !stepConfig) return fields;
    
    const currentStepConfig = stepConfig.steps[currentStep];
    return fields.filter(field => 
      currentStepConfig.fields.includes(field.name)
    );
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      onValidationError?.(error);
    }
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Form Header */}
      {(title || titleAr) && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-primary">
            {titleAr || title}
          </h2>
          {(description || descriptionAr) && (
            <p className="text-gray-600">
              {descriptionAr || description}
            </p>
          )}
        </div>
      )}

      {/* Progress Indicator */}
      {showProgress && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">التقدم</span>
            <span className="text-sm text-gray-500">
              {toArabicNumerals(calculateProgress().toString())}%
            </span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </Card>
      )}

      {/* Multi-step Progress */}
      {isMultiStep && stepConfig && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            {stepConfig.steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  index === currentStep ? "text-primary font-medium" : "text-gray-500"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                    index === currentStep
                      ? "bg-primary text-white"
                      : index < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    toArabicNumerals((index + 1).toString())
                  )}
                </div>
                <span className="hidden md:inline">
                  {step.titleAr || step.title}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Auto-save indicator */}
      {autoSave && isDraftSaved && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            تم حفظ المسودة تلقائياً
          </AlertDescription>
        </Alert>
      )}

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {getCurrentStepFields().map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={() => (
                  <FormItem>
                    <FormLabel>
                      {field.labelAr || field.label}
                      {field.required && (
                        <span className="text-red-500 mr-1">*</span>
                      )}
                    </FormLabel>
                    {field.description && (
                      <FormDescription>
                        {field.descriptionAr || field.description}
                      </FormDescription>
                    )}
                    {renderField(field)}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6">
            {isMultiStep ? (
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    السابق
                  </Button>
                )}
                
                {currentStep < (stepConfig?.steps.length || 1) - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                  >
                    التالي
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-accent hover:bg-accent/90"
                  >
                    {isLoading ? "جاري الإرسال..." : (submitTextAr || submitText)}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex gap-2 mr-auto">
                {enableDrafts && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const formData = form.getValues();
                      onDraftSave?.(formData);
                      setIsDraftSaved(true);
                      setTimeout(() => setIsDraftSaved(false), 2000);
                    }}
                  >
                    حفظ كمسودة
                  </Button>
                )}
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-accent hover:bg-accent/90"
                >
                  {isLoading ? "جاري الإرسال..." : (submitTextAr || submitText)}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}