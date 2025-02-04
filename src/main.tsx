import React from "react";
import { ErrorBoundary } from "./lib/utils/error-boundary";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { AuthProvider } from "./lib/AuthContext";
import App from "./App";
import "./index.css";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ThemeProvider defaultTheme="dark">
            <App />
            <ThemeToggle />
          </ThemeProvider>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
