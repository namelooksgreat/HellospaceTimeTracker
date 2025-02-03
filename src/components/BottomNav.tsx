import { Clock, BarChart2, Settings } from "lucide-react";
import { useState } from "react";

function BottomNav() {
  const [activeTab, setActiveTab] = useState<"timer" | "reports" | "settings">(
    "timer",
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-2">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <button
          onClick={() => setActiveTab("timer")}
          className={`flex flex-col items-center p-2 ${activeTab === "timer" ? "text-primary" : "text-muted-foreground"}`}
        >
          <Clock className="h-6 w-6" />
          <span className="text-xs mt-1">Timer</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex flex-col items-center p-2 ${activeTab === "reports" ? "text-primary" : "text-muted-foreground"}`}
        >
          <BarChart2 className="h-6 w-6" />
          <span className="text-xs mt-1">Reports</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center p-2 ${activeTab === "settings" ? "text-primary" : "text-muted-foreground"}`}
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </div>
  );
}

export default BottomNav;
