import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProblems,
  saveProblem,
  generateId,
  type Problem,
  type Solution,
} from "@/utils/localStorage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

const TOPICS = [
  "Array",
  "Strings",
  "DP",
  "LinkedList",
  "Tree",
  "Graph",
  "Stack",
  "Queue",
  "Sorting",
  "Searching",
  "Recursion",
  "Backtracking",
  "Greedy",
  "Math",
  "Bit Manipulation",
  "Hashing",
  "Other",
];
const LANGUAGES = [
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "TypeScript",
  "React",
  "Node.js",
  "Go",
  "Rust",
  "Other",
];

const AddProblem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const existing = id ? getProblems().find((p) => p.id === id) : null;

  const [solutions, setSolutions] = useState<Solution[]>(
    existing?.solutions && existing.solutions.length > 0
      ? existing.solutions
      : [{ id: generateId(), title: "Solution 1", code: "", language: "JavaScript" }]
  );
  const [activeTab, setActiveTab] = useState(solutions[0]?.id || "");

  const [form, setForm] = useState({
    title: existing?.title || "",
    description: existing?.description || "",
    topic: existing?.topic || "",
    language: existing?.language || "",
    difficulty: existing?.difficulty || ("" as Problem["difficulty"] | ""),
    notes: existing?.notes || "",
    references: existing?.references?.join(", ") || "",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const updateSolution = (field: string, value: string) => {
    setSolutions((prev) =>
      prev.map((sol) =>
        sol.id === activeTab ? { ...sol, [field]: value } : sol
      )
    );
  };

  const addSolution = () => {
    const newSolution: Solution = {
      id: generateId(),
      title: `Solution ${solutions.length + 1}`,
      code: "",
      language: "JavaScript",
    };
    setSolutions((prev) => [...prev, newSolution]);
    setActiveTab(newSolution.id);
  };

  const removeSolution = (solutionId: string) => {
    if (solutions.length === 1) {
      toast.error("You must have at least one solution");
      return;
    }
    const newSolutions = solutions.filter((sol) => sol.id !== solutionId);
    setSolutions(newSolutions);
    if (activeTab === solutionId) {
      setActiveTab(newSolutions[0]?.id || "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.topic || !form.language || !form.difficulty) {
      toast.error("Please fill in all required fields");
      return;
    }

    const problem: Problem = {
      id: existing?.id || generateId(),
      title: form.title,
      description: form.description,
      topic: form.topic,
      language: form.language,
      difficulty: form.difficulty as Problem["difficulty"],
      solutions: solutions,
      notes: form.notes,
      references: form.references
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
      dateAdded: existing?.dateAdded || new Date().toISOString().split("T")[0],
    };

    saveProblem(problem);
    toast.success(existing ? "Problem updated!" : "Problem added!");
    navigate(existing ? `/problem/${problem.id}` : "/problems");
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-row justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Button type="submit" className="w-full sm:w-auto" onClick={handleSubmit}>
          <Save className="mr-2 h-4 w-4" /> {existing ? "Update" : "Save"}{" "}
          Problem
        </Button>
      </div>

      <div className="flex flex-wrap">
        <div className="w-[40%] p-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">
                {existing ? "Edit Problem" : "Add New Problem"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="e.g. Two Sum"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of the problem..."
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Topic *</Label>
                    <Select
                      value={form.topic}
                      onValueChange={(v) => update("topic", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {TOPICS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language *</Label>
                    <Select
                      value={form.language}
                      onValueChange={(v) => update("language", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty *</Label>
                    <Select
                      value={form.difficulty}
                      onValueChange={(v) => update("difficulty", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes / Learnings</Label>
                  <Textarea 
                    placeholder="What did you learn from this problem?"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reference Links (comma-separated)</Label>
                  <Input
                    placeholder="https://leetcode.com/..."
                    value={form.references}
                    onChange={(e) => update("references", e.target.value)}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="w-[60%] p-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Solutions
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addSolution}>
                <Plus className="mr-2 h-4 w-4" /> Add Solution
              </Button>
            </CardHeader>
            <CardContent>
              {solutions.length > 0 && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start h-auto flex-wrap">
                    {solutions.map((sol, index) => (
                      <div key={sol.id} className="flex items-center gap-1">
                        <TabsTrigger value={sol.id} className="px-3">
                          {sol.title || `Solution ${index + 1}`}
                        </TabsTrigger>
                        {solutions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSolution(sol.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </TabsList>
                  {solutions.map((sol) => (
                    <TabsContent key={sol.id} value={sol.id} className="space-y-4 mt-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Solution Title</Label>
                          <Input
                            placeholder="e.g. Brute Force"
                            value={sol.title}
                            onChange={(e) => updateSolution("title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <Select
                            value={sol.language}
                            onValueChange={(v) => updateSolution("language", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGES.map((l) => (
                                <SelectItem key={l} value={l}>
                                  {l}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Code</Label>
                        <Textarea
                          className="font-mono text-sm min-h-[300px]"
                          placeholder="Paste your solution code here..."
                          value={sol.code}
                          onChange={(e) => updateSolution("code", e.target.value)}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddProblem;

