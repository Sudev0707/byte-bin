import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { problemService } from "@/api/problemService.js";
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
  const location = useLocation();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState(""); 

  useEffect(() => {
    if (problem?.solutions?.length > 0 && activeTab === "") {
      setActiveTab(problem.solutions[0].id || problem.solutions[0]._id || "");
    }
  }, [problem?.solutions, activeTab]);
  

  useEffect(() => {
    const loadProblem = async () => {
      if (location.state?.problem) {
        setProblem(location.state.problem);
        setLoading(false);
        return;
      }
      if (!id) return;
      try {
        const data = await problemService.getProblemById(id);
        setProblem(data);
      } catch (error) {
        console.error('Failed to fetch problem:', error);
        toast.error('Failed to load problem');
      } finally {
        setLoading(false);
      }
    };
    loadProblem();
  }, [id, location.state?.problem]);

  if (!id) {
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

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/problems/${problem.id}`);
      toast.success("Problem deleted successfully");
      navigate("/problems");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete problem");
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading problem...</p>
      </div>
    );
  }

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
            onClick={handleDelete}
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
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
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
                Added: {problem?.dateAdded || problem?.createdAt || "Unknown date"}
              </p>
            </div>
          </Card>

          {/* NOTES */}
         
            <Card>
              <CardTitle className="text-md font-medium px-5 py-2">
                Notes & Learnings
              </CardTitle>

              <CardContent className="border pt-2">
                <p className="text-sm whitespace-pre-wrap">{problem.notes || 'No notes yet.'}</p>
              </CardContent>
            </Card>
         

          {/* REFERENCES */}
         
            <Card>
              <CardTitle className="text-md font-medium px-5 py-2">
                References
              </CardTitle>

              <CardContent>
                <ul className="space-y-1">
                  {problem.references && problem.references.length > 0 ? problem.references.map((ref, i) => (
                    <li key={i}>
                      <a
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-violet-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap  text-ellipsis overflow-hidden max-w-full "
                        
                      >
                        <ExternalLink className="h-3 w-3" /> {i + 1} {ref}
                      </a>
                    </li>
                  )) : <li className="text-sm text-muted-foreground">No references added.</li>}
                </ul>
              </CardContent>
            </Card>
         
        </div>

        {/* RIGHT SIDE */}
        <div className=" w-[60%] p-2 gap-4">
          {/* SOLUTIONS */}
         
            <Card>
              <CardTitle className="text-md font-medium px-5 py-2">
                Solutions
              </CardTitle>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    {(problem.solutions || []).map((sol) => (
                      <TabsTrigger key={sol.id || sol._id} value={sol.id || sol._id}>
                        {sol.language}
                        <span className="ml-2 text-xs text-slate-400">
                          ({sol.code?.length || 0} chars)
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {(problem.solutions || []).map((sol) => (
                    <TabsContent key={sol.id || sol._id} value={sol.id || sol._id}>
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
          
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
