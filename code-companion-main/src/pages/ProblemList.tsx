import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  getProblems,
  deleteProblem,
  exportToJSON,
  exportToCSV,
} from "@/utils/localStorage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Edit,
  Download,
  FileJson,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/problems");
        // console.log("resulttt", res.data);

        setProblems(res.data || getProblems());
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const topics = useMemo(
    () => [...new Set(problems.map((p) => p.topic))],
    [problems],
  );
  const languages = useMemo(
    () => [...new Set(problems.map((p) => p.language))],
    [problems],
  );

  const filtered = useMemo(() => {
    let result = problems.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.notes.toLowerCase().includes(search.toLowerCase());
      const matchTopic = topicFilter === "all" || p.topic === topicFilter;
      const matchLang = langFilter === "all" || p.language === langFilter;
      const matchDiff = diffFilter === "all" || p.difficulty === diffFilter;
      return matchSearch && matchTopic && matchLang && matchDiff;
    });

    result.sort((a, b) => {
      if (sortBy === "date-desc") return b.dateAdded.localeCompare(a.dateAdded);
      if (sortBy === "date-asc") return a.dateAdded.localeCompare(b.dateAdded);
      const order = { Easy: 1, Medium: 2, Hard: 3 };
      if (sortBy === "diff-asc")
        return order[a.difficulty] - order[b.difficulty];
      return order[b.difficulty] - order[a.difficulty];
    });

    return result;
  }, [problems, search, topicFilter, langFilter, diffFilter, sortBy]);

  const handleDelete = async (id: string) => {
    console.log(id, "iidd");

    try {
      await axios.delete(`http://localhost:5000/api/problems/${id}`);
      console.log("Problem deleted");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-7xl mx-auto">
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
          <Button asChild size="sm">
            <Link to="/add">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Link>
          </Button>
        </div>
      </div>

      <div>
        {/* <CardContent className="pt-0"> */}
        <div className="flex flex-row gap-3">
          <div className="relative w-2/6">
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
              <SelectTrigger>
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={langFilter} onValueChange={setLangFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={diffFilter} onValueChange={setDiffFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="diff-asc">Easiest First</SelectItem>
                <SelectItem value="diff-desc">Hardest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* </CardContent> */}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No problems found.{" "}
            {problems.length === 0
              ? "Add your first problem!"
              : "Try adjusting filters."}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Title</TableHead>
                <TableHead className="">Topic</TableHead>
                <TableHead className="">Language</TableHead>
                <TableHead className="">Difficulty</TableHead>
                <TableHead className="">Date</TableHead>
                <TableHead className="">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/problem/${p.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {p.title}
                      {/* <span className="text-xs text-muted-foreground ml-2">
                        ({p.id})
                      </span> */}
                    </Link>
                  </TableCell>
                  <TableCell>{p.topic}</TableCell>
                  <TableCell>{p.language}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                  <TableCell>{p.dateAdded}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link to={`/problem/${p.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/edit/${p.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(p.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs" >ID: {p.id}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default ProblemList;
