import { ThemeToggle } from "../theme-toggle";
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
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Main content - Scrollable area */}
      <main className="flex-1 overflow-y-auto overscroll-none">
        <div className="pb-20 min-h-full">
          <div className="container max-w-5xl mx-auto px-4 py-6">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-[4.5rem] z-50 bg-background/95 dark:bg-background/90 backdrop-blur-xl border-t border-border/50 transition-colors duration-300 safe-area-bottom">
        <div className="h-full container max-w-5xl mx-auto">
          <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      </div>
    </div>
  );
}
