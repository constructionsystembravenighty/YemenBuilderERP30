import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Upload, 
  X, 
  Plus, 
  Minus, 
  Calendar,
  Clock,
  DollarSign,
  Percent,
  Hash,
  FileText,
  Image,
  Phone,
  Mail
} from 'lucide-react';

export interface FormFieldBase {
  name: string;
  label: string;
  labelAr?: string;
  placeholder?: string;
  placeholderAr?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  descriptionAr?: string;
}

export interface TextFieldConfig extends FormFieldBase {
  type: 'text' | 'email' | 'password' | 'url';
  maxLength?: number;
}

export interface NumberFieldConfig extends FormFieldBase {
  type: 'number' | 'currency' | 'percentage';
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export interface SelectFieldConfig extends FormFieldBase {
  type: 'select' | 'multiselect';
  options: Array<{
    value: string;
    label: string;
    labelAr?: string;
    disabled?: boolean;
  }>;
}

export interface DateFieldConfig extends FormFieldBase {
  type: 'date' | 'datetime';
  minDate?: Date;
  maxDate?: Date;
}

export interface FileFieldConfig extends FormFieldBase {
  type: 'file' | 'image' | 'document';
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
}

export interface SwitchFieldConfig extends FormFieldBase {
  type: 'switch';
}

export interface SliderFieldConfig extends FormFieldBase {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
  showValue?: boolean;
}

export type AdvancedFormField = 
  | TextFieldConfig 
  | NumberFieldConfig 
  | SelectFieldConfig 
  | DateFieldConfig 
  | FileFieldConfig 
  | SwitchFieldConfig 
  | SliderFieldConfig
  | (FormFieldBase & { type: 'textarea'; rows?: number; maxLength?: number; });

export interface FormSection {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  icon?: React.ReactNode;
  fields: AdvancedFormField[];
  collapsible?: boolean;
}

export interface AdvancedFormProps {
  sections: FormSection[];
  schema: z.ZodSchema;
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => void;
  onDraft?: (data: any) => void;
  submitText?: string;
  submitTextAr?: string;
  draftText?: string;
  draftTextAr?: string;
  isLoading?: boolean;
  multiStep?: boolean;
  showProgress?: boolean;
  autoSave?: boolean;
  className?: string;
}

interface FieldRendererProps {
  field: AdvancedFormField;
  control: any;
  errors: any;
  watch: any;
}

function FieldRenderer({ field, control, errors, watch }: FieldRendererProps) {
  const fieldError = errors[field.name];

  const getFieldIcon = () => {
    switch (field.type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'currency': return <DollarSign className="h-4 w-4" />;
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'number': return <Hash className="h-4 w-4" />;
      case 'date': case 'datetime': return <Calendar className="h-4 w-4" />;
      case 'file': case 'document': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'textarea': return <FileText className="h-4 w-4" />;
      default: return null;
    }
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'url':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <div className="relative">
                {getFieldIcon() && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {getFieldIcon()}
                  </div>
                )}
                <Input
                  {...fieldProps}
                  type={field.type}
                  placeholder={field.placeholderAr || field.placeholder}
                  disabled={field.disabled}
                  maxLength={field.type === 'text' || field.type === 'email' || field.type === 'password' || field.type === 'url' ? (field as TextFieldConfig).maxLength : undefined}
                  className={`${getFieldIcon() ? 'pr-10' : ''} ${fieldError ? 'border-red-500' : ''} text-right`}
                />
              </div>
            )}
          />
        );

      case 'textarea':
        const textareaField = field as FormFieldBase & { type: 'textarea'; rows?: number; maxLength?: number; };
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <Textarea
                {...fieldProps}
                placeholder={field.placeholderAr || field.placeholder}
                disabled={field.disabled}
                rows={textareaField.rows || 3}
                maxLength={textareaField.maxLength}
                className={`${fieldError ? 'border-red-500' : ''} text-right`}
              />
            )}
          />
        );

      case 'number':
      case 'currency':
      case 'percentage':
        const numberField = field as NumberFieldConfig;
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {getFieldIcon()}
                </div>
                <Input
                  {...fieldProps}
                  type="number"
                  placeholder={field.placeholderAr || field.placeholder}
                  disabled={field.disabled}
                  min={numberField.min}
                  max={numberField.max}
                  step={numberField.step}
                  className={`pr-10 ${fieldError ? 'border-red-500' : ''} text-right`}
                  onChange={(e) => fieldProps.onChange(parseFloat(e.target.value) || 0)}
                />
                {numberField.suffix && (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {numberField.suffix}
                  </div>
                )}
              </div>
            )}
          />
        );

      case 'select':
        const selectField = field as SelectFieldConfig;
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <Select value={fieldProps.value} onValueChange={fieldProps.onChange}>
                <SelectTrigger className={`${fieldError ? 'border-red-500' : ''} text-right`}>
                  <SelectValue placeholder={field.placeholderAr || field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {selectField.options.map((option) => (
                    <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                      {option.labelAr || option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'multiselect':
        const multiselectField = field as SelectFieldConfig;
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                  {(fieldProps.value || []).map((value: string) => {
                    const option = multiselectField.options.find(opt => opt.value === value);
                    return (
                      <Badge key={value} variant="secondary" className="flex items-center gap-1">
                        {option?.labelAr || option?.label}
                        <X 
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            const newValue = (fieldProps.value || []).filter((v: string) => v !== value);
                            fieldProps.onChange(newValue);
                          }}
                        />
                      </Badge>
                    );
                  })}
                </div>
                <Select 
                  value="" 
                  onValueChange={(value) => {
                    if (value && !(fieldProps.value || []).includes(value)) {
                      fieldProps.onChange([...(fieldProps.value || []), value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="إضافة خيار..." />
                  </SelectTrigger>
                  <SelectContent>
                    {multiselectField.options
                      .filter(option => !(fieldProps.value || []).includes(option.value))
                      .map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.labelAr || option.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        );

      case 'date':
      case 'datetime':
        const dateField = field as DateFieldConfig;
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...fieldProps}
                  type={field.type === 'datetime' ? 'datetime-local' : 'date'}
                  disabled={field.disabled}
                  min={dateField.minDate?.toISOString().split('T')[0]}
                  max={dateField.maxDate?.toISOString().split('T')[0]}
                  className={`pr-10 ${fieldError ? 'border-red-500' : ''}`}
                />
              </div>
            )}
          />
        );

      case 'switch':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={fieldProps.value}
                  onCheckedChange={fieldProps.onChange}
                  disabled={field.disabled}
                />
                <Label className="text-right">
                  {field.labelAr || field.label}
                </Label>
              </div>
            )}
          />
        );

      case 'slider':
        const sliderField = field as SliderFieldConfig;
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{sliderField.min}</span>
                  {sliderField.showValue && (
                    <Badge variant="outline">{fieldProps.value}</Badge>
                  )}
                  <span className="text-sm text-gray-600">{sliderField.max}</span>
                </div>
                <Slider
                  value={[fieldProps.value]}
                  onValueChange={(value) => fieldProps.onChange(value[0])}
                  max={sliderField.max}
                  min={sliderField.min}
                  step={sliderField.step || 1}
                  disabled={field.disabled}
                  className="w-full"
                />
              </div>
            )}
          />
        );

      case 'file':
      case 'image':
      case 'document':
        const fileField = field as FileFieldConfig;
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">انقر لرفع الملف</span> أو اسحب وأفلت
                      </p>
                      <p className="text-xs text-gray-500">
                        {fileField.accept || 'جميع أنواع الملفات'}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept={fileField.accept}
                      multiple={fileField.multiple}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        fieldProps.onChange(files);
                      }}
                    />
                  </label>
                </div>
                
                {fieldProps.value && fieldProps.value.length > 0 && (
                  <div className="space-y-2">
                    {Array.from(fieldProps.value).map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFiles = Array.from(fieldProps.value).filter((_: any, i: number) => i !== index);
                            fieldProps.onChange(newFiles);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-right font-medium">
        {field.labelAr || field.label}
        {field.required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      
      {renderField()}
      
      {field.description && (
        <p className="text-sm text-gray-600 text-right">
          {field.descriptionAr || field.description}
        </p>
      )}
      
      {fieldError && (
        <p className="text-sm text-red-600 text-right">
          {fieldError.message}
        </p>
      )}
    </div>
  );
}

export function AdvancedForm({
  sections,
  schema,
  defaultValues = {},
  onSubmit,
  onDraft,
  submitText = "Submit",
  submitTextAr = "إرسال",
  draftText = "Save Draft",
  draftTextAr = "حفظ مسودة",
  isLoading = false,
  multiStep = false,
  showProgress = false,
  autoSave = false,
  className = ''
}: AdvancedFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    getValues
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur'
  });

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const currentSection = multiStep ? sections[currentStep] : null;
  const sectionsToRender = multiStep ? [currentSection!] : sections;

  const isStepValid = (stepIndex: number) => {
    const section = sections[stepIndex];
    return section.fields.every(field => !errors[field.name]);
  };

  return (
    <div className={`advanced-form space-y-6 ${className}`}>
      {multiStep && showProgress && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              الخطوة {currentStep + 1} من {sections.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / sections.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {sectionsToRender.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader 
              className={section.collapsible ? 'cursor-pointer' : ''}
              onClick={() => section.collapsible && toggleSection(section.id)}
            >
              <CardTitle className="flex items-center justify-between text-right">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {section.titleAr || section.title}
                    </h3>
                    {section.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {section.descriptionAr || section.description}
                      </p>
                    )}
                  </div>
                </div>
                {section.collapsible && (
                  <div className="transform transition-transform">
                    {collapsedSections.has(section.id) ? '▼' : '▲'}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            
            {(!section.collapsible || !collapsedSections.has(section.id)) && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map((field) => (
                    <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <FieldRenderer
                        field={field}
                        control={control}
                        errors={errors}
                        watch={watch}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-4">
            {multiStep && currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                السابق
              </Button>
            )}
            
            {multiStep && currentStep < sections.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid(currentStep)}
              >
                التالي
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'جاري الإرسال...' : (submitTextAr || submitText)}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {onDraft && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onDraft(getValues())}
                disabled={!isDirty}
              >
                {draftTextAr || draftText}
              </Button>
            )}
            
            {autoSave && isDirty && (
              <span className="text-sm text-gray-500">
                حفظ تلقائي مفعل
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}