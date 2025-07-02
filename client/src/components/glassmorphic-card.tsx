import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  floating?: boolean;
  hover?: boolean;
}

export function GlassmorphicCard({ 
  children, 
  className, 
  floating = false, 
  hover = false 
}: GlassmorphicCardProps) {
  return (
    <Card 
      className={cn(
        "glass-card",
        floating && "floating-panel",
        hover && "hover-glass",
        className
      )}
    >
      {children}
    </Card>
  );
}

interface GlassHeaderProps {
  title: string;
  description?: string;
  titleAr?: string;
  descriptionAr?: string;
  action?: React.ReactNode;
  className?: string;
}

export function GlassHeader({ 
  title, 
  description, 
  titleAr, 
  descriptionAr, 
  action,
  className 
}: GlassHeaderProps) {
  return (
    <CardHeader className={cn("flex flex-row items-center justify-between", className)}>
      <div>
        <CardTitle className="text-xl font-semibold text-charcoal-text">
          {titleAr || title}
        </CardTitle>
        {(descriptionAr || description) && (
          <CardDescription className="text-gray-600">
            {descriptionAr || description}
          </CardDescription>
        )}
      </div>
      {action && <div>{action}</div>}
    </CardHeader>
  );
}

export function GlassContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <CardContent className={className}>
      {children}
    </CardContent>
  );
}

export function GlassFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <CardFooter className={className}>
      {children}
    </CardFooter>
  );
}
