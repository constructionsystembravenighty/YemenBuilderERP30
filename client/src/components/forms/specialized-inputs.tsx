import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  User,
  Building,
  Wrench,
  Package,
  Truck,
  Phone,
  Mail,
  CreditCard,
  Percent,
  Calculator,
  Search,
  Check,
  ChevronDown,
  Star,
  Upload,
  X,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Camera,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { formatArabicDate, toArabicNumerals, formatArabicTime } from "@/lib/arabic-utils";

// Currency Input Component with Exchange Rate
interface CurrencyInputProps {
  value?: number;
  onChange: (value: number) => void;
  currency?: "YER" | "USD" | "EUR";
  onCurrencyChange?: (currency: "YER" | "USD" | "EUR") => void;
  showExchangeRate?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CurrencyInput({
  value = 0,
  onChange,
  currency = "YER",
  onCurrencyChange,
  showExchangeRate = false,
  placeholder = "0.00",
  disabled = false,
  className
}: CurrencyInputProps) {
  const [exchangeRates] = useState({
    YER: 1,
    USD: 1580,
    EUR: 1720,
  });

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange(newValue);
  };

  const convertAmount = (amount: number, from: string, to: string) => {
    if (from === to) return amount;
    const usdAmount = from === "USD" ? amount : amount / exchangeRates[from as keyof typeof exchangeRates];
    return to === "USD" ? usdAmount : usdAmount * exchangeRates[to as keyof typeof exchangeRates];
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex">
        <div className="relative flex-1">
          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="number"
            value={value || ""}
            onChange={handleValueChange}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-10 pl-20"
            step="0.01"
            min="0"
          />
        </div>
        
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger className="w-24 rounded-l-none border-l-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="YER">YER</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {showExchangeRate && value > 0 && currency !== "YER" && (
        <div className="mt-2 text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>بالريال اليمني:</span>
            <span className="font-medium">
              {formatCurrency(convertAmount(value, currency, "YER"))}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            سعر الصرف: 1 {currency} = {toArabicNumerals(exchangeRates[currency].toLocaleString())} YER
          </div>
        </div>
      )}
    </div>
  );
}

// Yemen Location Selector with GPS
interface LocationSelectorProps {
  value?: string;
  onChange: (location: string) => void;
  onCoordinatesChange?: (coords: { lat: number; lng: number }) => void;
  enableGPS?: boolean;
  placeholder?: string;
  className?: string;
}

export function LocationSelector({
  value = "",
  onChange,
  onCoordinatesChange,
  enableGPS = true,
  placeholder = "اختر الموقع",
  className
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const yemenGovernates = [
    { value: "صنعاء", label: "صنعاء - Sana'a", coords: { lat: 15.3694, lng: 44.1910 } },
    { value: "عدن", label: "عدن - Aden", coords: { lat: 12.7797, lng: 45.0367 } },
    { value: "تعز", label: "تعز - Taiz", coords: { lat: 13.5795, lng: 44.0205 } },
    { value: "الحديدة", label: "الحديدة - Hodeidah", coords: { lat: 14.7978, lng: 42.9545 } },
    { value: "إب", label: "إب - Ibb", coords: { lat: 13.9670, lng: 44.1839 } },
    { value: "ذمار", label: "ذمار - Dhamar", coords: { lat: 14.5426, lng: 44.4011 } },
    { value: "صعدة", label: "صعدة - Sa'dah", coords: { lat: 16.9402, lng: 43.7634 } },
    { value: "حجة", label: "حجة - Hajjah", coords: { lat: 15.6947, lng: 43.6063 } },
    { value: "المحويت", label: "المحويت - Al Mahwit", coords: { lat: 15.4706, lng: 43.5453 } },
    { value: "الضالع", label: "الضالع - Al Dhale", coords: { lat: 13.6961, lng: 44.7314 } },
    { value: "لحج", label: "لحج - Lahij", coords: { lat: 13.0577, lng: 44.8819 } },
    { value: "أبين", label: "أبين - Abyan", coords: { lat: 13.9594, lng: 45.3619 } },
    { value: "شبوة", label: "شبوة - Shabwah", coords: { lat: 14.5290, lng: 47.0017 } },
    { value: "المهرة", label: "المهرة - Al Mahrah", coords: { lat: 16.7031, lng: 51.8479 } },
    { value: "حضرموت", label: "حضرموت - Hadramout", coords: { lat: 15.9500, lng: 48.6167 } },
    { value: "الجوف", label: "الجوف - Al Jawf", coords: { lat: 16.2042, lng: 45.2499 } },
    { value: "مأرب", label: "مأرب - Marib", coords: { lat: 15.4694, lng: 45.3259 } },
    { value: "البيضاء", label: "البيضاء - Al Bayda", coords: { lat: 13.9848, lng: 45.5733 } },
    { value: "ريمة", label: "ريمة - Raymah", coords: { lat: 14.6065, lng: 43.9073 } },
    { value: "عمران", label: "عمران - Amran", coords: { lat: 15.6590, lng: 43.9441 } },
  ];

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("تحديد الموقع غير مدعوم في متصفحك");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Find nearest governate (simplified)
        const nearest = yemenGovernates.reduce((prev, curr) => {
          const prevDistance = Math.sqrt(
            Math.pow(prev.coords.lat - latitude, 2) + 
            Math.pow(prev.coords.lng - longitude, 2)
          );
          const currDistance = Math.sqrt(
            Math.pow(curr.coords.lat - latitude, 2) + 
            Math.pow(curr.coords.lng - longitude, 2)
          );
          return prevDistance < currDistance ? prev : curr;
        });
        
        onChange(nearest.value);
        onCoordinatesChange?.({ lat: latitude, lng: longitude });
        setGpsLoading(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("فشل في تحديد الموقع");
        setGpsLoading(false);
      }
    );
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between glass-input"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              {value || placeholder}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="البحث في المحافظات..." />
            {enableGPS && (
              <div className="p-2 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={gpsLoading}
                  className="w-full"
                >
                  {gpsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <MapPin className="h-4 w-4 ml-2" />
                  )}
                  تحديد موقعي الحالي
                </Button>
              </div>
            )}
            <CommandEmpty>لا توجد محافظة بهذا الاسم</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {yemenGovernates.map((governate) => (
                <CommandItem
                  key={governate.value}
                  onSelect={() => {
                    onChange(governate.value);
                    onCoordinatesChange?.(governate.coords);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      value === governate.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {governate.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Yemen Phone Number Input with Validation
interface PhoneInputProps {
  value?: string;
  onChange: (phone: string) => void;
  placeholder?: string;
  className?: string;
  showFormatting?: boolean;
}

export function PhoneInput({
  value = "",
  onChange,
  placeholder = "أدخل رقم الهاتف",
  className,
  showFormatting = true,
}: PhoneInputProps) {
  const [isValid, setIsValid] = useState(true);
  
  const yemenPhoneRegex = /^(\+967|00967|967)?[0-9]{8,9}$/;
  
  const formatPhone = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Add Yemen country code if missing
    if (digits.length === 8 || digits.length === 9) {
      return `+967 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    
    if (digits.startsWith('967')) {
      const localNumber = digits.slice(3);
      return `+967 ${localNumber.slice(0, 3)} ${localNumber.slice(3, 6)} ${localNumber.slice(6)}`;
    }
    
    return phone;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Validate
    const valid = yemenPhoneRegex.test(newValue.replace(/\s/g, ''));
    setIsValid(valid);
  };

  return (
    <div className={className}>
      <div className="relative">
        <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "pr-10",
            !isValid && value.length > 0 && "border-red-300 focus:border-red-500"
          )}
          dir="ltr"
        />
        {value && isValid && (
          <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
        )}
        {value && !isValid && (
          <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 h-4 w-4" />
        )}
      </div>
      
      {showFormatting && value && isValid && (
        <div className="mt-1 text-sm text-gray-600">
          النسق: {formatPhone(value)}
        </div>
      )}
      
      {value && !isValid && (
        <div className="mt-1 text-sm text-red-600">
          رقم الهاتف غير صحيح. يجب أن يبدأ بـ +967 أو 967
        </div>
      )}
    </div>
  );
}

// Equipment Serial Number Input with Generator
interface SerialNumberInputProps {
  value?: string;
  onChange: (serial: string) => void;
  equipmentType?: string;
  autoGenerate?: boolean;
  placeholder?: string;
  className?: string;
}

export function SerialNumberInput({
  value = "",
  onChange,
  equipmentType = "",
  autoGenerate = true,
  placeholder = "الرقم التسلسلي",
  className
}: SerialNumberInputProps) {
  const generateSerial = () => {
    const prefixes = {
      excavator: "EXC",
      crane: "CRN", 
      bulldozer: "BLD",
      mixer: "MXR",
      truck: "TRK",
      generator: "GEN",
      default: "EQP"
    };
    
    const prefix = prefixes[equipmentType as keyof typeof prefixes] || prefixes.default;
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return `${prefix}${year}${random}`;
  };

  const isValidSerial = (serial: string) => {
    return /^[A-Z0-9]{6,20}$/.test(serial);
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder={placeholder}
            className={cn(
              "font-mono",
              value && !isValidSerial(value) && "border-red-300"
            )}
          />
          {value && isValidSerial(value) && (
            <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
          )}
        </div>
        
        {autoGenerate && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange(generateSerial())}
            className="px-3"
          >
            <Calculator className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {value && !isValidSerial(value) && (
        <div className="mt-1 text-sm text-red-600">
          الرقم التسلسلي يجب أن يحتوي على أحرف وأرقام إنجليزية فقط (6-20 حرف)
        </div>
      )}
    </div>
  );
}

// Progress Tracker Input
interface ProgressTrackerProps {
  value?: number;
  onChange: (progress: number) => void;
  showMilestones?: boolean;
  milestones?: Array<{ value: number; label: string }>;
  className?: string;
}

export function ProgressTracker({
  value = 0,
  onChange,
  showMilestones = true,
  milestones = [
    { value: 25, label: "ربع العمل" },
    { value: 50, label: "نصف العمل" },
    { value: 75, label: "ثلاثة أرباع العمل" },
    { value: 100, label: "مكتمل" },
  ],
  className
}: ProgressTrackerProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>التقدم: {toArabicNumerals(value.toString())}%</span>
          <span className="text-gray-500">0% - 100%</span>
        </div>
        
        <Slider
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          max={100}
          step={1}
          className="w-full"
        />
        
        <Progress value={value} className="h-2" />
      </div>
      
      {showMilestones && (
        <div className="grid grid-cols-2 gap-2">
          {milestones.map((milestone) => (
            <Button
              key={milestone.value}
              type="button"
              variant={value >= milestone.value ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(milestone.value)}
              className="text-xs"
            >
              {milestone.value === 100 ? (
                <CheckCircle className="h-3 w-3 ml-1" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-current ml-1" />
              )}
              {milestone.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// File Upload with Preview
interface FileUploadProps {
  value?: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  showPreview?: boolean;
  uploadText?: string;
  className?: string;
}

export function FileUpload({
  value = [],
  onChange,
  accept = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  showPreview = true,
  uploadText = "انقر لتحميل الملفات أو اسحبها هنا",
  className
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`الملف ${file.name} كبير جداً. الحد الأقصى ${Math.round(maxSize / 1024 / 1024)} MB`);
        return false;
      }
      return true;
    });

    const totalFiles = [...value, ...validFiles];
    if (totalFiles.length > maxFiles) {
      alert(`لا يمكن تحميل أكثر من ${maxFiles} ملفات`);
      return;
    }

    onChange(totalFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
          className="hidden"
        />
        
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">{uploadText}</p>
        <p className="text-xs text-gray-500 mt-1">
          الحد الأقصى: {Math.round(maxSize / 1024 / 1024)} MB لكل ملف، {maxFiles} ملفات كحد أقصى
        </p>
      </div>

      {value.length > 0 && showPreview && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">الملفات المحملة:</h4>
          <div className="grid gap-2">
            {value.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded bg-gray-50"
              >
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Rating Input with Arabic Stars
interface RatingInputProps {
  value?: number;
  onChange: (rating: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  labels?: string[];
  className?: string;
}

export function RatingInput({
  value = 0,
  onChange,
  max = 5,
  size = "md",
  labels = ["ضعيف جداً", "ضعيف", "متوسط", "جيد", "ممتاز"],
  className
}: RatingInputProps) {
  const [hover, setHover] = useState(0);
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1">
        {[...Array(max)].map((_, index) => {
          const rating = index + 1;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange(rating)}
              onMouseEnter={() => setHover(rating)}
              onMouseLeave={() => setHover(0)}
              className={cn(
                "transition-colors",
                rating <= (hover || value)
                  ? "text-yellow-400"
                  : "text-gray-300"
              )}
            >
              <Star className={cn(sizeClasses[size], "fill-current")} />
            </button>
          );
        })}
      </div>
      
      {(hover || value) > 0 && labels[hover - 1 || value - 1] && (
        <p className="text-sm text-gray-600">
          {labels[hover - 1 || value - 1]}
        </p>
      )}
    </div>
  );
}

// Multi-Tag Input
interface TagInputProps {
  value?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "اكتب واضغط Enter لإضافة",
  suggestions = [],
  maxTags = 10,
  className
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
      onChange([...value, trimmedTag]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="glass-input"
        />
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-32 overflow-auto">
            <CardContent className="p-2">
              {filteredSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-right"
                  onClick={() => {
                    addTag(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        {value.length}/{maxTags} علامات
      </div>
    </div>
  );
}

// Components exported individually with export keyword above