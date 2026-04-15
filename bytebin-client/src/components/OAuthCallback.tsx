import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { authService } from "../api/axios.js";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setSession, clearSession } from "@/utils/localStorage.js";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { provider } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const userEncoded = searchParams.get("user");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setErrorMessage(`Authentication failed: ${error}`);
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      if (!token || !userEncoded || !provider) {
        setStatus("error");
        setErrorMessage("Invalid OAuth callback - missing token or user data");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      try {
        const user = JSON.parse(decodeURIComponent(userEncoded));

        console.log("OAuth callback - token & user received:", { token: token.substring(0,20)+'...', user });

        // Set session properly for app consistency
        setSession({
          isLoggedIn: true,
          token,
          id: user.id,
          username: user.username,
          email: user.email,
        });

        // Check if there's a redirect URL stored
        const redirectUrl = localStorage.getItem("oauth_redirect_url");
        localStorage.removeItem("oauth_redirect_url");

        setStatus("success");

        // Redirect after short delay
        setTimeout(() => {
          if (redirectUrl && !redirectUrl.includes("/auth/")) {
            navigate(redirectUrl);
          } else {
            navigate("/");
          }
        }, 1500);
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        clearSession();
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message ||
            "Authentication failed. Please try again.",
        );
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, provider, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-violet-600" />
                <h2 className="text-xl font-semibold">
                  Completing Authentication...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your {provider} account
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <h2 className="text-xl font-semibold">
                  Authentication Successful!
                </h2>
                <p className="text-muted-foreground">
                  Redirecting you to the dashboard...
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold">Authentication Failed</h2>
                <p className="text-red-600 text-sm">{errorMessage}</p>
                <Button onClick={() => navigate("/login")} className="mt-4">
                  Back to Login
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
