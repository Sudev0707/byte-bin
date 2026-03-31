import React, { useMemo } from "react";

interface DayData {
  date: string; // YYYY-MM-DD
  count: number;
}

interface Props {
  data: DayData[];
}

const COLORS = [
  "#161b22", // 0
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const ContributionGraph: React.FC<Props> = ({ data }) => {
  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);

  // 👉 Align to Sunday
  const startDate = new Date(yearStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // 👉 Generate all days
  const allDays = useMemo(() => {
    const days: DayData[] = [];
    const temp = new Date(startDate);
    const yearEnd = new Date(today.getFullYear(), 11, 31);

    while (temp <= yearEnd) {
      const dateStr = temp.toISOString().split("T")[0];
      const found = data.find((d) => d.date === dateStr);

      days.push({
        date: dateStr,
        count: found ? found.count : 0,
      });

      temp.setDate(temp.getDate() + 1);
    }

    return days;
  }, [data]);

  // 👉 Group into weeks
  const weeks = useMemo(() => {
    const w: DayData[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      w.push(allDays.slice(i, i + 7));
    }
    return w;
  }, [allDays]);

  // 👉 Month labels (based on 1st day)
  const monthLabels = useMemo(() => {
    const labels: { label: string; index: number }[] = [];

    weeks.forEach((week, weekIndex) => {
      week.forEach((day) => {
        const d = new Date(day.date);
        if (d.getDate() === 1) {
          labels.push({
            label: MONTHS[d.getMonth()],
            index: weekIndex,
          });
        }
      });
    });

    return labels;
  }, [weeks]);

  // 👉 Total contributions
  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data]
  );

  // 👉 Color scale
  const getColor = (count: number) => {
    if (count === 0) return COLORS[0];
    if (count < 2) return COLORS[1];
    if (count < 4) return COLORS[2];
    if (count < 6) return COLORS[3];
    return COLORS[4];
  };

  return (
    <div className="bg-[#0d1117] p-4 rounded-lg text-white w-full">

      <h3 className="text-sm mb-6 text-muted-foreground">
          Submission Activity
        </h3>

      {/* Month Labels */}
      <div className="flex text-xs text-gray-400 mb-5 ml-8 relative">
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: `${m.index * 17}px`,
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex">

        {/* Day Labels */}
        <div className="flex flex-col justify-between mr-2 text-xs text-gray-400">
          <span></span>
          <span>Mon</span>
          <span></span>
          <span>Wed</span>
          <span></span>
          <span>Fri</span>
          <span></span>
        </div>

        {/* Grid */}
        <div className="flex gap-[3px] overflow-x-auto">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {week.map((day, j) => (
                <div
                  key={j}
                  className="w-[14px] h-[14px] rounded-[2px] cursor-pointer"
                  style={{
                    backgroundColor: getColor(day.count),
                  }}
                  title={`${day.date} • ${day.count} contributions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
        <span>{total} activities in {today.getFullYear()}</span>

        <div className="flex items-center gap-1">
          <span>Less</span>
          {COLORS.map((c, i) => (
            <div
              key={i}
              className="w-[11px] h-[11px] rounded-[2px]"
              style={{ backgroundColor: c }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;