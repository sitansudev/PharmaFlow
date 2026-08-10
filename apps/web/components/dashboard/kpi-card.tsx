import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
}: KPICardProps) {
  return (
    <Card className="overflow-hidden border shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="min-w-0 truncate text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="truncate text-3xl font-bold tracking-tight">
          {value}
        </div>

        <p className="mt-2 truncate text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}