import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getSession } from "@/utils/localStorage";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import AddProblem from "@/pages/AddProblem";
import ProblemList from "@/pages/ProblemList";
import ProblemDetail from "@/pages/ProblemDetail";
import Statistics from "@/pages/Statistics";
import Profile from "@/pages/Profile";
import UserProfile from "@/pages/UserProfile";
import SearchPage from "@/pages/Search";
import AppSidebar from "@/components/AppSidebar";
import Footer from "@/components/Footer";
import NotFound from "./pages/NotFound";
import { ProblemsProvider } from "@/context/ProblemsContext";
import OAuthCallback from "@/components/OAuthCallback";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const session = getSession();
  
  if (!session?.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 overflow-auto pt-14">
        <div className="mx-auto max-w-full p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* <ProblemsProvider> */}
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/oauth/callback/:provider" element={<OAuthCallback />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/add" element={<ProtectedLayout><AddProblem /></ProtectedLayout>} />
            <Route path="/edit/:id" element={<ProtectedLayout><AddProblem /></ProtectedLayout>} />
            <Route path="/problems" element={<ProtectedLayout><ProblemList /></ProtectedLayout>} />
            <Route path="/problem/:id" element={<ProtectedLayout><ProblemDetail /></ProtectedLayout>} />
            <Route path="/statistics" element={<ProtectedLayout><Statistics /></ProtectedLayout>} />
            <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
            <Route path="/profile/:id" element={<ProtectedLayout><UserProfile /></ProtectedLayout>} />
            <Route path="/search" element={<ProtectedLayout><SearchPage /></ProtectedLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      {/* </ProblemsProvider> */}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
