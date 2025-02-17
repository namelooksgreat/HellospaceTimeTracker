import { create } from "zustand";

type DialogState = {
  editTimeEntryDialog: {
    isOpen: boolean;
    entryId: string | null;
  };
  saveTimeEntryDialog: {
    isOpen: boolean;
    isManualEntry: boolean;
    taskName: string;
    projectId: string;
    customerId: string;
  };
  setEditTimeEntryDialog: (isOpen: boolean, entryId: string | null) => void;
  setSaveTimeEntryDialog: (
    isOpen: boolean,
    data?: { taskName: string; projectId: string; customerId: string },
    isManualEntry?: boolean,
  ) => void;
};

export const useDialogStore = create<DialogState>((set) => ({
  editTimeEntryDialog: {
    isOpen: false,
    entryId: null,
  },
  saveTimeEntryDialog: {
    isOpen: false,
    isManualEntry: false,
    taskName: "",
    projectId: "",
    customerId: "",
  },
  setEditTimeEntryDialog: (isOpen, entryId) =>
    set({
      editTimeEntryDialog: {
        isOpen,
        entryId,
      },
    }),
  setSaveTimeEntryDialog: (isOpen, data, isManualEntry = false) =>
    set({
      saveTimeEntryDialog: {
        isOpen,
        isManualEntry,
        taskName: data?.taskName || "",
        projectId: data?.projectId || "",
        customerId: data?.customerId || "",
      },
    }),
}));
