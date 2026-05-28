// src/contexts/components/settings/UserProfileCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, BadgeCheck, Edit } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';

interface UserProfileCardProps {
  onEditProfile?: () => void;
  showEditButton?: boolean;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  onEditProfile, 
  showEditButton = false 
}) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [avatarError, setAvatarError] = useState(false);

  // Obtener nombre completo del usuario - CORREGIDO: usando 'name' en lugar de 'full_name'
  const fullName = user?.name || user?.email?.split('@')[0] || 'Usuario';
  const email = user?.email || '';
  const avatarUrl = user?.avatar || '';

  const getInitials = (name?: string) => {
    if (!name || name === 'Usuario') return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name?: string) => {
    const colors = [
      'from-purple-500 to-indigo-500',
      'from-violet-500 to-purple-500',
      'from-blue-500 to-indigo-500',
      'from-fuchsia-500 to-purple-500',
      'from-amber-500 to-orange-500',
      'from-emerald-500 to-teal-500',
    ];
    const index = (name || 'user').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[Math.abs(index) % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group mb-6"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
      
      <div className={`relative rounded-2xl p-6 md:p-8 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95' 
          : 'bg-gradient-to-br from-white/95 to-gray-50/95'
      } backdrop-blur-lg border-2 border-white/20 dark:border-gray-700/30`}>
        
        {/* Contenido centrado */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar cuadrado con esquinas redondeadas */}
          <div className="relative mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl blur-md opacity-60" />
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${getAvatarColor(fullName)} flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden`}
            >
              {(avatarUrl && !avatarError) ? (
                <img 
                  src={avatarUrl} 
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {getInitials(fullName)}
                </span>
              )}
            </motion.div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-1.5 shadow-lg">
              <BadgeCheck className="w-5 h-5 text-white" />
            </div>
            {showEditButton && onEditProfile && (
              <button
                onClick={onEditProfile}
                className="absolute -top-1 -left-1 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                aria-label="Editar perfil"
                title="Editar perfil"
              >
                <Edit className="w-3 h-3 text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>

          {/* Nombre del usuario */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {fullName}
          </h2>
          
          {/* Email */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {email || 'Sin correo'}
            </span>
          </div>

          {/* Badge verificado */}
          <div className="inline-flex items-center gap-1 px-3 py-1 mt-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30">
            <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Cuenta verificada</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileCard;