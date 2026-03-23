import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useProblems } from "@/context/ProblemsContext";
import { axiosInstance } from "@/api/axios.js";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, User, Code2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

interface User {
  id: string;
  name: string;
  username: string;
  problemsSolved: number;
  imageUrl?: string;
}

type Problem = {
  _id?: string;
  title: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  category?: string;
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState("problems");
  const { problems, loading: problemsLoading } = useProblems();
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);

  const { getToken } = useAuth();

 


  const usersQuery = useQuery({
    queryKey: ["users", q],
    queryFn: async () => {
      if (!q) throw new Error("Query required");
      const token = await getToken();
      // console.log("token", token);

      const response = await axiosInstance.post(
        "/api/users/search",
        { q },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data.users;
    },
    enabled: !!q && activeTab === "users",
    staleTime: 5 * 60 * 1000, // 5 min
  });

  useEffect(() => {
    if (q) {
      // Filter problems by title (client-side for now)
      const filteredP = problems.filter((p) =>
        p.title.toLowerCase().includes(q.toLowerCase()),
      );
      setFilteredProblems(filteredP);
    }
  }, [q, problems]);

  const getDifficultyBadge = (difficulty?: string) => {
    const variants = {
      Easy: "default",
      Medium: "secondary",
      Hard: "destructive",
    } as any;
    return (
      <Badge variant={variants[difficulty || "Easy"] as any}>
        {difficulty || "Easy"}
      </Badge>
    );
  };

  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Search className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Search ByteBin</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Search for problems, users, and more. Enter a keyword above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">Search results for "{q}"</h1>
        </div>
        <Input
          defaultValue={q}
          placeholder="Refine search..."
          className="max-w-md sm:ml-auto border-slate-600"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const newQ = (e.target as HTMLInputElement).value;
              navigate(`/search?q=${encodeURIComponent(newQ)}`, {
                replace: true,
              });
            }
          }}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="">
        <TabsList className="grid grid-cols-2 w-80">
          <TabsTrigger value="problems">
            Problems ({filteredProblems.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            Users ({usersQuery.data?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="problems" className="mt-6">
          {problemsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              Loading problems...
            </div>
          ) : filteredProblems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Code2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No problems found
                </h3>
                <p className="text-muted-foreground">Try a different keyword</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProblems.map((problem) => (
                      <TableRow key={problem._id || problem.title}>
                        <TableCell className="font-medium">
                          {problem.title}
                        </TableCell>
                        <TableCell>
                          {getDifficultyBadge(problem.difficulty)}
                        </TableCell>
                        <TableCell>{problem.category}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/problem/${problem._id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          {usersQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              Searching users...
            </div>
          ) : usersQuery.error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Search failed</h3>
                <p className="text-muted-foreground">
                  Try again or check console
                </p>
              </CardContent>
            </Card>
          ) : usersQuery.data?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">Try a different keyword</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>Users ({usersQuery.data?.length ?? 0})</CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {usersQuery.data?.map((user) => (
                    <Card
                      key={user.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {user.name[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                        <Badge>{user.problemsSolved} solved</Badge>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Link to={`/profile/${user.id}`}>View Profile</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchPage;
