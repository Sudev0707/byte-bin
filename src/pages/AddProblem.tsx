import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProblems, saveProblem, generateId, type Problem } from "@/utils/localStorage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const TOPICS = ["Array", "Strings", "DP", "LinkedList", "Tree", "Graph", "Stack", "Queue", "Sorting", "Searching", "Recursion", "Backtracking", "Greedy", "Math", "Bit Manipulation", "Hashing", "Other"];
const LANGUAGES = ["JavaScript", "Python", "Java", "C++", "TypeScript", "React", "Node.js", "Go", "Rust", "Other"];

const AddProblem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const existing = id ? getProblems().find((p) => p.id === id) : null;

  const [form, setForm] = useState({
    title: existing?.title || "",
    topic: existing?.topic || "",
    language: existing?.language || "",
    difficulty: existing?.difficulty || "" as Problem["difficulty"] | "",
    code: existing?.code || "",
    notes: existing?.notes || "",
    references: existing?.references?.join(", ") || "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.topic || !form.language || !form.difficulty) {
      toast.error("Please fill in all required fields");
      return;
    }

    const problem: Problem = {
      id: existing?.id || generateId(),
      title: form.title,
      topic: form.topic,
      language: form.language,
      difficulty: form.difficulty as Problem["difficulty"],
      code: form.code,
      notes: form.notes,
      references: form.references.split(",").map((r) => r.trim()).filter(Boolean),
      dateAdded: existing?.dateAdded || new Date().toISOString().split("T")[0],
    };

    saveProblem(problem);
    toast.success(existing ? "Problem updated!" : "Problem added!");
    navigate(existing ? `/problem/${problem.id}` : "/problems");
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">{existing ? "Edit Problem" : "Add New Problem"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="e.g. Two Sum" value={form.title} onChange={(e) => update("title", e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Topic *</Label>
                <Select value={form.topic} onValueChange={(v) => update("topic", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language *</Label>
                <Select value={form.language} onValueChange={(v) => update("language", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty *</Label>
                <Select value={form.difficulty} onValueChange={(v) => update("difficulty", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Code / Solution</Label>
              <Textarea
                className="font-mono text-sm min-h-[200px]"
                placeholder="Paste your solution code here..."
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
              />
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

            <Button type="submit" className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" /> {existing ? "Update" : "Save"} Problem
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProblem;
