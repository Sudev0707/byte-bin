
import { create } from 'zustand';
import { problemService } from '../src/api/problemService';
import type { Problem } from '../src/types/problem';

interface ProblemStore {
  // State
  problems: Problem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadProblems: () => Promise<void>;
  refreshProblems: () => Promise<void>;
  addProblem: (problem: Omit<Problem, 'id'>) => Promise<void>;
  updateProblem: (id: string, updates: Partial<Problem>) => Promise<void>;
  deleteProblem: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProblemStore = create<ProblemStore>((set, get) => ({
  // Initial state
  problems: [],
  loading: false,
  error: null,
  
  // Actions
  loadProblems: async () => {
    set({ loading: true, error: null });
    try {
      const data = await problemService.getProblems();
      set({ problems: data, loading: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.error || 'Failed to load problems',
        loading: false 
      });
      console.error('Load problems error:', err);
    }
  },
  
  refreshProblems: async () => {
    await get().loadProblems();
  },
  
  addProblem: async (newProblem) => {
    set({ loading: true, error: null });
    try {
      const created = await problemService.createProblem(newProblem);
      set((state) => ({ 
        problems: [created, ...state.problems],
        loading: false 
      }));
    } catch (err: any) {
      set({ 
        error: err.response?.data?.error || 'Failed to add problem',
        loading: false 
      });
      throw err;
    }
  },
  
  updateProblem: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updated = await problemService.updateProblem(id, updates);
      set((state) => ({
        problems: state.problems.map((p) => 
          p.id === id ? updated : p
        ),
        loading: false
      }));
    } catch (err: any) {
      set({ 
        error: err.response?.data?.error || 'Failed to update problem',
        loading: false 
      });
      throw err;
    }
  },
  
  deleteProblem: async (id) => {
    set({ loading: true, error: null });
    try {
      await problemService.deleteProblem(id);
      set((state) => ({
        problems: state.problems.filter((p) => p.id !== id),
        loading: false
      }));
    } catch (err: any) {
      set({ 
        error: err.response?.data?.error || 'Failed to delete problem',
        loading: false 
      });
      throw err;
    }
  },
  
  clearError: () => set({ error: null }),
}));