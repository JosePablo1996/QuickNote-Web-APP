import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { Menu, MoreVertical, Sun, Moon, Edit, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GreetingWidget from '../ui/GreetingWidget';

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
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Detectar ancho de pantalla
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 768;

  // Logo pequeño y compacto
  const LogoSVG = () => (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 sm:gap-2"
    >
      {/* Icono pequeño */}
      <div className="relative">
        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md flex items-center justify-center">
          <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
        </div>
      </div>
      
      {/* Texto del logo compacto */}
      <div className="flex flex-col">
        <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-amber-200 via-white to-blue-200 bg-clip-text text-transparent">
            Quick
          </span>
          <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Note
          </span>
        </h1>
        <div className="h-0.5 w-8 sm:w-10 md:w-12 bg-gradient-to-r from-amber-400 to-blue-400 rounded-full mt-0.5"></div>
      </div>
    </motion.div>
  );

  return (
    <header className="relative">
      <div className="relative overflow-hidden">
        {/* Fondo más sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 dark:from-blue-800/90 dark:via-purple-800/90 dark:to-pink-800/90 backdrop-blur-md"></div>
        
        {/* Efectos decorativos reducidos */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="absolute -top-32 -right-32 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-32 -left-32 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl"></div>
        
        {/* Contenido compacto */}
        <div className="relative z-10 px-3 py-2 sm:px-4 sm:py-2.5">
          
          {/* Fila superior compacta */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            
            {/* Botón izquierdo más pequeño */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLeftMenuTap}
              className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/30"
              aria-label="Abrir menú principal"
            >
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </motion.button>

            {/* Logo - centrado solo en móvil muy pequeño */}
            <div className={windowWidth < 480 ? "absolute left-1/2 transform -translate-x-1/2" : ""}>
              <LogoSVG />
            </div>

            {/* Botones derecha compactos */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Theme Toggle más pequeño */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/30"
                aria-label="Cambiar tema"
              >
                {isDarkMode ? (
                  <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                ) : (
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                )}
              </motion.button>

              {/* Botón right menu - solo tablet/desktop */}
              {!isMobile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRightMenuTap}
                  className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/30"
                  aria-label="Abrir menú de opciones"
                >
                  <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </motion.button>
              )}

              {/* Botón menú móvil para opciones */}
              {isMobile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/30"
                >
                  {showMobileMenu ? (
                    <X className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <MoreVertical className="w-3.5 h-3.5 text-white" />
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Menú móvil compacto */}
          <AnimatePresence>
            {isMobile && showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-2 overflow-hidden"
              >
                <div className="flex gap-2 p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <button
                    onClick={() => {
                      onRightMenuTap();
                      setShowMobileMenu(false);
                    }}
                    className="flex-1 text-center px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white text-xs"
                  >
                    📋 Opciones
                  </button>
                  <button
                    onClick={() => {
                      toggleTheme();
                      setShowMobileMenu(false);
                    }}
                    className="flex-1 text-center px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white text-xs"
                  >
                    {isDarkMode ? '☀️ Claro' : '🌙 Oscuro'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Widget de saludo con márgenes reducidos */}
          <div className="mb-2 sm:mb-3">
            <GreetingWidget 
              userName={user?.name}
              userAvatar={user?.avatar}
            />
          </div>

          {/* Selector de etiquetas compacto */}
          <div className="px-0 sm:px-1">
            <div className="relative">
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => onCategorySelected(e.target.value)}
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white text-xs sm:text-sm appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/50 transition-all duration-200"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '0.9rem',
                  paddingRight: '2rem',
                }}
              >
                <option value="Todas" className="bg-gray-800 text-white text-xs sm:text-sm">
                  📋 Todas las notas
                </option>
                {availableTags.slice(0, isMobile ? 10 : 30).map((tag) => (
                  <option key={tag} value={tag} className="bg-gray-800 text-white text-xs sm:text-sm">
                    🏷️ {tag}
                  </option>
                ))}
                {availableTags.length > (isMobile ? 10 : 30) && (
                  <option disabled className="bg-gray-800 text-gray-400 text-xs sm:text-sm">
                    + {availableTags.length - (isMobile ? 10 : 30)} más
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Mensaje sin etiquetas más compacto */}
          {availableTags.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] sm:text-xs text-center mt-1.5 sm:mt-2 italic text-white/50"
            >
              No hay etiquetas
            </motion.p>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;