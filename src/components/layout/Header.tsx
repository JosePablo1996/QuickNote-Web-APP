import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Menu, MoreVertical, Sun, Moon, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  selectedCategory: string;
  onCategorySelected: (category: string) => void;
  onLeftMenuTap: () => void;
  onRightMenuTap: () => void;
  availableTags: string[];
}

const Header: React.FC<HeaderProps> = ({
  selectedCategory,
  onCategorySelected,
  onLeftMenuTap,
  onRightMenuTap,
  availableTags,
}) => {
  const { isDarkMode, toggleTheme } = useTheme(); // ✅ CORREGIDO: useTheme devuelve isDarkMode, no theme
  const { user } = useAuth();

  // Obtener saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { message: '¡Buenos días!', icon: '☀️' };
    } else if (hour >= 12 && hour < 19) {
      return { message: '¡Buenas tardes!', icon: '🌤️' };
    } else {
      return { message: '¡Buenas noches!', icon: '🌙' };
    }
  };

  const greeting = getGreeting();

  return (
    <header className="relative">
      {/* Header principal con estilo glassmorphism */}
      <div className="relative overflow-hidden">
        {/* Fondo con gradiente y efecto glass */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 dark:from-blue-800/90 dark:via-purple-800/90 dark:to-pink-800/90 backdrop-blur-md"></div>
        
        {/* Efectos decorativos */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
        
        {/* Contenido */}
        <div className="relative z-10 px-4 py-4">
          {/* Fila superior */}
          <div className="flex items-center justify-between mb-4">
            {/* Botón izquierdo (menú) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLeftMenuTap}
              className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/30"
              aria-label="Abrir menú principal"
              title="Menú principal"
            >
              <Menu className="w-5 h-5 text-white" />
            </motion.button>

            {/* Logo y nombre de la app - MEJORADO como en la imagen */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              {/* Icono de notas estilizado */}
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                {/* Efecto de sombra */}
                <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl bg-black/20 blur-sm -z-10"></div>
              </div>
              
              {/* Texto del logo con gradiente */}
              <div className="flex flex-col">
                <h1 className="text-3xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-amber-200 via-white to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
                    Quick
                  </span>
                  <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-lg">
                    Note
                  </span>
                </h1>
                {/* Línea decorativa */}
                <div className="h-0.5 w-16 bg-gradient-to-r from-amber-400 to-blue-400 rounded-full mt-1"></div>
              </div>
            </motion.div>

            {/* Botones derecho */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle - AHORA SOL/LUNA según el modo */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/30"
                aria-label="Cambiar tema"
                title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-white" /> // 🌞 Sol en modo oscuro (para cambiar a claro)
                ) : (
                  <Moon className="w-5 h-5 text-white" /> // 🌙 Luna en modo claro (para cambiar a oscuro)
                )}
              </motion.button>

              {/* Botón derecho (menú de opciones) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRightMenuTap}
                className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/30"
                aria-label="Abrir menú de opciones"
                title="Menú de opciones"
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Mensaje de saludo - Estilo mejorado */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
            >
              <span className="text-lg" aria-hidden="true">{greeting.icon}</span>
              <span className="text-sm font-medium text-white">
                {greeting.message}
                {user?.name && `, ${user.name.split(' ')[0]}`}
              </span>
            </motion.div>
          </div>

          {/* Dropdown de etiquetas */}
          <div className="px-2">
            <label htmlFor="category-select" className="sr-only">
              Seleccionar categoría de notas
            </label>
            <div className="relative">
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => onCategorySelected(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.2rem',
                }}
              >
                <option value="Todas" className="bg-gray-800 text-white">📋 Todas las notas</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag} className="bg-gray-800 text-white">
                    🏷️ {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mensaje si no hay etiquetas */}
          {availableTags.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-center mt-3 italic text-white/60"
              role="status"
            >
              No hay etiquetas disponibles
            </motion.p>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;