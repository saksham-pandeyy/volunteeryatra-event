import { useState, useMemo, useCallback } from "react";
import { useGetDashboardStatsQuery } from "../services";
import { getDateRangeLabel, getInitialRange } from "@/components/ui/date-range-picker";
import type { DateRangeValue } from "@/components/ui/date-range-picker";
import type { DashboardStats } from "@/common/types";

export function useDashboardStats() {
  const [dateRange, setDateRangeState] = useState<DateRangeValue>(() => getInitialRange("all"));

  const from = useMemo(() => dateRange.from.toISOString().split("T")[0], [dateRange.from]);
  const to = useMemo(() => dateRange.to.toISOString().split("T")[0], [dateRange.to]);

  const { data, isLoading, isFetching } = useGetDashboardStatsQuery({ from, to });

  const stats = useMemo(() => data ?? null, [data]);
  const loading = isLoading || isFetching;

  const dateRangeLabel = useMemo(() => getDateRangeLabel(dateRange), [dateRange]);

  const trend = useMemo(() => {
    if (!stats || stats.trend.length < 2) return null;
    const t = stats.trend[stats.trend.length - 1].count - stats.trend[stats.trend.length - 2].count;
    const intervalLabel = stats.trendInterval === "yearly" ? "this year" : stats.trendInterval === "daily" ? "today" : "this month";
    return {
      direction: t > 0 ? ("up" as const) : t < 0 ? ("down" as const) : ("neutral" as const),
      value: `${Math.abs(t)} ${stats.trendInterval === "daily" ? "today" : "in " + intervalLabel}`,
    };
  }, [stats]);

  const setDateRange = useCallback((value: DateRangeValue) => {
    setDateRangeState(value);
  }, []);

  return { stats, isLoading: loading, error: undefined, trend, dateRange, setDateRange, dateRangeLabel };
}
