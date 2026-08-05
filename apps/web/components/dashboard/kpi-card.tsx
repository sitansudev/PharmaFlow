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
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">
          {title}
        </CardTitle>

        <Icon className="h-5 w-5 text-blue-600" />
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-bold">
          {value}
        </div>

        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}