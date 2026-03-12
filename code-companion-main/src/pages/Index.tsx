import { Navigate } from "react-router-dom";
import { getSession } from "@/utils/localStorage";

const Index = () => {
  const session = getSession();
  if (!session?.isLoggedIn) return <Navigate to="/login" replace />;
  return <Navigate to="/" replace />;
};

export default Index;
