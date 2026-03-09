import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getProblems } from "@/utils/localStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Code2, CalendarCheck, CalendarDays, BookOpen } from "lucide-react";
import { format, isToday, isThisMonth } from "date-fns";

const Dashboard = () => {
  const problems = getProblems();

  const stats = useMemo(() => {
    const total = problems.length;
    const today = problems.filter((p) => {
      try { return isToday(new Date(p.dateAdded)); } catch { return false; }
    }).length;
    const month = problems.filter((p) => {
      try { return isThisMonth(new Date(p.dateAdded)); } catch { return false; }
    }).length;
    return { total, today, month };
  }, [problems]);

  const recentProblems = problems.slice(-5).reverse();

  const cards = [
    { title: "Total Problems", value: stats.total, icon: BookOpen, color: "text-primary" },
    { title: "Added Today", value: stats.today, icon: CalendarCheck, color: "text-success" },
    { title: "This Month", value: stats.month, icon: CalendarDays, color: "text-info" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's your progress overview.</p>
        </div>
        <Link to="/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Problem
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title} className="bg-sidebar" >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-display text-slate-100">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Recent Problems</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProblems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Code2 className="mx-auto h-10 w-10 mb-2 opacity-40" />
              <p>No problems added yet. Start tracking!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProblems.map((p) => (
                <Link
                  key={p.id}
                  to={`/problem/${p.id}`}
                  className={`flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors  ${
                    p.difficulty === "Easy" ? "bg-accent" :
                    p.difficulty === "Medium" ? "bg-secondary" :
                    "bg-destructive/10"
                  }  `}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.topic} · {p.language}</p>
                  </div>
                  <span className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    p.difficulty === "Easy" ? "bg-accent text-accent-foreground" :
                    p.difficulty === "Medium" ? "bg-secondary text-secondary-foreground" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {p.difficulty}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
