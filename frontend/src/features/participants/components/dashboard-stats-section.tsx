"use client";

import { BentoGrid, BentoCard, StatsCard, StatsGrid, SkeletonStatCard, SkeletonChart } from "@/components/ui";
import { MonthlyBarChart, ParticipantPieChart, ChartLegend } from "@/components/ui";
import type { DashboardStats } from "@/common/types";

interface StatsSectionProps {
  stats: DashboardStats;
  dateRangeLabel: string;
  trend: { direction: "up" | "down" | "neutral"; value: string } | null;
  isLoading: boolean;
}

export function DashboardStatsSection({ stats, dateRangeLabel, trend, isLoading }: StatsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <StatsGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </StatsGrid>
        <BentoGrid>
          <BentoCard span={3} title="Loading..."><SkeletonChart /></BentoCard>
          <BentoCard span={3} title="Loading..."><SkeletonChart /></BentoCard>
        </BentoGrid>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsGrid>
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          description={dateRangeLabel}
          trend={trend ? `${trend.value} this month` : undefined}
          isPositive={trend ? trend.direction === "up" : true}
        />
        <StatsCard 
          title="Upcoming Events" 
          value={stats.totalUpcoming} 
          description="Events happening soon" 
          accentColor="var(--color-primary)" 
        />
        <StatsCard 
          title="Participants" 
          value={stats.totalParticipants} 
          description={`${stats.pendingParticipants} pending`} 
          accentColor="var(--color-primary)" 
        />
        <StatsCard 
          title="Avg Per Event" 
          value={stats.avgPerEvent} 
          description={dateRangeLabel} 
          accentColor="var(--color-primary)" 
        />
      </StatsGrid>

      <BentoGrid>
        <BentoCard span={3} title="Event Distribution" subtitle="Monthly trend of event creations">
          <div className="h-52"><MonthlyBarChart data={stats.monthlyTrend} /></div>
        </BentoCard>
        <BentoCard span={3} title="Event Status" subtitle="Breakdown of event stages">
          <div className="flex flex-col items-center justify-center h-52">
            <div className="h-40 w-full">
              <ParticipantPieChart data={[
                { name: "Backlog", value: stats.byStatus.backlog, color: "var(--color-base-400)" },
                { name: "In Progress", value: stats.byStatus.in_progress, color: "var(--color-accent-amber)" },
                { name: "Completed", value: stats.byStatus.completed, color: "var(--color-accent-teal)" },
              ]} />
            </div>
            <ChartLegend data={[
              { name: "Backlog", value: stats.byStatus.backlog, color: "var(--color-base-400)" },
              { name: "In Progress", value: stats.byStatus.in_progress, color: "var(--color-accent-amber)" },
              { name: "Completed", value: stats.byStatus.completed, color: "var(--color-accent-teal)" },
            ]} />
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
