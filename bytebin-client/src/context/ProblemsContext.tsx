import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { problemService } from '@/api/problemService';
import type { Problem } from '@/types/problem';

interface ProblemsContextType {
  problems: Problem[];
  loading: boolean;
  error: string | null;
  loadProblems: () => Promise<void>;
  refreshProblems: () => Promise<void>;
}

const ProblemsContext = createContext<ProblemsContextType | undefined>(undefined);

export const useProblems = () => {
  const context = useContext(ProblemsContext);
  if (!context) {
    throw new Error('useProblems must be used within ProblemsProvider');
  }
  return context;
};

interface ProblemsProviderProps {
  children: ReactNode;
}

export const ProblemsProvider = ({ children }: ProblemsProviderProps) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await problemService.getProblems();
      setProblems(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load problems');
      console.error('Load problems error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProblems = async () => {
    await loadProblems();
  };

  useEffect(() => {
    loadProblems();
  }, []);

  return (
    <ProblemsContext.Provider value={{ problems, loading, error, loadProblems, refreshProblems }}>
      {children}
    </ProblemsContext.Provider>
  );
};

