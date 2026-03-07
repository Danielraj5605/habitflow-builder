import React from "react";
import { ActivityCalendar, ThemeInput } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number; level: number }>;
  loading?: boolean;
}

export function ActivityHeatmap({ data, loading }: ActivityHeatmapProps) {
  // Royal Obsidian Palette
  // level 0: Surface/Deep Obsidian
  // level 1: Sapphire Blue (Light)
  // level 2: Amethyst Purple (Medium)
  // level 3: Amethyst Purple (Strong)
  // level 4: Royal Gold
  
  const theme: ThemeInput = {
    light: ['#EBEDF0', '#9BE9A8', '#40C463', '#30A14E', '#216E39'], // Standard GH colors for light
    dark: [
      'rgba(39, 35, 54, 0.8)', // Level 0: Surface Highest
      'rgba(74, 123, 247, 0.4)', // Level 1: Sapphire
      'rgba(155, 109, 255, 0.5)', // Level 2: Amethyst
      'rgba(155, 109, 255, 0.8)', // Level 3: Amethyst Strong
      '#D4A846',                 // Level 4: Royal Gold
    ],
  };

  const labels = {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    totalCount: "{{count}} check-ins in the last year",
    legend: {
      less: "Less",
      more: "More",
    },
  };

  if (loading) {
    return (
      <div className="w-full h-40 animate-pulse bg-surface-elevated rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading activity data...</p>
      </div>
    );
  }

  return (
    <div className="w-full py-2 heatmap-container">
      <ActivityCalendar
        data={data.length ? data : [{ date: new Date().toISOString().split('T')[0], count: 0, level: 0 }]}
        theme={theme}
        labels={labels}
        fontSize={12}
        blockSize={12}
        blockMargin={4}
        renderBlock={(block, activity) => (
          React.cloneElement(block as React.ReactElement, {
            'data-tooltip-id': 'activity-tooltip',
            'data-tooltip-content': `${activity.count} completions on ${activity.date}`,
          })
        )}
      />
      <ReactTooltip 
        id="activity-tooltip" 
        style={{ 
          backgroundColor: 'rgba(28, 25, 41, 0.95)', 
          color: '#F5F0FF',
          border: '1px solid rgba(212, 168, 70, 0.3)',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: "'Outfit', sans-serif"
        }} 
      />
      <style>{`
        .heatmap-container svg text {
          fill: #6B6380 !important;
          font-family: 'Outfit', sans-serif !important;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
