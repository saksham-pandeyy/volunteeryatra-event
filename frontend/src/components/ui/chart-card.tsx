import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle } from "./card";

interface ChartCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, action, children, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <div className="h-64">{children}</div>
    </Card>
  );
}
