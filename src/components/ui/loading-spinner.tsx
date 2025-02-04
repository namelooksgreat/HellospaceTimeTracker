import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
