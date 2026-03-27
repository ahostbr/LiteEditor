import { create } from "zustand";

export interface DialogButton {
  label: string;
  variant: "primary" | "destructive" | "muted";
}

export interface DialogOptions {
  title: string;
  message: string;
  detail?: string;
  detailMonospace?: boolean;
  buttons: DialogButton[];
  cancelIndex: number;
  icon?: "warning" | "error" | "info";
}

interface DialogState {
  isOpen: boolean;
  options: DialogOptions | null;
  resolve: ((index: number) => void) | null;
  showDialog: (options: DialogOptions) => Promise<number>;
  dismiss: (index: number) => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  isOpen: false,
  options: null,
  resolve: null,

  showDialog: (options) => {
    return new Promise<number>((resolve) => {
      set({ isOpen: true, options, resolve });
    });
  },

  dismiss: (index) => {
    const { resolve } = get();
    if (resolve) resolve(index);
    set({ isOpen: false, options: null, resolve: null });
  },
}));
