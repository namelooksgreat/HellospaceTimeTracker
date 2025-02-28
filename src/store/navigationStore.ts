import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type NavigationState = {
  activeTab: "timer" | "reports" | "profile";
  setActiveTab: (tab: "timer" | "reports" | "profile") => void;
};

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      activeTab: "timer",
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: "navigation-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
