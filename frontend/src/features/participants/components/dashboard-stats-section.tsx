"use client";

import { BentoGrid, BentoCard, StatsCard, StatsGrid, SkeletonStatCard, SkeletonChart, SkeletonPieChart } from "@/components/ui";
import { TrendChart, ParticipantPieChart, ChartLegend } from "@/components/ui";
import type { ChartType } from "@/components/ui/charts";
import type { DashboardStats } from "@/common/types";
import { Calendar, Users, TrendingUp, BarChart3, Activity, Inbox, BarChart, LineChart } from "lucide-react";

interface StatsSectionProps {
  stats: DashboardStats | null;
  dateRangeLabel: string;
  trend: { direction: "up" | "down" | "neutral"; value: string } | null;
  isLoading: boolean;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}

function ChartEmptyState({ message, description }: { message: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8">
      <div className="h-10 w-10 rounded-xl bg-base-200/50 flex items-center justify-center mb-3">
        <Inbox size={20} className="text-base-400" />
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      {description && (
        <p className="text-xs text-muted mt-1 max-w-[200px]">{description}</p>
      )}
    </div>
  );
}

export function DashboardStatsSection({ stats, dateRangeLabel, trend, isLoading, chartType, onChartTypeChange }: StatsSectionProps) {
  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <StatsGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </StatsGrid>
        <BentoGrid>
          <BentoCard span={3} title="Monthly Trend"><SkeletonChart /></BentoCard>
          <BentoCard span={3} title="Event Status"><SkeletonPieChart /></BentoCard>
        </BentoGrid>
      </div>
    );
  }

  const completionRate = stats.totalEvents > 0
    ? Math.round((stats.byStatus.completed / stats.totalEvents) * 100)
    : 0;

  const backlogs = stats.byStatus.backlog;
  const inProgress = stats.byStatus.in_progress;
  const completed = stats.byStatus.completed;
  const hasEventData = stats.totalEvents > 0;
  const hasMonthlyData = stats.trend.some((m) => m.count > 0);
  const hasStatusData = backlogs > 0 || inProgress > 0 || completed > 0;

  // Build trend label dynamically from the date range
  const trendLabel = dateRangeLabel !== "All time"
    ? `${trend?.value || "0"} in period`
    : `${trend?.value || "0"} this month`;

  return (
    <div className="space-y-6">
      <StatsGrid>
        <StatsCard
          title="Total Events"
          value={hasEventData ? stats.totalEvents : 0}
          trend={trend && hasEventData ? { direction: trend.direction, value: trendLabel } : undefined}
          isPositive={trend ? trend.direction === "up" : true}
          icon={Calendar}
        />
        <StatsCard
          title="Upcoming Events"
          value={hasEventData ? stats.totalUpcoming : 0}
          description={dateRangeLabel}
          icon={Activity}
        />
        <StatsCard
          title="Total Participants"
          value={stats.totalParticipants}
          description={`${stats.pendingParticipants} pending approval`}
          icon={Users}
        />
        <StatsCard
          title="Completion Rate"
          value={hasEventData ? `${completionRate}%` : "—"}
          description={hasEventData ? `${completed} of ${stats.totalEvents} events done` : "No events in range"}
          icon={BarChart3}
          isPositive={completionRate >= 50}
          trend={hasEventData ? { direction: completionRate >= 50 ? "up" : "down", value: `${completionRate}%` } : undefined}
        />
      </StatsGrid>

      <BentoGrid>
        <BentoCard span={3} title="Event Trend" icon={TrendingUp}
          action={
            <div className="flex items-center bg-surface-hover/50 rounded-lg p-0.5 border border-surface-border">
              <button
                type="button"
                onClick={() => onChartTypeChange("bar")}
                className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 ${
                  chartType === "bar"
                    ? "bg-surface shadow-sm text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
                title="Bar chart"
              >
                <BarChart size={14} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => onChartTypeChange("line")}
                className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 ${
                  chartType === "line"
                    ? "bg-surface shadow-sm text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
                title="Line chart"
              >
                <LineChart size={14} strokeWidth={2} />
              </button>
            </div>
          }
        >
          <div className="h-52">
            {hasMonthlyData ? (
              <TrendChart data={stats.trend} chartType={chartType} interval={stats.trendInterval} />
            ) : (
              <ChartEmptyState
                message="No event data yet"
                description="Create events to see distribution over time"
              />
            )}
          </div>
        </BentoCard>

        <BentoCard span={3} title="Event Status" icon={Activity}>
          {hasStatusData ? (
            <div className="flex flex-col items-center justify-center h-52">
              <div className="h-40 w-full">
                <ParticipantPieChart data={[
                  { name: "Backlog", value: backlogs, color: "var(--color-base-400)" },
                  { name: "In Progress", value: inProgress, color: "var(--color-accent-amber)" },
                  { name: "Completed", value: completed, color: "var(--color-accent-teal)" },
                ]} />
              </div>
              <ChartLegend data={[
                { name: "Backlog", value: backlogs, color: "var(--color-base-400)" },
                { name: "In Progress", value: inProgress, color: "var(--color-accent-amber)" },
                { name: "Completed", value: completed, color: "var(--color-accent-teal)" },
              ]} />
            </div>
          ) : (
            <div className="h-52">
              <ChartEmptyState
                message="No event status data"
                description="Events will appear here once created"
              />
            </div>
          )}
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
