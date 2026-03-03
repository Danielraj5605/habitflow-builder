import React from "react";
import { ActivityCalendar } from "react-activity-calendar";

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number; level: number }>;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Map our data to react-activity-calendar format
  // data should be [{ date: 'YYYY-MM-DD', count: 1, level: 0-4 }]

  const colorTheme = {
    light: ['#f0f0f0', '#c4edde', '#7ac7c4', '#f73859', '#384259'],
    dark: ['#383838', '#4d4d4d', '#7ac7c4', '#f73859', '#384259'],
  };

  return (
    <div className="w-full overflow-x-auto py-4">
      <ActivityCalendar
        data={data.length ? data : [{ date: new Date().toISOString().split('T')[0], count: 0, level: 0 }]}
        theme={colorTheme}
        labels={{
          legend: {
            less: "Less",
            more: "More",
          },
          months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          totalCount: "{{count}} completions in {{year}}"
        }}
      />
    </div>
  );
}
