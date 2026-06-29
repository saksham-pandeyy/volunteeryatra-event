"use client";

import { BentoGrid, BentoCard, StatsCard, StatsGrid, SkeletonStatCard, SkeletonChart } from "@/components/ui";
import { MonthlyBarChart, ParticipantPieChart, ChartLegend } from "@/components/ui";
import type { DashboardStats } from "@/common/types";
import { Calendar, Users, TrendingUp, BarChart3, Activity, Inbox } from "lucide-react";

interface StatsSectionProps {
  stats: DashboardStats | null;
  dateRangeLabel: string;
  trend: { direction: "up" | "down" | "neutral"; value: string } | null;
  isLoading: boolean;
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

export function DashboardStatsSection({ stats, dateRangeLabel, trend, isLoading }: StatsSectionProps) {
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
          <BentoCard span={3} title="Event Status"><SkeletonChart /></BentoCard>
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
  const hasMonthlyData = stats.monthlyTrend.some((m) => m.count > 0);
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
          description={dateRangeLabel}
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
        <BentoCard span={3} title="Monthly Trend" subtitle={dateRangeLabel} icon={TrendingUp}>
          <div className="h-52">
            {hasMonthlyData ? (
              <MonthlyBarChart data={stats.monthlyTrend} />
            ) : (
              <ChartEmptyState
                message="No event data yet"
                description="Create events to see monthly distribution"
              />
            )}
          </div>
        </BentoCard>

        <BentoCard span={3} title="Event Status" subtitle={dateRangeLabel} icon={Activity}>
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
