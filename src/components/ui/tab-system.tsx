import { cn } from "@/lib/utils";

interface TabSystemProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (id: string) => void;
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

export function TabSystem({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
  size = "md",
  fullWidth = true,
  className,
}: TabSystemProps) {
  const baseStyles =
    "flex items-center justify-center transition-all duration-300";

  const sizeStyles = {
    sm: "h-10 text-sm",
    md: "h-12 text-base",
    lg: "h-14 text-lg",
  };

  const containerStyles = {
    default: "bg-muted/50 p-1 rounded-xl",
    pills: "gap-2",
    underline: "border-b border-border",
  };

  const tabStyles = {
    default: cn(
      "flex-1 rounded-lg",
      "hover:bg-accent/50",
      "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
    ),
    pills: cn(
      "px-6 rounded-full",
      "hover:bg-accent/50",
      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
    ),
    underline: cn(
      "px-6 -mb-px border-b-2 border-transparent",
      "hover:text-foreground",
      "data-[state=active]:border-primary data-[state=active]:text-foreground",
    ),
  };

  return (
    <div
      className={cn(
        "flex",
        fullWidth && "w-full",
        containerStyles[variant],
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          data-state={activeTab === tab.id ? "active" : "inactive"}
          className={cn(
            baseStyles,
            sizeStyles[size],
            tabStyles[variant],
            "gap-2 font-medium",
            activeTab !== tab.id && "text-muted-foreground",
          )}
        >
          {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
