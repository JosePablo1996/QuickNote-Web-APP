import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Image as ImageIcon,
  Star,
  Archive,
  Tag,
  FileText,
  Heart,
  CheckCircle
} from 'lucide-react'; // Eliminados MapPin, LinkIcon, Globe, Phone

const ProfileUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, updateProfile, uploadAvatar, uploadBanner, isLoading } = useAuth();
  const { notes } = useNotes();
  const { success, error: showError } = useToast();
  
  // Estados para los campos editables
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  
  // Estados para imágenes
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Calcular estadísticas
  const userStats = {
    totalNotes: notes.length,
    totalFavorites: notes.filter(n => n.is_favorite).length,
    totalArchived: notes.filter(n => n.is_archived).length,
    totalTags: new Set(notes.flatMap(n => n.tags || [])).size,
    notesThisMonth: notes.filter(n => {
      const date = new Date(n.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
  };

  // Cargar datos del usuario cuando estén disponibles
  useEffect(() => {
    if (user) {
      console.log('👤 Usuario cargado:', user);
      
      setEditedName(user.name || '');
      setEditedBio(user.user_metadata?.bio || '');
      
      // Forzar actualización de las previews
      if (user.avatar && user.avatar !== 'https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff&size=200') {
        setAvatarPreview(user.avatar);
      } else {
        setAvatarPreview('');
      }
      
      if (user.banner && user.banner !== 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop') {
        setBannerPreview(user.banner);
      } else {
        setBannerPreview('');
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando perfil..." />
      </div>
    );
  }

  // Manejar selección de avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError('La imagen no debe superar los 2MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar selección de banner
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('El banner no debe superar los 5MB');
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Subir avatar
  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    
    setIsUploadingAvatar(true);
    try {
      const url = await uploadAvatar(avatarFile);
      
      if (url) {
        success('✅ Avatar actualizado correctamente');
        setAvatarFile(null);
        // Recargar usuario después de 1 segundo
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showError('Error al actualizar el avatar');
      }
    } catch (error) {
      showError('Error al subir el avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Subir banner
  const handleUploadBanner = async () => {
    if (!bannerFile) return;
    
    setIsUploadingBanner(true);
    
    try {
      const url = await uploadBanner(bannerFile);
      
      if (url) {
        success('✅ Banner actualizado correctamente');
        setBannerFile(null);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showError('Error al actualizar el banner');
      }
    } catch (error) {
      showError('Error al subir el banner');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Guardar cambios del perfil
  const handleSaveProfile = async () => {
    const updated = await updateProfile({
      name: editedName,
      user_metadata: {
        bio: editedBio,
      },
    });

    if (updated) {
      success('✅ Perfil actualizado correctamente');
      setIsEditing(false);
    } else {
      showError('Error al actualizar el perfil');
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditedName(user.name || '');
    setEditedBio(user.user_metadata?.bio || '');
    setAvatarPreview(user.avatar || '');
    setBannerPreview(user.banner || '');
    setAvatarFile(null);
    setBannerFile(null);
    setIsEditing(false);
  };

  // Formatear fecha de registro
  const formatJoinDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtener iniciales para avatar por defecto
  const getInitials = () => {
    if (!user.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Obtener color de avatar basado en nombre
  const getAvatarGradient = () => {
    if (!user.name) return 'from-blue-500 to-purple-600';
    
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
      'from-purple-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-cyan-500 to-blue-600',
    ];
    
    const charCodeSum = user.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return gradients[charCodeSum % gradients.length];
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
      {/* Header con estilo glass */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                aria-label="Volver"
                title="Volver"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Mi Perfil
                </h1>
              </div>
            </div>

            {/* Botones de acción del header */}
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  aria-label="Editar perfil"
                  title="Editar perfil"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar perfil</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center gap-2"
                    aria-label="Cancelar edición"
                    title="Cancelar edición"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancelar</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    aria-label="Guardar cambios"
                    title="Guardar cambios"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Guardar</span>
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjeta de perfil con estilo glass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-2xl"
        >
          {/* Banner con altura mejorada */}
          <div className="relative h-64 sm:h-72 md:h-80">
            {bannerPreview ? (
              <img 
                src={bannerPreview} 
                alt="Banner de perfil" 
                className="w-full h-full object-cover"
                onError={() => setBannerPreview('')}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-r ${getAvatarGradient()} opacity-30`}>
                <ImageIcon className="w-16 h-16 text-white/50" />
              </div>
            )}
            
            {/* Botón para cambiar banner (solo en edición) */}
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => bannerInputRef.current?.click()}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2"
                  disabled={isUploadingBanner}
                  aria-label="Cambiar banner"
                  title="Cambiar banner"
                >
                  {isUploadingBanner ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span>Cambiar banner</span>
                    </>
                  )}
                </motion.button>
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={handleBannerChange}
                  accept="image/*"
                  className="hidden"
                  aria-label="Subir imagen de banner"
                  title="Subir imagen de banner"
                />
              </div>
            )}
            
            {/* Botón de guardar banner flotante */}
            {bannerFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 right-4 z-10"
              >
                <button
                  onClick={handleUploadBanner}
                  disabled={isUploadingBanner}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  aria-label="Guardar banner"
                  title="Guardar banner"
                >
                  {isUploadingBanner ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar banner</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>

          {/* Avatar - Posicionado sobre el banner */}
          <div className="relative px-6 pb-8">
            <div className="flex flex-col items-center -mt-16 sm:-mt-20">
              <div className="relative group">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative"
                >
                  <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl bg-gradient-to-br ${getAvatarGradient()}`}>
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        onError={() => setAvatarPreview('')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                        {getInitials()}
                      </div>
                    )}
                  </div>
                  
                  {/* Indicador de estado */}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg" />
                </motion.div>
                
                {/* Botón para cambiar avatar (solo en edición) */}
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => avatarInputRef.current?.click()}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                      disabled={isUploadingAvatar}
                      aria-label="Cambiar avatar"
                      title="Cambiar avatar"
                    >
                      {isUploadingAvatar ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </motion.button>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                      aria-label="Subir imagen de avatar"
                      title="Subir imagen de avatar"
                    />
                  </div>
                )}
              </div>

              {/* Botón de guardar avatar flotante */}
              {avatarFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3"
                >
                  <button
                    onClick={handleUploadAvatar}
                    disabled={isUploadingAvatar}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                    aria-label="Guardar avatar"
                    title="Guardar avatar"
                  >
                    {isUploadingAvatar ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Guardar avatar</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Información del usuario debajo del avatar */}
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name || 'Usuario'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {user.email}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1 border border-green-500/30">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Online
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium flex items-center gap-1 border border-blue-500/30">
                  <Calendar className="w-3 h-3" />
                  {formatJoinDate(user.created_at).split('de')[0]}
                </span>
              </div>
            </div>

            {/* Grid de información personal con iconos - SIMPLIFICADO */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre completo */}
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Nombre completo</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="Tu nombre"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name || 'No especificado'}
                    </p>
                  )}
                </div>
              </div>

              {/* Correo electrónico */}
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Mail className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Correo electrónico</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Biografía */}
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 flex items-center gap-3 md:col-span-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Biografía</p>
                  {isEditing ? (
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={2}
                      className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-purple-500 text-sm resize-none"
                      placeholder="Cuéntanos sobre ti..."
                    />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {editedBio || 'Sin biografía'}
                    </p>
                  )}
                </div>
              </div>

              {/* Fecha de registro */}
              <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Miembro desde</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatJoinDate(user.created_at)}
                  </p>
                </div>
              </div>

              {/* Estado de la cuenta */}
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estado de la cuenta</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Activa</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas del usuario */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Estadísticas de actividad
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 text-center overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
                  <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalNotes}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notas totales</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 text-center overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 to-orange-500/0 group-hover:from-yellow-500/10 group-hover:to-orange-500/10 transition-all duration-300" />
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalFavorites}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Favoritas</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-xl border border-teal-500/20 text-center overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 to-cyan-500/0 group-hover:from-teal-500/10 group-hover:to-cyan-500/10 transition-all duration-300" />
                  <Archive className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalArchived}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Archivadas</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 text-center overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-300" />
                  <Tag className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalTags}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Etiquetas</p>
                </motion.div>
              </div>

              {/* Resumen del mes */}
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notas este mes
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-purple-500">{userStats.notesThisMonth}</span>
                </div>
              </div>
            </div>

            {/* Footer con créditos */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-8">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                QuickNote · Desarrollado con ❤️ por José Pablo Miranda Quintanilla
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileUserPage;