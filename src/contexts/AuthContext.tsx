// src/contexts/AuthContext.tsx
import { createContext, useContext } from 'react';
import { User } from '../models/User';
import { Session } from '@supabase/supabase-js';

// Interfaz LoginResponse
export interface LoginResponse {
  success: boolean;
  requires2FA?: boolean;
  tempToken?: string;
  message?: string;
  access_token?: string;
  refresh_token?: string;
  user?: {
    id: string;
    email: string;
    username?: string;
    full_name?: string;
    avatar?: string;
  } | null;
}

// Interfaz para respuesta de cambio de contraseña
export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  requires_relogin: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  loginWithPasskey: (email: string, credential: any) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  registerWithPasskey: (email: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
  uploadBanner: (file: File) => Promise<string | null>;
  isAuthenticated: boolean;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;  // Para reset desde email
  changePassword: (currentPassword: string, newPassword: string) => Promise<ChangePasswordResponse>;  // NUEVO: Para cambiar contraseña estando logueado
  loginWithToken: (token: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};