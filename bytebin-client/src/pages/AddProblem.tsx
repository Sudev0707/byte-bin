import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { problemService } from "../api/problemService.js";
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
import { generateId } from "@/utils/localStorage"; // Keep for new solution IDs only

const TOPICS = [
  "Conditional",
  "Looping",
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

interface Solution {
  id: string;
  title: string;
  language: string;
  code: string;
}

interface FormData {
  title: string;
  description: string;
  topic: string;
  language: string;
  difficulty: string;
  notes: string;
  code: string;
  references: string;
  solutions: Solution[];
  activeTab: string;
}

const AddProblem = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    topic: "",
    language: "",
    difficulty: "",
    notes: "",
    code: "",
    references: "",
    solutions: [
    {
      id: generateId(), 
      title: "Solution 1",
      language: "JavaScript",
      code: "",
    }
  ],
    activeTab: "",
  });

  useEffect(() => {
  if (formData.solutions.length > 0 && !formData.activeTab) {
    setFormData(prev => ({
      ...prev,
      activeTab: prev.solutions[0].id
    }));
  }
}, []);

  // Load existing problem if editing
  useEffect(() => {
    const loadProblem = async () => {
      if (!isEdit) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const problem = await problemService.getProblemById(id!);
        // Populate form data
        const solutionsWithIds: Solution[] = problem.solutions?.map((sol: any) => ({
          id: sol.id || sol._id || generateId(),
          title: sol.title || `Solution 1`,
          language: sol.language || "JavaScript",
          code: sol.code || "",
        })) || [{ id: generateId(), title: "Solution 1", language: "JavaScript", code: "" }];
        setFormData({
          title: problem.title || "",
          description: problem.description || "",
          topic: problem.topic || "",
          language: problem.language || "",
          difficulty: problem.difficulty || "",
          notes: problem.notes || "",
          code: problem.code || "",
          references: Array.isArray(problem.references) ? problem.references.join(", ") : problem.references || "",
          solutions: solutionsWithIds,
          activeTab: solutionsWithIds[0]?.id || "",
        });
      } catch (error) {
        toast.error("Failed to load problem for editing");
        navigate("/problems");
      } finally {
        setLoading(false);
      }
    };
    loadProblem();
  }, [id, isEdit, navigate]);

  const updatePath = (path: string, value: string) => {
    setFormData((prev) => {
      if (path.includes("solutions")) {
        // Handle solutions array updates
        const match = path.match(/solutions\[(\d+)\]\.(\w+)/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];
          const newSolutions = [...prev.solutions];
          newSolutions[index] = { ...newSolutions[index], [field]: value };
          return { ...prev, solutions: newSolutions };
        }
      } else {
        // Simple field
        const newData = { ...prev, [path]: value };
        return newData;
      }
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { title, topic, language, difficulty, solutions } = formData;
    if (
      !title ||
      !topic ||
      !language ||
      !difficulty ||
      solutions.some((s) => !s.title || !s.code)
    ) {
      toast.error(
        "Please fill in all required fields: Title, Topic, Language, Difficulty, Solution Title & Code",
      );
      return;
    }

    setIsSubmitting(true);
    const problemData = {
      title,
      description: formData.description,
      topic,
      language,
      difficulty: difficulty as "Easy" | "Medium" | "Hard",
      code: formData.code,
      solutions: solutions.map((sol) => ({
        title: sol.title,
        language: sol.language,
        code: sol.code,
      })),
      notes: formData.notes,
      references: formData.references
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
    };

    try {
      if (isEdit) {
        await problemService.updateProblem(id!, problemData);
        toast.success("Problem updated successfully!");
      } else {
        await problemService.createProblem(problemData);
        toast.success("Problem added successfully!");
      }
      navigate("/problems");
    } catch (error) {
      toast.error("Failed to save problem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSolution = (solutionId: string) => {
    setFormData((prev) => {
      if (prev.solutions.length === 1) {
        toast.error("You must have at least one solution");
        return prev;
      }
      const newSolutions = prev.solutions.filter((sol) => sol.id !== solutionId);
      let newActiveTab = prev.activeTab;
      if (prev.activeTab === solutionId) {
        newActiveTab = newSolutions[0]?.id || "";
      }
      return {
        ...prev,
        solutions: newSolutions,
        activeTab: newActiveTab,
      };
    });
  };

  const addSolution = useCallback(() => {
    const newSol: Solution = {
      id: generateId(),
      title: `Solution ${formData.solutions.length + 1}`,
      language: "JavaScript",
      code: "",
    };
    setFormData((prev) => ({
      ...prev,
      solutions: [...prev.solutions, newSol],
      activeTab: newSol.id,
    }));
  }, [formData.solutions.length]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-row justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button form="problemForm" type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" /> {isEdit ? "Update" : "Save"} Problem
        </Button>
      </div>

      <form id="problemForm" onSubmit={handleSubmit} className="flex row  gap-4">
        <div className="w-[40%] space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">
                {isEdit ? "Edit Problem" : "Add New Problem"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="e.g. Two Sum"
                  value={formData.title}
                  onChange={(e) => updatePath("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description of the problem..."
                  value={formData.description}
                  onChange={(e) => updatePath("description", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Topic *</Label>
                  <Select
                    value={formData.topic}
                    onValueChange={(v) => updatePath("topic", v)}
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
                    value={formData.language}
                    onValueChange={(v) => updatePath("language", v)}
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
                    value={formData.difficulty}
                    onValueChange={(v) => updatePath("difficulty", v)}
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
                  value={formData.notes}
                  onChange={(e) => updatePath("notes", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Reference Links (comma-separated)</Label>
                <Input
                  placeholder="https://leetcode.com/..."
                  value={formData.references}
                  onChange={(e) => updatePath("references", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-[60%]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Solutions</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSolution}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Solution
              </Button>
            </CardHeader>
            <CardContent>
              {formData.solutions.length > 0 && (
                <Tabs
                  value={formData.activeTab}
                  onValueChange={(v) => updatePath("activeTab", v)}
                  className="w-full"
                >
                  <TabsList className="w-full justify-start h-auto flex-wrap">
                    {formData.solutions.map((sol, index) => (
                      <div key={sol.id} className="flex items-center gap-1">
                        <TabsTrigger value={sol.id} className="px-3">
                          {sol.title}
                        </TabsTrigger>
                        {formData.solutions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            type="button"
                            onClick={() => removeSolution(sol.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </TabsList>
                  {formData.solutions.map((sol, index) => (
                    <TabsContent
                      key={sol.id}
                      value={sol.id}
                      className="space-y-4 mt-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Solution Title</Label>
                          <Input
                            placeholder="e.g. Brute Force"
                            value={sol.title}
                            onChange={(e) =>
                              updatePath(`solutions[${index}].title`, e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <Select
                            value={sol.language}
                            onValueChange={(v) =>
                              updatePath(`solutions[${index}].language`, v)
                            }
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
                        <Label>Code *</Label>
                        <Textarea
                          className="font-mono text-sm min-h-[300px]"
                          placeholder="Paste your solution code here..."
                          value={sol.code}
                          onChange={(e) =>
                            updatePath(`solutions[${index}].code`, e.target.value)
                          }
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AddProblem;

