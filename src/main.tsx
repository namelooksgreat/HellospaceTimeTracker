import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./lib/auth";
import { ErrorBoundary } from "./lib/utils/error-boundary";
import App from "./App";
import "./index.css";

// Initialize Tempo DevTools
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Initialize React app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider defaultTheme="dark">
            <App />
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
