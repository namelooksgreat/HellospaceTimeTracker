import React, { Component, ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-4 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-lg font-semibold">Something went wrong</h2>
              <p className="text-muted-foreground">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                className="w-full"
              >
                Reload page
              </Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
