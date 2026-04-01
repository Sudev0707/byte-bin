import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProblemsContextType {

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
  const [loading, setLoading] = useState(true);
 



  return (
    <ProblemsContext.Provider value={{ loading, loadProblems: async () => {}, refreshProblems: async () => {} }}>
      {children}
    </ProblemsContext.Provider>
  );
};

