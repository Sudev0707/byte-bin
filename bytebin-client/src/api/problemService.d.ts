interface ProblemData {
  title: string;
  description?: string;
  topic: string;
  language: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  notes?: string;
  code?: string;
  solutions: Array<{
    title: string;
    language: string;
    code: string;
  }>;
  references?: string[];
}

declare const problemService: {
  createProblem: (problemData: Omit<ProblemData, 'id'>) => Promise<any>;
  getProblems: () => Promise<any[]>;
  getProblemById: (problemId: string) => Promise<any>;
  updateProblem: (problemId: string, updatedData: any) => Promise<any>;
  deleteProblem: (problemId: string) => Promise<any>;
};

export default problemService;
export { problemService };
