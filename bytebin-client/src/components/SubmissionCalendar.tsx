import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from '@/lib/utils';

interface DayData {
  date: string; // YYYY-MM-DD
  count: number;
}

interface SubmissionCalendarProps {
  data: DayData[];
  className?: string;
}

const COLORS = [
  'hsl(120, 40%, 80%)',  // 1
  'hsl(120, 50%, 70%)',  // 2
  'hsl(120, 60%, 60%)',  // 3
  'hsl(120, 70%, 50%)',  // 4
  'hsl(120, 80%, 40%)',  // 5+
];

const SubmissionCalendar: React.FC<SubmissionCalendarProps> = ({ data, className }) => {
  const today = new Date();
  const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
  
  // Monthly data for LeetCode-style monthly graph
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(({ date, count }) => {
      const monthYear = date.slice(0, 7); // YYYY-MM
      map[monthYear] = (map[monthYear] || 0) + count;
    });
    
    return Object.entries(map)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }, [data]);

  // Generate all days for heatmap
  const days: { date: string; count: number; isFuture: boolean }[] = [];
  const current = new Date(oneYearAgo);
  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      count: data.find(d => d.date === dateStr)?.count || 0,
      isFuture: current > today,
    });
    current.setDate(current.getDate() + 1);
  }

  // Group into weeks (7 days)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const tooltipContent = (date: string, count: number): string => `${date}: ${count} submission${count !== 1 ? 's' : ''}`;

  // Simple streak calc
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [days]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Submission Graphs (LeetCode Style)</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {/* Monthly Submissions Bar Chart */}
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground/80">Monthly Submissions (Last 12 Months)</h3>
          <ChartContainer config={{
            solved: {
              label: 'Solved',
            },
          }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ left: 12, right: 12 }}>
                <defs>
                  <linearGradient id="solved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" />
                    <stop offset="100%" stopColor="hsl(142, 71%, 25%)" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(220, 13%, 90%)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="url(#solved)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Heatmap */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground/80">Daily Activity Heatmap</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              No
              {COLORS.map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                  title={`${i + 1}`}
                />
              ))}
              5+
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-border/30 p-2 rounded-lg">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="flex items-center justify-center text-xs font-medium text-muted-foreground h-6 uppercase tracking-wide">
                {day.slice(0, 3)}
              </div>
            ))}

            {/* Days */}
            {weeks.slice(-52).reverse().map((week, weekIdx) =>
              week.map((day, dayIdx) => {
                if (day.isFuture) return <div key={dayIdx} className="w-4 h-4" />;

                const colorIdx = Math.min(day.count - 1, COLORS.length - 1);
                const bgColor = day.count === 0 ? 'transparent' : COLORS[colorIdx];

                return (
                  <div
                    key={dayIdx}
                    className="w-4 h-4 group relative cursor-pointer rounded hover:scale-125 transition-all z-10"
                    style={{ backgroundColor: bgColor }}
                    title={tooltipContent(day.date, day.count)}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono invisible group-hover:visible bg-background/90 rounded text-green-600 z-20">
                      {day.count}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Streak info */}
          <div className="pt-4 mt-6 border-t border-border/50">
            <div className="text-sm font-semibold text-foreground">Current streak: <span className="text-green-600">{currentStreak}</span> days</div>
            <p className="text-xs text-muted-foreground mt-1">Based on problems added (dateAdded)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionCalendar;

