import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProblems, deleteProblem, type Solution } from "@/utils/localStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const problem = getProblems().find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState("");

  if (!problem) {
    return (
      <div className="text-center py-20 text-muted-foreground animate-fade-in">
        <p className="text-lg">Problem not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate("/problems")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
        </Button>
      </div>
    );
  }

  // Set initial active tab if not set
  const solutions = problem.solutions || [];
  if (!activeTab && solutions.length > 0) {
    setActiveTab(solutions[0].id);
  }

  const handleDelete = () => {
    deleteProblem(problem.id);
    toast.success("Problem deleted");
    navigate("/problems");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="max-w-8xl mx-auto space-y-5 animate-fade-in border-0">
      <div className="flex flex-row justify-between" >
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="flex gap-2">
          <Link to={`/edit/${problem.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap">
        <div className="w-[40%] p-2">
          <Card>
            <CardHeader className="flex flex-col max-w-md sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-display">
                  {problem.title}
                </CardTitle>
                {problem.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {problem.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                    {problem.topic}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                    {problem.language}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      problem.difficulty === "Easy"
                        ? "bg-accent text-accent-foreground"
                        : problem.difficulty === "Medium"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Added: {problem.dateAdded}
                </p>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className=" flex flex-col w-[60%] p-2 gap-4">
          {solutions.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Solutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start">
                    {solutions.map((sol, index) => (
                      <TabsTrigger key={sol.id} value={sol.id}>
                        {sol.title || `Solution ${index + 1}`}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({sol.language})
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {solutions.map((sol) => (
                    <TabsContent key={sol.id} value={sol.id} className="mt-4">
                      <div className="flex justify-end mb-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyCode(sol.code)}
                        >
                          <Copy className="mr-2 h-3 w-3" /> Copy
                        </Button>
                      </div>
                      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                        {sol.code}
                      </pre>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {problem.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Notes & Learnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {problem.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {problem.references.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {problem.references.map((ref, i) => (
                    <li key={i}>
                      <a
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;

