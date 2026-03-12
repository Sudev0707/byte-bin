import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { StrictMode } from "react";

const PUBLISHABLE_KEY =
  "pk_test_Y2FwYWJsZS1nb2JsaW4tNDYuY2xlcmsuYWNjb3VudHMuZGV2JA";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
