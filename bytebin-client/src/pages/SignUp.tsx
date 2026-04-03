import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setSession, getSession } from "@/utils/localStorage";
import { axiosInstance } from "@/api/axios";
import {authService} from "../api/axios.js"
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User as UserIcon, Mail, Lock, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";

const SignUp = () => {
  const [step, setStep] = useState("register"); // 'register' or 'verify'
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [tempUserId, setTempUserId] = useState(null); // Store temp user ID after registration
  const [email, setEmail] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

  // Redirect if logged in
  useEffect(() => {
    const session = getSession();
    if (session?.isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Client-side validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      console.log("Full response:", response);

      // Store temporary user ID for verification
      // setTempUserId(response.user.id);
      setEmail(response.email); 
      setStep("verify");
      setResendTimer(60)
      toast.success("Verification code sent to your email!");

      // setSession({
      //   isLoggedIn: true,
      //   token,
      //   id: user.id,
      //   username: user.username,
      //   email: user.email,
      // });

      // toast.success("Email verified successfully! Welcome aboard!");
      // navigate("/");


      
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      setIsLoading(false);
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    try {
      console.log(email, verificationCode)
      const response = await authService.verifyEmail({
        // userId: tempUserId,
        email: email,
        otp: verificationCode
      });

      const { token, user }: { token: string; user: User } = response;
      
      // Set session after successful verification
      setSession({
        isLoggedIn: true,
        token,
        id: user._id,
        username: user.username,
        email: user.email,
      });

      toast.success("Email verified successfully! Welcome aboard!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Verification failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      await authService.resendVerificationCode({
        email: formData.email
      });
      setResendTimer(60); 
      toast.success("New verification code sent!");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to resend code. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = "text-lg border-2 focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl";

  // Verification Step UI
  if (step === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center space-y-3 pb-6">
            <h1 className="text-5xl font-black bg-gradient-to-r from-violet-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
              byte<span>Bin</span>
            </h1>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <p className="text-muted-foreground text-sm">
              We've sent a 6-digit verification code to<br />
              <span className="font-semibold text-foreground">{formData.email}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="verificationCode"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <KeyRound className="h-4 w-4" />
                  Verification Code
                </Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={inputClassName + " text-center text-2xl tracking-widest"}
                  disabled={isLoading}
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>
            </form>

            <div className="text-center pt-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || isLoading}
                  className={`text-violet-600 hover:text-violet-700 font-semibold transition-colors ${
                    (resendTimer > 0 || isLoading) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
              </p>
              <button
                onClick={() => {
                  setStep("register");
                  setError("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to registration
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration Step UI
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-3 pb-6">
          <h1 className="text-5xl font-black bg-gradient-to-r from-violet-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
            byte<span>Bin</span>
          </h1>
          <p className="text-muted-foreground text-sm text-center">
            Create your account to start tracking problems
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter unique username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={inputClassName}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClassName}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputClassName}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={inputClassName}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-violet-600 hover:text-violet-700 font-semibold transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;