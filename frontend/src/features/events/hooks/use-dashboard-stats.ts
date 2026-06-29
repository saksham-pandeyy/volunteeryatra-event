import { useState, useMemo } from "react";
import { useGetDashboardStatsQuery } from "../services";
import { getDateRangeLabel } from "@/components/ui";
import type { DateRangePreset, DashboardStats } from "@/common/types";

export function useDashboardStats() {
  const [dateRange, setDateRange] = useState<DateRangePreset>("all");
  const { data, isLoading, error } = useGetDashboardStatsQuery();
  const apiStats: DashboardStats | null = data?.success ? data.data : null;
  const stats = useMemo(() => apiStats, [apiStats]);
  const trend = useMemo(() => {
    if (!stats || stats.monthlyTrend.length < 2) return null;
    const t = stats.monthlyTrend[stats.monthlyTrend.length - 1].count - stats.monthlyTrend[stats.monthlyTrend.length - 2].count;
    return { direction: t > 0 ? "up" as const : t < 0 ? "down" as const : "neutral" as const, value: `${Math.abs(t)}` };
  }, [stats]);

  return { stats, isLoading, error, trend, dateRange, setDateRange, dateRangeLabel: getDateRangeLabel(dateRange) };
}
