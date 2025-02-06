import { create } from "zustand";
import { TimerStorageService } from "@/lib/services/timerStorage";

interface TimerDataState {
  taskName: string;
  projectId: string;
  customerId: string;
  setTaskName: (name: string) => void;
  setProjectId: (id: string) => void;
  setCustomerId: (id: string) => void;
  reset: () => void;
}

export const useTimerDataStore = create<TimerDataState>((set) => {
  // Load initial state from storage
  const savedData = TimerStorageService.getTimerData();

  return {
    taskName: savedData.taskName,
    projectId: savedData.projectId,
    customerId: savedData.customerId,

    setTaskName: (name: string) => {
      set((state) => {
        const newState = { ...state, taskName: name };
        TimerStorageService.saveTimerData({
          taskName: name,
          projectId: state.projectId,
          customerId: state.customerId,
        });
        return newState;
      });
    },

    setProjectId: (id: string) => {
      set((state) => {
        const newState = { ...state, projectId: id };
        TimerStorageService.saveTimerData({
          taskName: state.taskName,
          projectId: id,
          customerId: state.customerId,
        });
        return newState;
      });
    },

    setCustomerId: (id: string) => {
      set((state) => {
        const newState = { ...state, customerId: id, projectId: "" };
        TimerStorageService.saveTimerData({
          taskName: state.taskName,
          projectId: "",
          customerId: id,
        });
        return newState;
      });
    },

    reset: () => {
      set({ taskName: "", projectId: "", customerId: "" });
      TimerStorageService.clearTimerData();
    },
  };
});
