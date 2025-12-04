import { createContext } from 'react';
import type { User } from '../data/userMockData';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

