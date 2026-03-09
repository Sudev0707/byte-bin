export interface Solution {
  id: string;
  title: string;
  code: string;
  language: string;
}

export interface Problem {
  id: string;
  title: string;
  description?: string;
  topic: string;
  language: string;
  difficulty: "Easy" | "Medium" | "Hard";
  solutions: Solution[];
  notes: string;
  references: string[];
  dateAdded: string;
}

export interface Session {
  isLoggedIn: boolean;
  username: string;
}

const PROBLEMS_KEY = "problems";
const SESSION_KEY = "session";

// Migration helper to convert old problem format to new format
const migrateProblem = (problem: any): Problem => {
  // If problem already has solutions array, return as is
  if (problem.solutions && Array.isArray(problem.solutions)) {
    return problem as Problem;
  }
  
  // Migrate old format with single code field to new solutions array
  const migrated: Problem = {
    ...problem,
    solutions: problem.code 
      ? [{
          id: generateId(),
          title: "Solution 1",
          code: problem.code,
          language: problem.language || "JavaScript",
        }]
      : [],
  };
  
  // Remove old code field if it exists
  delete (migrated as any).code;
  
  return migrated;
};

export const getProblems = (): Problem[] => {
  const data = localStorage.getItem(PROBLEMS_KEY);
  if (!data) return [];
  
  const problems = JSON.parse(data);
  return problems.map(migrateProblem);
};

export const saveProblem = (problem: Problem) => {
  const problems = getProblems();
  const idx = problems.findIndex((p) => p.id === problem.id);
  if (idx >= 0) {
    problems[idx] = problem;
  } else {
    problems.push(problem);
  }
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
};

export const deleteProblem = (id: string) => {
  const problems = getProblems().filter((p) => p.id !== id);
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
};

export const getSession = (): Session | null => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const setSession = (session: Session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const exportToJSON = (problems: Problem[]) => {
  const blob = new Blob([JSON.stringify(problems, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "coding-problems.json";
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (problems: Problem[]) => {
  const headers = ["Title", "Topic", "Language", "Difficulty", "Date Added", "Notes", "References"];
  const rows = problems.map((p) => [
    `"${p.title}"`,
    p.topic,
    p.language,
    p.difficulty,
    p.dateAdded,
    `"${p.notes.replace(/"/g, '""')}"`,
    `"${p.references.join(", ")}"`,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "coding-problems.csv";
  a.click();
  URL.revokeObjectURL(url);
};
