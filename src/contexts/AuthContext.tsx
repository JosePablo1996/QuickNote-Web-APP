import { createContext } from 'react';
import { User } from '../models/User';
import { Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithPasskey: (email: string, credential: any) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  registerWithPasskey: (email: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
  uploadBanner: (file: File) => Promise<string | null>;
  isAuthenticated: boolean;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  loginWithToken: (token: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);