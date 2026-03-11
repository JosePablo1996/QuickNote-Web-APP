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

// Perfil de demostración (para cuando no hay backend)
export const DEMO_PROFILE: DeveloperProfile = {
  id: '1',
  banner_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
  avatar_url: 'https://ui-avatars.com/api/?name=José+Pablo+Miranda&background=3B82F6&color=fff&size=200',
  name: 'José Pablo Miranda Quintanilla',
  friends_count: '153',
  github_url: 'https://github.com/JosePablo1996',
  bio: 'Desarrollador Full Stack apasionado por crear aplicaciones modernas y funcionales. Especializado en React, TypeScript, FastAPI y Flutter.',
  email: 'jose.miranda@quicknote.com',
  role: 'Desarrollador Full Stack',
  location: 'Ciudad de México, México',
  website: 'https://josepablo.dev',
  social_links: {
    twitter: 'https://twitter.com/josepablo',
    linkedin: 'https://linkedin.com/in/josepablo',
    instagram: 'https://instagram.com/josepablo',
    github: 'https://github.com/JosePablo1996',
  },
  skills: [
    'React',
    'TypeScript',
    'FastAPI',
    'Python',
    'Supabase',
    'Tailwind CSS',
    'Node.js',
    'Flutter',
    'Dart',
    'PostgreSQL',
  ],
  projects: [
    {
      name: 'QuickNote',
      description: 'Aplicación de notas moderna con sincronización en la nube y autenticación biométrica',
      url: 'https://github.com/JosePablo1996/quicknote',
      technologies: ['React', 'TypeScript', 'FastAPI', 'Supabase'],
    },
    {
      name: 'Portfolio Personal',
      description: 'Mi sitio web personal y blog técnico',
      url: 'https://josepablo.dev',
      technologies: ['React', 'Next.js', 'Tailwind CSS'],
    },
    {
      name: 'Flutter Shop',
      description: 'E-commerce app desarrollada con Flutter',
      url: 'https://github.com/JosePablo1996/flutter-shop',
      technologies: ['Flutter', 'Dart', 'Firebase'],
    },
  ],
  stats: {
    total_projects: 15,
    total_stars: 342,
    total_followers: 89,
    total_contributions: 1245,
  },
  created_at: '2023-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

export const DeveloperProfileUtils = {
  // Crear perfil vacío
  createEmpty: (): DeveloperProfile => ({
    id: '',
    banner_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    avatar_url: 'https://ui-avatars.com/api/?name=Developer&background=3B82F6&color=fff&size=200',
    name: '',
    friends_count: '0',
    github_url: '',
    bio: '',
    email: '',
    role: 'Desarrollador',
    location: '',
    website: '',
    skills: [],
    projects: [],
  }),

  // Validar perfil
  isValid: (profile: Partial<DeveloperProfile>): boolean => {
    return !!(profile.name && profile.github_url);
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

  // Formatear URL de GitHub
  formatGithubUrl: (username: string): string => {
    if (username.startsWith('http')) return username;
    if (username.includes('github.com')) return username;
    return `https://github.com/${username}`;
  },

  // Extraer nombre de usuario de GitHub
  extractGithubUsername: (url: string): string => {
    const match = url.match(/github\.com\/([^/]+)/);
    return match ? match[1] : url;
  },

  // Ordenar proyectos por nombre
  sortProjectsByName: (projects: DeveloperProfile['projects'] = []): DeveloperProfile['projects'] => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  },

  // Ordenar habilidades alfabéticamente
  sortSkills: (skills: string[] = []): string[] => {
    return [...skills].sort((a, b) => a.localeCompare(b));
  },

  // Obtener URL de avatar por defecto
  getDefaultAvatar: (name: string = 'Developer'): string => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&size=200`;
  },

  // Obtener URL de banner por defecto
  getDefaultBanner: (): string => {
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop';
  },
};