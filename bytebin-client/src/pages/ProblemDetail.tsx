import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { deleteProblem, type Problem } from "@/utils/localStorage";
import { useProblems } from "@/context/ProblemsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "../api/axios.js";

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { problems } = useProblems();

  const problem: Problem | undefined = problems.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState("");

  const solutions = problem?.solutions || [];

  // ✅ set active tab safely
  useEffect(() => {
    if (solutions.length > 0) {
      setActiveTab(solutions[0]._id);
    }
  }, [id]);

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

  const handleDelete = async (id: string) => {
    console.log(id, "iidd");

    try {
      await axiosInstance.delete(`/problems/${id}`);
      // deleteProblem(problem.id);
      toast.success("Problem deleted");
      // navigate("/problems");
    } catch (error) {
      console.error(error);
    }
  };

  // const handleDelete = () => {
  //   deleteProblem(problem._id);
  //   toast.success("Problem deleted");
  //   navigate("/problems");
  // };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in border-0">
      <div className="flex flex-row justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/edit/${problem.id}`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(id)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap">
        {/* LEFT SIDE */}
        <div className="flex flex-col w-[40%] p-2 gap-4">
          <Card>
            <CardTitle className="font-medium px-5 py-3 text-yellow-500">
              {problem.title}
            </CardTitle>

            <div className=" px-5 py-0 pb-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                  {problem.topic}
                </span>

                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                  {problem.language}
                </span>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    problem.difficulty === "Easy"
                      ? "bg-green-400 text-green-800"
                      : problem.difficulty === "Medium"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>

              {problem.description && (
                <p className="text-[16px] text-muted-foreground bg-background p-2 rounded-sm mt-2 text-zinc-300 ">
                  {problem.description}
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Added:{" "}
                {problem?.dateAdded || problem?.createdAt || "Unknown date"}
              </p>
            </div>
          </Card>

          {/* NOTES */}
          {problem.notes && (
            <Card>
              <CardTitle className="text-md font-medium px-5 py-2">
                Notes & Learnings
              </CardTitle>

              <CardContent className="border pt-2">
                <p className="text-sm whitespace-pre-wrap">{problem.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* REFERENCES */}
          {problem.references?.length > 0 && (
            <Card>
              <CardTitle className="text-md font-medium px-5 py-2">
                References
              </CardTitle>

              <CardContent>
                <ul className="space-y-1">
                  {problem.references.map((ref, i) => (
                    <li key={i}>
                      <a
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-violet-400 hover:underline inline-flex items-center gap-1"
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

        {/* RIGHT SIDE */}
        <div className=" w-[60%] p-2 gap-4">
          {/* SOLUTIONS */}
          {solutions.length > 0 && (
            <Card>
              <CardTitle className="text-md font-medium px-5 py-2">
                Solutions
              </CardTitle>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    {solutions.map((sol, index) => (
                      <TabsTrigger key={sol._id} value={sol._id}>
                        {sol.title || `Solution ${index + 1}`}
                        <span className="ml-2 text-xs text-slate-400">
                          ({sol.language})
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {solutions.map((sol) => (
                    <TabsContent key={sol._id} value={sol._id}>
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
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
