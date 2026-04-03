import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setSession, getSession } from "@/utils/localStorage";
import { axiosInstance } from "@/api/axios";
import { authService } from "../api/axios.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User as UserIcon, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { User } from "@/types/user";

const Login = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if logged in
  useEffect(() => {
    const session = getSession();
    if (session?.isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login({ email, password });

      // const { token, user } = response.data;
      const { token, user }: { token: string; user: User } = response;
      // console.log("Token:", token);
      // console.log("User:", user);

      setSession({
        isLoggedIn: true,
        token,
        id: user._id,
        username: user.username,
        email: user.email,
      });

      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        "Login failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setSession({
      isLoggedIn: true,
      token: "demo",
      id: "demo",
      username: "demo",
      email: "demo@example.com",
    });
    toast.success("Demo login activated!");
    navigate("/");
  };

  //
  const inputClassname =
    " text-lg border-2 focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-3 pb-6">
          <h1 className="text-5xl font-black bg-gradient-to-r from-violet-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
            byte<span>Bin</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to access your coding journey
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassname}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassname}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full  text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* <div className="pt-6 pb-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              className="w-full h-12 text-sm rounded-xl gap-2 shadow-sm"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              <User className="h-4 w-4" />
              Try Demo Account (username: demo, pass: 1234)
            </Button>
          </div> */}

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <a
                href="/sign-up"
                className="text-violet-600 hover:text-violet-700 font-semibold transition-colors"
              >
                Create one
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;