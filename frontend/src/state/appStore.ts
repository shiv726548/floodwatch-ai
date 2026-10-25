import { create } from 'zustand';

export type DemoRole = 'Public' | 'Volunteer' | 'Coordinator' | 'Healthcare' | 'Admin';

type AppState = {
  role: DemoRole;
  isLight: boolean;
  demoStep: number;
  demoPlaying: boolean;
  isAuthenticated: boolean;
  setRole: (role: DemoRole) => void;
  toggleTheme: () => void;
  setDemoStep: (step: number) => void;
  setDemoPlaying: (playing: boolean) => void;
  loginWithGoogle: () => void;
  logout: () => void;
  resetDemo: () => void;
};

const AUTH_KEY = 'floodwatch-demo-auth';

const loadAuth = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(AUTH_KEY) === 'true';
};

export const useAppStore = create<AppState>((set) => ({
  role: 'Coordinator',
  isLight: false,
  demoStep: -1,
  demoPlaying: false,
  isAuthenticated: loadAuth(),
  setRole: (role) => set({ role }),
  toggleTheme: () => set((state) => ({ isLight: !state.isLight })),
  setDemoStep: (demoStep) => set({ demoStep }),
  setDemoPlaying: (demoPlaying) => set({ demoPlaying }),
  loginWithGoogle: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_KEY, 'true');
    }
    set({ isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_KEY, 'false');
    }
    set({ isAuthenticated: false });
  },
  resetDemo: () => set({ demoStep: -1, demoPlaying: false }),
}));