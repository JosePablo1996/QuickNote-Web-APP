// src/pages/RegisterPage.tsx
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { 
  Eye, EyeOff, Mail, Lock, User, 
  Camera, Image, Shield, ChevronRight,
  CheckCircle, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme(); // Esto se usa en las clases CSS
  const { register, isLoading, error: authError } = useAuth();
  const { success, error: showError } = useToast();
  
  // Campos del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para imágenes
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estado para errores locales
  const [localError, setLocalError] = useState<string | null>(null);

  // Calcular fortaleza de la contraseña
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength === 0) return '';
    if (strength < 40) return 'Débil';
    if (strength < 70) return 'Media';
    return 'Fuerte';
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor = getStrengthColor(passwordStrength);
  const strengthText = getStrengthText(passwordStrength);

  // Validar contraseñas coinciden
  const passwordsMatch = password === confirmPassword;
  const showPasswordMatchError = confirmPassword.length > 0 && !passwordsMatch;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!firstName.trim() || !lastName.trim()) {
      setLocalError('Por favor ingresa tu nombre completo');
      return;
    }

    if (!email.trim()) {
      setLocalError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!passwordsMatch) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();
    
    // ✅ CORREGIDO: register ahora recibe solo 3 argumentos (email, password, name)
    const isSuccess = await register(email, password, fullName);
    
    if (isSuccess) {
      success('✅ ¡Registro exitoso! Por favor verifica tu correo electrónico');
      navigate('/login');
    } else {
      setLocalError(authError || 'Error al registrarse');
    }
  };

  const loading = isLoading;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500`}>
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <motion.form 
            onSubmit={handleSubmit} 
            className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Efecto de fondo decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Sección izquierda - Logo y título */}
                <div className="flex-1 text-center md:text-left">
                  {/* Logo de block de notas centrado */}
                  <div className="flex items-center justify-center md:justify-center mb-6">
                    <motion.div 
                      className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-2xl relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.2 
                      }}
                    >
                      <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
                      <svg 
                        className="h-12 w-12 text-white relative z-10" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 2v4h4" 
                        />
                      </svg>
                    </motion.div>
                  </div>
                  
                  {/* Nombre de la aplicación */}
                  <motion.div 
                    className="mb-4 text-center md:text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-2">
                      <span className="bg-gradient-to-r from-amber-200 via-white to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
                        Quick
                      </span>
                      <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-lg">
                        Note
                      </span>
                    </h1>
                    <motion.div 
                      className="h-1 w-24 bg-gradient-to-r from-amber-400 to-blue-400 rounded-full mx-auto md:mx-auto mt-2"
                      initial={{ width: 0 }}
                      animate={{ width: 96 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    />
                  </motion.div>
                  
                  <motion.h2 
                    className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-4 tracking-tight text-center md:text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    Crear cuenta
                  </motion.h2>
                  
                  <motion.p 
                    className="text-blue-100 text-lg font-light max-w-md text-center md:text-center mx-auto md:mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    Únete a QuickNote y personaliza tu perfil
                  </motion.p>
                  
                  {/* Características */}
                  <motion.div 
                    className="mt-8 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <div className="flex items-center justify-center md:justify-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                      </div>
                      <span className="text-blue-100">Notas ilimitadas</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                      </div>
                      <span className="text-blue-100">Acceso desde cualquier dispositivo</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                      </div>
                      <span className="text-blue-100">100% gratuito</span>
                    </div>
                  </motion.div>
                </div>

                {/* Sección derecha - Formulario */}
                <div className="flex-1 w-full">
                  <AnimatePresence>
                    {(localError || authError) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-500/25 border border-red-400/40 text-red-100 px-6 py-4 rounded-2xl mb-6 backdrop-blur-sm"
                      >
                        <div className="flex items-center">
                          <XCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                          <p className="text-sm font-medium">{localError || authError}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Campos del Formulario */}
                  <div className="space-y-5">
                    {/* Banner - Estilo Facebook (sin avatar superpuesto) */}
                    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm border-2 border-white/30">
                      {/* Imagen de banner */}
                      {bannerFile ? (
                        <img 
                          src={bannerPreview} 
                          alt="Banner" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-12 w-12 text-white/50" />
                        </div>
                      )}
                      
                      {/* Botón para cambiar banner (esquina inferior derecha) */}
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-300 border border-white/30"
                        aria-label="Cambiar banner"
                        title="Cambiar banner"
                      >
                        <Camera className="h-5 w-5" />
                      </button>
                      
                      {/* Input oculto para banner */}
                      <input
                        id="banner-upload"
                        type="file"
                        ref={bannerInputRef}
                        onChange={handleBannerChange}
                        accept="image/*"
                        className="hidden"
                        aria-label="Subir imagen de banner"
                        title="Subir imagen de banner"
                      />
                    </div>

                    {/* Avatar - Separado del banner, centrado debajo */}
                    <div className="flex flex-col items-center -mt-8">
                      <div className="relative">
                        <div className="w-28 h-28 rounded-full border-4 border-white/50 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl">
                          {avatarFile ? (
                            <img 
                              src={avatarPreview} 
                              alt="Avatar" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="h-14 w-14 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Botón para cambiar avatar (círculo pequeño) */}
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 border-2 border-white transition-all duration-300"
                          aria-label="Cambiar avatar"
                          title="Cambiar avatar"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Input oculto para avatar */}
                      <input
                        id="avatar-upload"
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                        aria-label="Subir imagen de avatar"
                        title="Subir imagen de avatar"
                      />
                    </div>

                    {/* Texto informativo del avatar */}
                    <div className="text-center mt-4 mb-2">
                      <p className="text-sm text-blue-200">
                        Haz clic en los botones de la cámara para cambiar tu foto de perfil y banner
                      </p>
                      <p className="text-xs text-blue-200/70 mt-1">
                        Avatar: 200x200px máx 2MB | Banner: 1200x400px máx 5MB
                      </p>
                    </div>

                    {/* Nombres - Dos columnas */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Nombre */}
                      <div className="relative group">
                        <label className="block text-white text-xs font-semibold mb-2 tracking-wide" htmlFor="firstName">
                          NOMBRE
                        </label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-4 w-4 z-10" />
                          <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={loading}
                            className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50"
                            placeholder="José"
                            required
                            aria-label="Nombre"
                            title="Nombre"
                          />
                        </div>
                      </div>

                      {/* Apellido */}
                      <div className="relative group">
                        <label className="block text-white text-xs font-semibold mb-2 tracking-wide" htmlFor="lastName">
                          APELLIDO
                        </label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-4 w-4 z-10" />
                          <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={loading}
                            className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50"
                            placeholder="Miranda"
                            required
                            aria-label="Apellido"
                            title="Apellido"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="relative group">
                      <label className="block text-white text-xs font-semibold mb-2 tracking-wide" htmlFor="email">
                        CORREO ELECTRÓNICO
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-4 w-4 z-10" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50"
                          placeholder="tu@email.com"
                          required
                          aria-label="Correo electrónico"
                          title="Correo electrónico"
                        />
                      </div>
                    </div>

                    {/* Contraseña */}
                    <div className="relative group">
                      <label className="block text-white text-xs font-semibold mb-2 tracking-wide" htmlFor="password">
                        CONTRASEÑA
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-4 w-4 z-10" />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50"
                          placeholder="••••••••"
                          required
                          aria-label="Contraseña"
                          title="Contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200 z-10"
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Barra de fortaleza */}
                      {password.length > 0 && (
                        <motion.div 
                          className="mt-3 space-y-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-1">
                              <Shield className={`h-3 w-3 ${
                                passwordStrength < 40 ? 'text-red-400' : 
                                passwordStrength < 70 ? 'text-yellow-400' : 'text-green-400'
                              }`} />
                              <span className="text-xs text-blue-100">SEGURIDAD</span>
                            </div>
                            <span className={`text-xs font-bold ${
                              passwordStrength < 40 ? 'text-red-300' : 
                              passwordStrength < 70 ? 'text-yellow-300' : 'text-green-300'
                            }`}>
                              {strengthText}
                            </span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-1.5 backdrop-blur-sm overflow-hidden">
                            <motion.div 
                              className={`h-1.5 rounded-full transition-all duration-700 ease-out ${strengthColor}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${passwordStrength}%` }}
                              transition={{ duration: 0.7 }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Confirmar contraseña */}
                    <div className="relative group">
                      <label className="block text-white text-xs font-semibold mb-2 tracking-wide" htmlFor="confirmPassword">
                        CONFIRMAR CONTRASEÑA
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-4 w-4 z-10" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={loading}
                          className={`w-full bg-transparent border ${
                            showPasswordMatchError ? 'border-red-400' : 'border-white/40'
                          } text-white placeholder-blue-200 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50`}
                          placeholder="••••••••"
                          required
                          aria-label="Confirmar contraseña"
                          title="Confirmar contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200 z-10"
                          aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {showPasswordMatchError && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-300 mt-1"
                        >
                          Las contraseñas no coinciden
                        </motion.p>
                      )}
                    </div>
                  </div>
                  
                  {/* Botón de Registro */}
                  <div className="mt-8">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-3 relative overflow-hidden group"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      aria-label="Registrarse"
                      title="Registrarse"
                    >
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300"></div>
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="rounded-full h-5 w-5 border-b-2 border-white relative z-10"
                          />
                          <span className="text-base font-semibold relative z-10">CREANDO CUENTA...</span>
                        </>
                      ) : (
                        <>
                          <User className="h-5 w-5 relative z-10" />
                          <span className="text-base font-semibold relative z-10">REGISTRARSE</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Enlace a login */}
                  <div className="text-center mt-6">
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium hover:shadow-md transition-all duration-300 group backdrop-blur-sm border border-white/20"
                    >
                      <span>🔐</span>
                      <span className="mx-2">¿Ya tienes una cuenta? Inicia sesión</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Footer */}
                  <div className="text-center mt-8 pt-6 border-t border-white/10">
                    <p className="text-blue-200/60 text-sm">
                      QuickNote · Desarrollado con ❤️ por José Pablo Miranda Quintanilla
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;