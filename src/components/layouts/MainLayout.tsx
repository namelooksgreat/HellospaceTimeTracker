import React from "react";
import BottomNav from "../BottomNav";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: "timer" | "reports" | "profile";
  onTabChange: (tab: "timer" | "reports" | "profile") => void;
}

export function MainLayout({
  children,
  activeTab,
  onTabChange,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
