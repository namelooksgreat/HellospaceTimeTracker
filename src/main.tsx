import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./components/theme-provider";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Import and initialize Tempo Devtools
if (import.meta.env.VITE_TEMPO === "true") {
  const { TempoDevtools } = await import("tempo-devtools");
  await TempoDevtools.init();
}

// Error tracking for production
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  // You could send this to an error tracking service
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  // You could send this to an error tracking service
});

// Initialize React app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider defaultTheme="dark">
            <App />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
