import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  variant?: "primary" | "secondary" | "default";
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  subtitle,
  variant = "default",
}: StatCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-sm font-medium mt-2",
                  trendUp ? "text-secondary" : "text-destructive"
                )}
              >
                {trend}
              </p>
            )}
          </div>
          <div
            className={cn(
              "p-3 rounded-xl",
              variant === "primary" && "bg-primary/10",
              variant === "secondary" && "bg-secondary/10",
              variant === "default" && "bg-accent"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6",
                variant === "primary" && "text-primary",
                variant === "secondary" && "text-secondary",
                variant === "default" && "text-accent-foreground"
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
