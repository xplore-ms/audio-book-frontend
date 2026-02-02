import { create } from 'zustand';

interface UIState {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  playingJobId: string | null;
  setPlayingJobId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set: any) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  playingJobId: null,
  setPlayingJobId: (id: string | null) => set({ playingJobId: id }),
}));
