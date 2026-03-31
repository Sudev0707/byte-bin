import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosInstance } from "../api/axios.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Code2,
  CalendarCheck,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import { isToday, isThisMonth } from "date-fns";

const Dashboard = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  console.log('token : ', token);
  

  useEffect(() => {
    const loadProblems = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        const clerkId = user.id;
        const res = await axiosInstance.get(`/problems?clerkId=${encodeURIComponent(clerkId)}`);
        const apiData = Array.isArray(res.data) ? res.data : [];
        setProblems(apiData);
      } catch (err) {
        console.error("Error loading problems:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, [isLoaded, isSignedIn, user]);

  const stats = useMemo(() => {
    const total = problems.length;
    const today = problems.filter((p) => {
      try {
        return isToday(new Date(p.dateAdded));
      } catch {
        return false;
      }
    }).length;
    const month = problems.filter((p) => {
      try {
        return isThisMonth(new Date(p.dateAdded));
      } catch {
        return false;
      }
    }).length;
    return { total, today, month };
  }, [problems]);

  const recentProblems = problems.slice(-5).reverse();

  const cards = [
    {
      title: "Total Problems",
      value: stats.total,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      title: "Added Today",
      value: stats.today,
      icon: CalendarCheck,
      color: "text-success",
    },
    {
      title: "This Month",
      value: stats.month,
      icon: CalendarDays,
      color: "text-info",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in  max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here's your progress overview.
          </p>
        </div>
        <Button asChild>
          <Link to="/add">
            <Plus className="mr-2 h-4 w-4" /> Add Problem
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.title}
              </CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-display">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="font-bold font-display  text-xl pb-4">
          Recent Problems
        </div>
        <Card>
          {/* <CardHeader>
          <CardTitle className="text-lg font-display">Recent Problems</CardTitle>
        </CardHeader> */}
          {/* <CardContent> */}
          {recentProblems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Code2 className="mx-auto h-10 w-10 mb-2 opacity-40" />
              <p>No problems added yet. Start tracking!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Title</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead className="w-[120px]">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProblems.map((p) => (
                  <TableRow key={p.id} className="text-sm ">
                    <TableCell className="font-medium text-lg max-w-[300px]">
                      <Link
                        to={`/problem/${p.id}`}
                        className="line-clamp-1 hover:text-primary transition-colors block"
                      >
                        {p.title}
                      </Link>
                    </TableCell>
                    <TableCell>{p.topic}</TableCell>
                    <TableCell>{p.language}</TableCell>
                    <TableCell>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          p.difficulty === "Easy"
                            ? "bg-accent text-accent-foreground"
                            : p.difficulty === "Medium"
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.createdAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {/* </CardContent> */}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
