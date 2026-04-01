import { useMemo, useEffect, useState } from "react";
import LeetCodeHeatmap from "@/components/LeetCodeHeatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const COLORS = [
  "hsl(172, 66%, 40%)",
  "hsl(217, 91%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(280, 65%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(330, 65%, 55%)",
  "hsl(200, 70%, 50%)",
];

const Statistics = () => {

  const[problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Ensure problems loaded
  }, [problems]);

  const topicData = useMemo(() => {
    const map: Record<string, number> = {};
    problems.forEach((p) => { map[p.topic] = (map[p.topic] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [problems]);

  const langData = useMemo(() => {
    const map: Record<string, number> = {};
    problems.forEach((p) => { map[p.language] = (map[p.language] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [problems]);

  const diffData = useMemo(() => {
    const map: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    problems.forEach((p) => { map[p.difficulty]++; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [problems]);

  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    problems.forEach((p) => { map[p.dateAdded] = (map[p.dateAdded] || 0) + 1; });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, count]) => ({ date: date.slice(5), count }));
  }, [problems]);

  // Activity by Day of Month (1-31 across all months)
  const dayOfMonthData = useMemo(() => {
    const map: Record<number, number> = {};
    problems.forEach((p) => {
      const date = new Date(p.dateAdded);
      if (!isNaN(date.getTime())) {
        const day = date.getDate();
        map[day] = (map[day] || 0) + 1;
      }
    });
    return Array.from({ length: 31 }, (_, i) => ({
      day: String(i + 1),
      count: map[i + 1] || 0
    }));
  }, [problems]);

  if (loading || problems.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground animate-fade-in">
        <p className="text-lg">{loading ? 'Loading...' : 'No data yet. Add some problems to see statistics!'}</p>
      </div>
    );
  }

  // Compute submission data for calendar
  const submissionData = useMemo(() => {
    const map: Record<string, number> = {};
    problems.forEach((p) => {
      map[p.dateAdded] = (map[p.dateAdded] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count: count }));
  }, [problems]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold font-display">Statistics</h1>

      {/* LeetCode Submission Graph */}
      <LeetCodeHeatmap data={submissionData} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Problems by Topic</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={topicData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {topicData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Problems by Language</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={langData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(172, 66%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Difficulty Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={diffData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  <Cell fill="hsl(142, 71%, 45%)" />
                  <Cell fill="hsl(38, 92%, 50%)" />
                  <Cell fill="hsl(0, 72%, 51%)" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Daily Activity (Last 14 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity by Day of Month (1-31) */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Activity by Day of Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dayOfMonthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(120, 70%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default Statistics;
