import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
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
import { addSeconds } from "date-fns";
import { axiosInstance } from "../api/axios.js";

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

const AddProblem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getToken } = useAuth();
  const { user } = useUser();
  const userId = user?.id;
  const existing =
    id && userId ? getProblems(userId).find((p) => p.id === id) : null;

  const initialSolutions: Solution[] =
    existing?.solutions && existing.solutions.length > 0
      ? existing.solutions
      : [
          {
            id: generateId(),
            title: "Solution 1",
            code: "",
            language: "JavaScript",
          },
        ];

  const [formData, setFormData] = useState({
    title: existing?.title || "",
    description: existing?.description || "",
    topic: existing?.topic || "",
    language: existing?.language || "",
    difficulty: existing?.difficulty || ("" as Problem["difficulty"] | ""),
    notes: existing?.notes || "",
    code: existing?.code || "",
    references: existing?.references?.join(", ") || "",
    solutions: initialSolutions,
    activeTab: initialSolutions[0]?.id || "",
  });

  const updatePath = (path: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.includes("[")
        ? path.match(/(\w+|\d+)/g) || []
        : path.split(".");
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key === undefined) return prev;
        current = current[key];
      }

      const lastKey = keys[keys.length - 1];
      if (Array.isArray(current) && /^\d+$/.test(lastKey)) {
        const index = parseInt(lastKey);
        current[index] = {
          ...current[index],
          [path.split("[")[1]?.slice(0, -1) || lastKey]: value,
        };
      } else {
        current[lastKey] = value;
      }

      return newData;
    });
  };

  // const addSolution = () => {
  //   const newSolution: Solution = {
  //     id: generateId(),
  //     title: `Solution ${solutions.length + 1}`,
  //     code: "",
  //     language: "JavaScript",
  //   };
  //   setSolutions((prev) => [...prev, newSolution]);
  //   setActiveTab(newSolution.id);
  // };

    const submitToBackend = async (problemData: any, id?: string) => {
      try {
        if (!userId) throw new Error("User not loaded. Please sign in again.");

        const token = await getToken(); // Clerk auth token
        let res;

        if (id) {
          // Update existing problem
          res = await axiosInstance.put(`/problems/${id}`, problemData, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          // Add new problem
          res = await axiosInstance.post("/problems/add", problemData, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        console.log("Backend saved successfully:", res.data);
        toast.success("Saved to backend!");
        return res.data;
      } catch (error: any) {
        console.error("Backend error details:", error.response?.data || error.message);
        toast.error(`Backend save failed (${error.response?.status || "Unknown"}), saved locally`);
        return null;
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const { title, topic, language, difficulty, solutions } = formData;

      // Validation
      if (!title || !topic || !language || !difficulty || solutions.some((s) => !s.title || !s.code)) {
        console.log("Validation failed:", { title, topic, language, difficulty, solutions });
        toast.error("Please fill in all required fields: Title, Topic, Language, Difficulty, Solution Title & Code");
        return;
      }

      // Prepare problem data for backend
      const problemData = {
        title,
        description: formData.description,
        topic,
        language,
        difficulty,
        code: formData.code,
        solutions: solutions.map((sol, index) => ({
          title: String(sol.title || `Solution ${index + 1}`),
          language: String(sol.language || "JavaScript"),
          code: String(sol.code || ""),
        })),
        notes: formData.notes,
        references: formData.references
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        // Do NOT include userId / clerkId here — backend will handle it
        dateAdded: existing?.dateAdded || new Date().toISOString().split("T")[0],
      };

      // Submit to backend
      const savedProblem = await submitToBackend(problemData, existing?.id);

      if (savedProblem) {
        toast.success(existing ? "Problem updated!" : "Problem added!");
        // Navigate to the problem page or problems list
        navigate(existing ? `/problem/${savedProblem.data.id}` : "/problems");
      }
    };

  const removeSolution = (solutionId: string) => {
    setFormData((prev) => {
      if (prev.solutions.length === 1) {
        toast.error("You must have at least one solution");
        return prev;
      }
      const newSolutions = prev.solutions.filter(
        (sol) => sol.id !== solutionId,
      );
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

  const addSolution = () => {
    const newSol: Solution = {
      id: generateId(),
      title: `Solution ${formData.solutions.length + 1}`,
      code: "",
      language: "JavaScript",
    };
    setFormData((prev) => ({
      ...prev,
      solutions: [...prev.solutions, newSol],
      activeTab: newSol.id,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-row justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Button form="problemForm" type="submit" className="w-full sm:w-auto">
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
              <form
                id="problemForm"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
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

                {/* <div className="space-y-2">
                  <Label>Problem Code</Label>
                  <Textarea
                    className="font-mono text-sm min-h-[200px]"
                    placeholder="Primary solution code for this problem..."
                    value={formData.code}
                    onChange={(e) => updatePath("code", e.target.value)}
                  />
                </div> */}

                <div className="space-y-2">
                  <Label>Reference Links (comma-separated)</Label>
                  <Input
                    placeholder="https://leetcode.com/..."
                    value={formData.references}
                    onChange={(e) => updatePath("references", e.target.value)}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="w-[60%] p-2">
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
                          {sol.title || `Solution ${index + 1}`}
                        </TabsTrigger>
                        {formData.solutions.length > 1 && (
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
                  {formData.solutions.map((sol) => (
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
                              updatePath(
                                `solutions.${formData.solutions.findIndex((s) => s.id === sol.id)}.title`,
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <Select
                            value={sol.language}
                            onValueChange={(v) =>
                              updatePath(
                                `solutions.${formData.solutions.findIndex((s) => s.id === sol.id)}.language`,
                                v,
                              )
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
                        <Label>Code</Label>
                        <Textarea
                          className="font-mono text-sm min-h-[300px]"
                          placeholder="Paste your solution code here..."
                          value={sol.code}
                          onChange={(e) =>
                            updatePath(
                              `solutions.${formData.solutions.findIndex((s) => s.id === sol.id)}.code`,
                              e.target.value,
                            )
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
      </div>
    </div>
  );
};

export default AddProblem;
