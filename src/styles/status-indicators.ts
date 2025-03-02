// Durum göstergeleri için tutarlı renk ve stil tanımları

export const timerStatusColors = {
  // Zamanlayıcı durumları için renk kodları
  running: {
    background: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: "text-emerald-500",
    ring: "ring-emerald-500/30",
    gradient: "from-emerald-500/30 via-teal-500/30 to-green-500/30",
    pulse: "animate-pulse-emerald",
    indicator: "bg-emerald-500",
  },
  paused: {
    background: "bg-amber-500/20",
    border: "border-amber-500/40",
    text: "text-amber-700 dark:text-amber-400",
    icon: "text-amber-500",
    ring: "ring-amber-500/30",
    gradient: "from-amber-500/30 via-yellow-500/30 to-orange-500/30",
    pulse: "animate-pulse-amber",
    indicator: "bg-amber-500",
  },
  stopped: {
    background: "bg-blue-500/20",
    border: "border-blue-500/40",
    text: "text-blue-700 dark:text-blue-400",
    icon: "text-blue-500",
    ring: "ring-blue-500/30",
    gradient: "from-blue-500/30 via-indigo-500/30 to-purple-500/30",
    pulse: "",
    indicator: "bg-blue-500",
  },
  completed: {
    background: "bg-purple-500/20",
    border: "border-purple-500/40",
    text: "text-purple-700 dark:text-purple-400",
    icon: "text-purple-500",
    ring: "ring-purple-500/30",
    gradient: "from-purple-500/30 via-violet-500/30 to-indigo-500/30",
    pulse: "",
    indicator: "bg-purple-500",
  },
};

export const entryStatusStyles = {
  // Zaman girişleri için stil sınıfları
  active: {
    card: "border-l-4 border-l-emerald-500",
    indicator: "bg-emerald-500",
    shadow: "shadow-sm shadow-emerald-500/10",
    highlight: "bg-emerald-50 dark:bg-emerald-500/5",
  },
  paused: {
    card: "border-l-4 border-l-amber-500",
    indicator: "bg-amber-500",
    shadow: "shadow-sm shadow-amber-500/10",
    highlight: "bg-amber-50 dark:bg-amber-500/5",
  },
  completed: {
    card: "border-l-4 border-l-blue-500",
    indicator: "bg-blue-500",
    shadow: "shadow-sm shadow-blue-500/10",
    highlight: "bg-blue-50 dark:bg-blue-500/5",
  },
  overdue: {
    card: "border-l-4 border-l-red-500",
    indicator: "bg-red-500",
    shadow: "shadow-sm shadow-red-500/10",
    highlight: "bg-red-50 dark:bg-red-500/5",
  },
};

export const statusIndicators = {
  // Durum göstergeleri için bileşen stilleri
  dot: {
    base: "w-2.5 h-2.5 rounded-full ring-1 ring-inset",
    running: "bg-emerald-500 ring-emerald-500/50 animate-pulse",
    paused: "bg-amber-500 ring-amber-500/50",
    stopped: "bg-blue-500 ring-blue-500/50",
    completed: "bg-purple-500 ring-purple-500/50",
    overdue: "bg-red-500 ring-red-500/50",
    active: "bg-emerald-500 ring-emerald-500/50 animate-pulse", // Add active status
  },
  badge: {
    base: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
    running:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400",
    paused:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400",
    stopped: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
    completed:
      "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400",
    overdue: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
    active:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400", // Add active status
  },
  pill: {
    base: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
    running:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    paused:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    stopped:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
    completed:
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20",
    overdue:
      "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
    active:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20", // Add active status
  },
};
