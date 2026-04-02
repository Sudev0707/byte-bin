export interface Problem {
  id: string;
  userId: string;
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
  dateAdded: string;
  createdAt?: string;
  updatedAt?: string;
}

