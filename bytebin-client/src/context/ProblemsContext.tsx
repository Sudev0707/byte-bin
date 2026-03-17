import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProblems, saveProblems } from '@/utils/localStorage';
import { axiosInstance } from '../api/axios';
import type { Problem } from '../utils/localStorage';

interface ProblemsContextType {
  problems: Problem[];
  loading: boolean;
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

  const loadProblems = async () => {
    try {
      setLoading(true);
      // Load cached first
      const cached = getProblems();
      if (cached.length) {
        setProblems(cached);
      }

      // Fetch fresh from API
      const res = await axiosInstance.get('/problems');
      const apiData: Problem[] = Array.isArray(res.data) ? res.data : [];

      // Update if different
      if (JSON.stringify(apiData) !== JSON.stringify(cached)) {
        setProblems(apiData);
        saveProblems(apiData);
      }
    } catch (err) {
      console.error('Error loading problems:', err);
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
    <ProblemsContext.Provider value={{ problems, loading, loadProblems, refreshProblems }}>
      {children}
    </ProblemsContext.Provider>
  );
};

