import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getProblems, deleteProblem, exportToJSON, exportToCSV } from "@/utils/localStorage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Trash2, Eye, Edit, Download, FileJson, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProblemList = () => {
  const [problems, setProblems] = useState(getProblems());
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const topics = useMemo(() => [...new Set(problems.map((p) => p.topic))], [problems]);
  const languages = useMemo(() => [...new Set(problems.map((p) => p.language))], [problems]);

  const filtered = useMemo(() => {
    let result = problems.filter((p) => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.notes.toLowerCase().includes(search.toLowerCase());
      const matchTopic = topicFilter === "all" || p.topic === topicFilter;
      const matchLang = langFilter === "all" || p.language === langFilter;
      const matchDiff = diffFilter === "all" || p.difficulty === diffFilter;
      return matchSearch && matchTopic && matchLang && matchDiff;
    });

    result.sort((a, b) => {
      if (sortBy === "date-desc") return b.dateAdded.localeCompare(a.dateAdded);
      if (sortBy === "date-asc") return a.dateAdded.localeCompare(b.dateAdded);
      const order = { Easy: 1, Medium: 2, Hard: 3 };
      if (sortBy === "diff-asc") return order[a.difficulty] - order[b.difficulty];
      return order[b.difficulty] - order[a.difficulty];
    });

    return result;
  }, [problems, search, topicFilter, langFilter, diffFilter, sortBy]);

  const handleDelete = (id: string) => {
    deleteProblem(id);
    setProblems(getProblems());
    toast.success("Problem deleted");
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold font-display">Problem List</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportToJSON(problems)}>
                <FileJson className="mr-2 h-4 w-4" /> Export JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(problems)}>
                <FileText className="mr-2 h-4 w-4" /> Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/add">
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by title or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
              <Select value={topicFilter} onValueChange={setTopicFilter}>
                <SelectTrigger><SelectValue placeholder="Topic" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={langFilter} onValueChange={setLangFilter}>
                <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={diffFilter} onValueChange={setDiffFilter}>
                <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="diff-asc">Easiest First</SelectItem>
                  <SelectItem value="diff-desc">Hardest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No problems found. {problems.length === 0 ? "Add your first problem!" : "Try adjusting filters."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => (
            <Card key={p.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <Link to={`/problem/${p.id}`} className="font-medium hover:text-primary transition-colors truncate block">
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.topic} · {p.language} · {p.dateAdded}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  p.difficulty === "Easy" ? "bg-accent text-accent-foreground" :
                  p.difficulty === "Medium" ? "bg-secondary text-secondary-foreground" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  {p.difficulty}
                </span>
                <div className="flex gap-1 shrink-0">
                  <Link to={`/problem/${p.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                  </Link>
                  <Link to={`/edit/${p.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemList;
