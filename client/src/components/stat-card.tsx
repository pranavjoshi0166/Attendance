import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "success" | "danger";
  iconBgColor?: string;
}

export function StatCard({ title, value, icon: Icon, variant = "default", iconBgColor }: StatCardProps) {
  const bgColors = {
    default: "bg-primary/10",
    success: "bg-chart-1/10",
    danger: "bg-chart-2/10",
  };

  const iconColors = {
    default: "text-primary",
    success: "text-chart-1",
    danger: "text-chart-2",
  };

  return (
    <Card data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn("p-2 rounded-md", iconBgColor || bgColors[variant])}>
          <Icon className={cn("w-4 h-4", iconColors[variant])} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={`text-stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
