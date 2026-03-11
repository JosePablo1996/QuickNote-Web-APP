import { Note } from './Note';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  banner?: string;
  role: 'user' | 'admin' | 'developer';
  created_at: string;
  updated_at?: string;
  last_login?: string;
  is_active: boolean;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    banner_url?: string;
    [key: string]: any;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  settings?: UserSettings;
  stats?: UserStats;
}

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: boolean;
  default_note_color?: string;
  auto_save?: boolean;
  default_view?: 'grid' | 'list';
  sort_by?: 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface UserStats {
  total_notes: number;
  total_favorites: number;
  total_archived: number;
  total_deleted: number;
  total_tags: number;
  notes_created_today: number;
  notes_created_this_week: number;
  notes_created_this_month: number;
  average_note_length: number;
  most_used_tags: Array<{ tag: string; count: number }>;
  last_active: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirm_password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

export const UserUtils = {
  // Crear usuario vacío
  createEmpty: (): User => ({
    id: '',
    email: '',
    name: '',
    avatar: 'https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff&size=200',
    banner: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    role: 'user',
    created_at: new Date().toISOString(),
    is_active: true,
    settings: {
      theme: 'system',
      language: 'es',
      notifications: true,
      default_note_color: '#3B82F6',
      auto_save: true,
      default_view: 'grid',
      sort_by: 'created_at',
      sort_order: 'desc',
    },
  }),

  // Validar email
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar contraseña
  isValidPassword: (password: string): boolean => {
    // Mínimo 8 caracteres, al menos una letra y un número
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  },

  // Validar que las contraseñas coincidan
  doPasswordsMatch: (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  },

  // Obtener iniciales del nombre
  getInitials: (name: string): string => {
    if (!name || name.length === 0) return '?';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  },

  // Formatear nombre de usuario (email → nombre)
  formatNameFromEmail: (email: string): string => {
    const parts = email.split('@')[0].split(/[._-]/);
    return parts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  },

  // Obtener color de avatar basado en nombre
  getAvatarColor: (name: string): string => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
    ];
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  },

  // Guardar usuario en localStorage
  saveUserToStorage: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Obtener usuario de localStorage
  getUserFromStorage: (): User | null => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Eliminar usuario de localStorage
  removeUserFromStorage: (): void => {
    localStorage.removeItem('user');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    return !!UserUtils.getUserFromStorage();
  },

  // Actualizar estadísticas con nuevas notas
  updateStats: (stats: UserStats, notes: Note[]): UserStats => {
    const now = new Date();
    const today = now.toDateString();
    const thisWeek = new Date(now);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(now);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const notesToday = notes.filter(n => 
      new Date(n.created_at).toDateString() === today
    ).length;

    const notesThisWeek = notes.filter(n => 
      new Date(n.created_at) >= thisWeek
    ).length;

    const notesThisMonth = notes.filter(n => 
      new Date(n.created_at) >= thisMonth
    ).length;

    const tagCount: Record<string, number> = {};
    notes.forEach(note => {
      note.tags?.forEach((tag: string) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const mostUsedTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalContentLength = notes.reduce((sum, n) => sum + n.content.length, 0);
    const averageNoteLength = notes.length > 0 
      ? Math.round(totalContentLength / notes.length)
      : 0;

    return {
      ...stats,
      total_notes: notes.length,
      total_favorites: notes.filter(n => n.is_favorite).length,
      total_archived: notes.filter(n => n.is_archived).length,
      total_deleted: notes.filter(n => n.deleted_at).length,
      total_tags: Object.keys(tagCount).length,
      notes_created_today: notesToday,
      notes_created_this_week: notesThisWeek,
      notes_created_this_month: notesThisMonth,
      average_note_length: averageNoteLength,
      most_used_tags: mostUsedTags,
      last_active: new Date().toISOString(),
    };
  },
};