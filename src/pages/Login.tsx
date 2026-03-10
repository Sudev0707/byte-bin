import { useEffect, useState } from "react";
import { useSignIn, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { setSession } from "@/utils/localStorage";
import { Code2, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signIn, setActive } = useSignIn();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setSession({ 
        isLoggedIn: true, 
        username: user.username || user.fullName || user.firstName || "User",
        email: user.primaryEmailAddress?.emailAddress || "",
        imageUrl: user.imageUrl
      });
      navigate("/");
    }
  }, [isLoaded, isSignedIn, user, navigate]);

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
          <h1 className="text-4xl font-bold font-display">byte<span className="text-violet-600" >Bin</span></h1>
          <p className="text-sm text-muted-foreground">Track your coding problems & solutions</p>
        </CardHeader>
        <CardContent>
          {/* Clerk SignIn with OAuth */}
          <div className="mb-6">
            <SignIn 
              routing="hash"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none bg-transparent",
                  formButtonPrimary: "bg-violet-600 hover:bg-violet-700",
                  dividerRow: "bg-muted",
                  dividerText: "text-muted-foreground",
                  formFieldInput: "bg-background border-input",
                  footerActionLink: "text-violet-600 hover:text-violet-700",
                  identityPreviewText: "text-foreground",
                  identityPreviewEditButton: "text-violet-600",
                  formFieldLabel: "text-foreground",
                  formFieldInputShowPasswordButton: "text-muted-foreground",
                  otpCodeFieldInput: "bg-background border-input",
                  formFieldErrorText: "text-destructive",
                  // OAuth button styling
                  socialButtonsBlockButton: "border-input bg-background hover:bg-accent hover:text-accent-foreground",
                  socialButtonsBlockButtonText: "text-foreground",
                  socialButtonsBlockButtonArrow: "text-muted-foreground",
                },
                layout: {
                  socialButtonsVariant: "blockButton",
                  showOptionalFields: false,
                },
              }}
              forceRedirectUrl="/"
              signUpUrl="/login"
            />
          </div>
          
          {/* <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div> */}

          {/* <form onSubmit={handleLogin} className="space-y-4">
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
          </form> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
