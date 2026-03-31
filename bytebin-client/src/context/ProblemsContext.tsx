import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProblems, saveProblems } from '@/utils/localStorage';
import { axiosInstance } from '../api/axios';
import type { Problem } from '../utils/localStorage';
import { useAuth, useUser } from '@clerk/clerk-react';

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
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();
  const userId = user?.id;

  const loadProblems = async () => {
    try {
      setLoading(true);
      if (!isLoaded || !isSignedIn || !userId) {
        setProblems([]);
        return;
      }

      // Always clear problems when switching users to prevent stale data.
      setProblems([]);

      // Load cached first
      const cached = getProblems(userId);
      setProblems(cached);

      // Fetch fresh from API
      const token = await getToken();
      // console.log("TOKEN:", token);
      const res = await axiosInstance.get("/problems", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
      const apiData: Problem[] = Array.isArray(res.data) ? res.data : [];

      // Update if different
      // Always write cache for the current user after a successful API call.
   
      if (JSON.stringify(apiData) !== JSON.stringify(cached)) {
        setProblems(apiData);
      }
    } catch (err) {
      console.error('Error loading problems:', err);
      // Prevent stale/cross-user display if API request fails.
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshProblems = async () => {
    await loadProblems();
  };

  useEffect(() => {
    loadProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, userId]);

  return (
    <ProblemsContext.Provider value={{ problems, loading, loadProblems, refreshProblems }}>
      {children}
    </ProblemsContext.Provider>
  );
};

