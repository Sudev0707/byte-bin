import { useEffect } from "react";
import { useSignUp, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { setSession } from "@/utils/localStorage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SignUp as SignUpComponent } from "@clerk/clerk-react";

const SignUp = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const { setActive } = useSignUp();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setSession({
        isLoggedIn: true,
        username: user.username || user.fullName || user.firstName || "User",
        email: user.primaryEmailAddress?.emailAddress || "",
        imageUrl: user.imageUrl,
      });
      navigate("/");
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-3 pb-2">
          <h1 className="text-4xl font-bold font-display mb-5">
            byte<span className="text-violet-600">Bin</span>
          </h1>
          {/* <p className="text-sm text-muted-foreground">Create your account to start tracking problems</p> */}
        </CardHeader>
        <CardContent>
          {/* Clerk SignUp with OAuth */}
          <div className="mb-6">
            <SignUpComponent
              routing="hash"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  // card: "shadow-none border-none bg-transparent",
                  formButtonPrimary: "bg-violet-600 hover:bg-violet-700",
                  // dividerRow: "bg-muted",
                  dividerText: "text-muted-foreground",
                  formFieldInput: " border-input",
                  footerActionLink: "text-violet-900 hover:text-violet-700",
                  identityPreviewText: "text-",
                  identityPreviewEditButton: "text-violet-600",
                  formFieldLabel: "text-black",
                  formFieldInputShowPasswordButton: "text-muted-foreground",
                  otpCodeFieldInput: " border-input",
                  formFieldErrorText: "text-destructive",
                  // OAuth button styling
                  socialButtonsBlockButton:
                    "border-input  hover:bg-accent hover:text-accent-foreground",
                  socialButtonsBlockButtonText: "text-black",
                  socialButtonsBlockButtonArrow: "text-gray-900",
                },
                layout: {
                  socialButtonsVariant: "blockButton",
                  showOptionalFields: false,
                },
              }}
              forceRedirectUrl="/"
              signInUrl="/login"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
