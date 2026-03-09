import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setSession } from "@/utils/localStorage";
import { Code2, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "demo" && password === "1234") {
      setSession({ isLoggedIn: true, username: "demo" });
      navigate("/");
    } else {
      setError("Invalid credentials. Use demo / 1234");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary">
            <Code2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-display">ByteBin</h1>
          <p className="text-sm text-muted-foreground">Track your coding problems & solutions</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="demo"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="1234"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              <Terminal className="mr-2 h-4 w-4" /> Sign In
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo credentials: demo / 1234
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
