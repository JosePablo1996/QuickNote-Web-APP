// ============================================
// IMPORTACIONES CON ALIAS PARA EVITAR CONFLICTOS
// ============================================

import type { Note as NoteModel } from '../models/Note';

// ============================================
// MODELOS PRINCIPALES
// ============================================

export interface Note {
  id: string; // UUID
  title: string;
  content: string;
  color: string; // Hex color
  is_favorite: boolean;
  is_archived: boolean;
  tags: string[];
  user_id?: string | null;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  deleted_at?: string | null;
}

export interface NoteCreate {
  title: string;
  content?: string;
  color?: string;
  is_favorite?: boolean;
  is_archived?: boolean;
  tags?: string[];
  user_id?: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  color?: string;
  is_favorite?: boolean;
  is_archived?: boolean;
  tags?: string[];
  deleted_at?: string | null;
}

export interface NoteFilters {
  is_favorite?: boolean;
  is_archived?: boolean;
  is_deleted?: boolean;
  tags?: string[];
  search_query?: string;
  start_date?: string;
  end_date?: string;
  user_id?: string;
}

export interface NoteStats {
  total: number;
  favorites: number;
  archived: number;
  deleted: number;
  tags: Record<string, number>;
  oldest_note: string;
  newest_note: string;
  average_content_length: number;
  notes_by_day: Array<{ date: string; count: number }>;
}

// ============================================
// ETIQUETAS
// ============================================

export interface Tag {
  name: string;
  count?: number;
  color?: string;
  icon?: string;
  created_at?: string;
}

export interface TagStats {
  name: string;
  count: number;
  color: string;
  icon: string | null;
}

// ============================================
// USUARIO Y AUTENTICACIÓN
// ============================================

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

// ============================================
// PASSKEYS (AUTENTICACIÓN BIOMÉTRICA)
// ============================================

export interface Passkey {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  device_name: string;
  created_at: string;
  last_used?: string;
}

export interface PasskeyRegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  timeout: number;
  excludeCredentials: Array<{
    id: string;
    type: string;
    transports?: string[];
  }>;
  authenticatorSelection: {
    residentKey: string;
    userVerification: string;
    authenticatorAttachment?: string;
  };
  attestation?: string;
}

export interface PasskeyAuthenticationOptions {
  challenge: string;
  allowCredentials?: Array<{
    id: string;
    type: string;
    transports?: string[];
  }>;
  timeout: number;
  userVerification: string;
  rpId?: string;
}

// ============================================
// PERFIL DEL DESARROLLADOR
// ============================================

export interface DeveloperProfile {
  id: string;
  banner_url: string;
  avatar_url: string;
  name: string;
  friends_count: string;
  github_url: string;
  bio?: string;
  email?: string;
  role?: string;
  location?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
  };
  skills?: string[];
  projects?: Array<{
    name: string;
    description: string;
    url: string;
    technologies?: string[];
  }>;
  stats?: {
    total_projects: number;
    total_stars: number;
    total_followers: number;
    total_contributions: number;
  };
  created_at?: string;
  updated_at?: string;
}

// ============================================
// BACKUP
// ============================================

export interface BackupHistory {
  file_name: string;
  timestamp: string;
  total_notes: number;
  note_ids: string[];
  based_on?: string;
  new_notes_ids: string[];
  version?: string;
  file_size?: number;
}

export interface BackupData {
  version: string;
  timestamp: string;
  total_notes: number;
  notes: NoteModel[];
  based_on?: string;
  new_notes?: string[];
  metadata?: {
    app_version: string;
    export_date: string;
    user_id?: string;
  };
}

export interface BackupFileInfo {
  file_name: string;
  file_size: number;
  modified: string;
  note_count: number;
  timestamp: string;
  version: string;
  is_accumulative: boolean;
  new_notes: number;
}

// ============================================
// RESPUESTAS DE API
// ============================================

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
  detail?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// ============================================
// ESTADOS Y PROPS DE COMPONENTES
// ============================================

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface Selectable {
  is_selected: boolean;
  onSelect?: () => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}

export interface Draggable {
  is_dragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export interface Sortable {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export interface Filterable<T> {
  filters: T;
  onFilterChange: (filters: T) => void;
  onClearFilters?: () => void;
}

export interface Paginable {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

// ============================================
// TEMA Y ESTILOS
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  text_secondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface ThemeContextType {
  is_dark_mode: boolean;
  theme_mode: ThemeMode;
  toggle_theme: () => void;
  set_theme_mode: (mode: ThemeMode) => void;
  colors: ThemeColors;
}

// ============================================
// NOTIFICACIONES Y TOASTS
// ============================================

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (props: ToastProps) => string;
  success: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  error: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  info: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  warning: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ============================================
// CALENDARIO
// ============================================

export interface CalendarDay {
  date: Date;
  notes: NoteModel[];
  is_current_month: boolean;
  is_today: boolean;
  is_selected: boolean;
  note_count: number;
}

export interface CalendarWeek {
  days: CalendarDay[];
  week_number: number;
}

export interface CalendarMonth {
  year: number;
  month: number;
  weeks: CalendarWeek[];
  total_notes: number;
}

export type CalendarView = 'month' | 'week' | 'day';

// ============================================
// ESTADÍSTICAS Y MÉTRICAS
// ============================================

export interface DashboardStats {
  total_notes: number;
  total_favorites: number;
  total_archived: number;
  total_deleted: number;
  total_tags: number;
  notes_by_day: Array<{ date: string; count: number }>;
  notes_by_tag: Array<{ tag: string; count: number }>;
  recent_activity: Array<{
    id: string;
    type: 'create' | 'update' | 'delete' | 'restore' | 'favorite' | 'archive';
    note_title: string;
    note_id: string;
    timestamp: string;
  }>;
  activity_summary: {
    today: number;
    this_week: number;
    this_month: number;
  };
}

// ============================================
// CONFIGURACIÓN DE LA APP
// ============================================

export interface AppConfig {
  api_url: string;
  app_name: string;
  app_version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    backups: boolean;
    calendar: boolean;
    tags: boolean;
    trash: boolean;
    favorites: boolean;
    archived: boolean;
    passkeys: boolean;
    sync: boolean;
  };
}

// ============================================
// EVENTOS Y MANEJADORES
// ============================================

export interface NoteEventHandler {
  onCreate?: (note: Note) => void;
  onUpdate?: (note: Note) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onFavorite?: (id: string, is_favorite: boolean) => void;
  onArchive?: (id: string, is_archived: boolean) => void;
  onTagClick?: (tag: string) => void;
}

export interface SelectionEventHandler {
  onSelect?: (ids: string[]) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onDeleteSelected?: () => void;
  onArchiveSelected?: () => void;
  onFavoriteSelected?: () => void;
}

// ============================================
// UTILIDADES DE TYPESCRIPT
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type ID = string;

export type Timestamp = string;

export type JsonValue = 
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type ApiFunction<T = void, R = any> = (params?: T) => Promise<R>;

// ============================================
// ENUMS Y CONSTANTES
// ============================================

export enum SortField {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  TITLE = 'title',
  FAVORITE = 'is_favorite',
  ARCHIVED = 'is_archived',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ViewMode {
  GRID = 'grid',
  LIST = 'list',
}

export enum NoteStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
}

export enum FolderType {
  ALL = 'all',
  FAVORITES = 'favorites',
  ARCHIVED = 'archived',
  TRASH = 'trash',
}

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  PENDING = 'pending',
}

// ============================================
// HOOKS PERSONALIZADOS
// ============================================

export interface UseNotesReturn {
  // Estados
  notes: Note[];
  deletedNotes: Note[];
  isLoading: boolean;
  error: string | null;
  pendingCount: number;
  isApiAvailable: boolean;

  // Operaciones CRUD
  loadNotes: () => Promise<void>;
  loadDeletedNotes: () => Promise<void>;
  createNote: (note: NoteCreate) => Promise<Note | null>;
  updateNote: (id: string, note: NoteUpdate) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<boolean>;
  deleteMultipleNotes: (ids: string[]) => Promise<{ success: number; failed: number }>;
  deleteAllNotes: () => Promise<{ success: boolean; count: number }>;
  
  // Operaciones específicas
  toggleFavorite: (id: string) => Promise<boolean>;
  toggleArchive: (id: string) => Promise<boolean>;
  restoreNote: (id: string) => Promise<boolean>;
  deletePermanently: (id: string) => Promise<boolean>;
  
  // Métodos de filtrado
  getActiveNotes: () => Note[];
  getArchivedNotes: () => Note[];
  getFavoriteNotes: () => Note[];
  emptyTrash: () => Promise<{ success: boolean; count: number }>;
  
  // Utilidades
  getNoteById: (id: string) => Note | undefined;
  getNotesByTag: (tag: string) => Note[];
  searchNotes: (query: string) => Note[];
  getNotesByFolder: (folder: FolderType) => Note[];
  
  // Funciones para ordenamiento y vista
  sortNotes: (notes: Note[], option: SortField, direction?: SortDirection) => Note[];
  getSortedNotesByOption: (option: SortField, direction?: SortDirection) => Note[];
  currentSortOption: SortField;
  currentSortDirection: SortDirection;
  setSortOption: (option: SortField, direction?: SortDirection) => void;
  
  // Sincronización e importación
  syncNotes: () => Promise<{ success: boolean; message: string }>;
  importNotes: (file: File) => Promise<{ success: boolean; count: number }>;
  
  // Vista actual
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  
  // Selección múltiple
  selectedNotes: Set<string>;
  toggleSelection: (id: string) => void;
  toggleSelectAll: (notes: Note[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  selectedCount: number;
  selectAll: () => void;
}

export interface UseThemeReturn {
  theme: ThemeMode;
  isDark: boolean;
  isLight: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  setLight: () => void;
  setDark: () => void;
  colors: ThemeColors;
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
    login: string;
    card: string;
    button: string;
  };
}

export interface UseAuthReturn {
  user: User | null;
  session: any | null;
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

export interface UseBackupReturn {
  backups: BackupFileInfo[];
  history: BackupHistory[];
  isLoading: boolean;
  selectedBackup: BackupFileInfo | null;
  createBackup: (notes: NoteModel[], isAccumulative?: boolean) => Promise<BackupFileInfo | null>;
  restoreBackup: (fileName: string) => Promise<NoteModel[] | null>;
  deleteBackup: (fileName: string) => Promise<boolean>;
  uploadBackup: (file: File) => Promise<BackupFileInfo | null>;
  downloadBackup: (fileName: string) => void;
  refreshBackups: () => void;
  selectBackup: (fileName: string | null) => void;
  getBackupDetails: (fileName: string) => BackupFileInfo | undefined;
  totalBackups: number;
  latestBackup: BackupFileInfo | null;
  totalNotesBackedUp: number;
  lastBackupDate: string | null;
}

export interface UseToastReturn {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number, action?: { label: string; onClick: () => void }) => string;
  success: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  error: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  info: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  warning: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
}

// ============================================
// PROPS DE COMPONENTES
// ============================================

export interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onToggleArchive?: () => void;
  isSelected?: boolean;
  isGridMode?: boolean;
}

export interface NoteFormProps {
  note?: Note | null;
  onSubmit: (note: NoteCreate | NoteUpdate) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface NoteDetailProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onToggleArchive: () => void;
  onTagClick?: (tag: string) => void;
}

export interface HeaderProps {
  selectedCategory: string;
  onCategorySelected: (category: string) => void;
  onLeftMenuTap: () => void;
  onRightMenuTap: () => void;
  availableTags: string[];
}

export interface LeftMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export interface RightMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onViewList?: () => void;
  onSync?: () => void;
  onImport?: () => void;
}

export interface ConnectionStatusProps {
  isOnline?: boolean;
  onRefresh?: () => void;
  pendingSync?: number;
  onRetry?: () => void;
}

export interface TagChipProps {
  tagName: string;
  count?: number;
  onTap?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  clickable?: boolean;
}

export interface TagCloudProps {
  tags: string[];
  tagCounts?: Record<string, number>;
  onTagTap?: (tag: string) => void;
  onTagDelete?: (tag: string) => void;
  selectedTag?: string | null;
  maxTags?: number;
  showCount?: boolean;
  layout?: 'grid' | 'cloud';
  className?: string;
  showSearch?: boolean;
  onClearSelection?: () => void;
}

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'notes' | 'favorites' | 'archived' | 'trash' | 'tags' | 'search' | 'backup' | 'custom';
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'gray';
  fullScreen?: boolean;
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'progress';
  progress?: number;
}

export interface ToastComponentProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface PasskeyLoginProps {
  onSuccess?: (user: any) => void;
  mode?: 'login' | 'register';
}

export interface WelcomeContainerProps {
  redirectDelay?: number;
  autoRedirect?: boolean;
  redirectTo?: string;
  onComplete?: () => void;
}

export interface WelcomeScreenProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onComplete?: () => void;
  onLogout?: () => void;
  autoRedirect?: boolean;
  redirectDelay?: number;
}