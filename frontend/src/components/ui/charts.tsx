"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export type ChartType = "bar" | "line";

export interface TrendPoint {
  label: string;
  count: number;
}

export interface DistributionItem {
  name: string;
  value: number;
  color: string;
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--color-surface-elevated)",
    border: "1px solid var(--color-surface-border)",
    borderRadius: "var(--radius-md)",
    fontSize: "13px",
    color: "var(--color-foreground)",
  },
  itemStyle: { color: "var(--color-foreground)" },
  labelStyle: { color: "var(--color-muted)" },
};

interface TrendChartProps {
  data: TrendPoint[];
  chartType?: ChartType;
  interval?: "daily" | "monthly" | "yearly";
}

export function TrendChart({ data, chartType = "bar", interval = "monthly" }: TrendChartProps) {
  if (chartType === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--color-muted)" }}
            axisLine={false}
            tickLine={false}
            interval={interval === "daily" ? Math.max(Math.floor(data.length / 15), 0) : 0}
          />
          <YAxis tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} />
          <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: "var(--color-primary)", r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "var(--color-muted)" }}
          axisLine={false}
          tickLine={false}
          interval={interval === "daily" ? Math.max(Math.floor(data.length / 15), 0) : 0}
        />
        <YAxis tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="var(--color-primary)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EventTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: "var(--color-primary)", r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ParticipantPieChart({ data }: { data: DistributionItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Pie data={data} cx="50%" cy="50%" outerRadius={75} dataKey="value" stroke="none">
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ChartLegend({ data }: { data: DistributionItem[] }) {
  return (
    <div className="flex flex-wrap gap-4 pt-2">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-xs text-muted">{item.name}</span>
          <span className="text-xs font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
