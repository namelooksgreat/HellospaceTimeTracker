import React from "react";
import BottomNav from "../BottomNav";
import { useNavigationStore } from "@/store/navigationStore";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab?: "timer" | "reports" | "profile";
  onTabChange?: (tab: "timer" | "reports" | "profile") => void;
}

export function MainLayout({
  children,
  activeTab: propActiveTab,
  onTabChange: propOnTabChange,
}: MainLayoutProps) {
  const { activeTab: storeActiveTab, setActiveTab } = useNavigationStore();

  // Use props if provided, otherwise use store values
  const activeTab = propActiveTab || storeActiveTab;
  const onTabChange = propOnTabChange || setActiveTab;

  return (
    <div className="min-h-screen bg-background">
      {children}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
