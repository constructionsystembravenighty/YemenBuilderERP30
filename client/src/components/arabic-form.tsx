import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ArabicFormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "date" | "email" | "tel";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
}

interface ArabicFormProps {
  fields: ArabicFormField[];
  schema: z.ZodSchema;
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
  submitText?: string;
  isLoading?: boolean;
  className?: string;
}

export function ArabicForm({
  fields,
  schema,
  onSubmit,
  defaultValues = {},
  submitText = "إرسال",
  isLoading = false,
  className
}: ArabicFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const renderField = (field: ArabicFormField) => {
    switch (field.type) {
      case "textarea":
        return (
          <FormControl>
            <Textarea
              placeholder={field.placeholder}
              className="glass-input resize-none"
              {...form.register(field.name)}
            />
          </FormControl>
        );
      
      case "select":
        return (
          <Select 
            onValueChange={(value) => form.setValue(field.name, value)}
            defaultValue={form.getValues(field.name)}
          >
            <FormControl>
              <SelectTrigger className="glass-input">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "number":
        return (
          <FormControl>
            <Input
              type="number"
              placeholder={field.placeholder}
              className="glass-input"
              {...form.register(field.name, { valueAsNumber: true })}
            />
          </FormControl>
        );
      
      case "date":
        return (
          <FormControl>
            <Input
              type="date"
              className="glass-input"
              {...form.register(field.name)}
            />
          </FormControl>
        );
      
      default:
        return (
          <FormControl>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              className="glass-input"
              {...form.register(field.name)}
            />
          </FormControl>
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", className)}>
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-charcoal-text">
                  {field.label}
                  {field.required && <span className="text-destructive mr-1">*</span>}
                </FormLabel>
                {renderField(field)}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-accent hover:bg-accent/90 text-white font-medium"
        >
          {isLoading ? "جاري الإرسال..." : submitText}
        </Button>
      </form>
    </Form>
  );
}
