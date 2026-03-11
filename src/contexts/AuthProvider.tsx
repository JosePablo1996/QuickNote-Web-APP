import React, { useState, useEffect } from 'react';
import { User } from '../models/User';
import { supabase } from '../services/supabase';
import { createClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import { useToast } from '../hooks/useToast';

// Cliente admin con service role key para operaciones privilegiadas
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingJWT, setIsUsingJWT] = useState(false);
  const toast = useToast();

  // Función para decodificar JWT
  const decodeJWT = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('❌ Error decodificando JWT:', err);
      return null;
    }
  };

  // Función para obtener URLs de los buckets
  const getUserImageUrls = async (userId: string, email: string): Promise<{ avatar: string; banner: string }> => {
    console.log('📦 Buscando imágenes en buckets para usuario:', userId);
    
    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=3B82F6&color=fff&size=200`;
    let bannerUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=8B5CF6&color=fff&size=400&length=2`;

    try {
      // Buscar avatar en el bucket
      const { data: avatarFiles, error: avatarError } = await supabaseAdmin.storage
        .from('avatars')
        .list(userId, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (!avatarError && avatarFiles && avatarFiles.length > 0) {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('avatars')
          .getPublicUrl(`${userId}/${avatarFiles[0].name}`);
        avatarUrl = publicUrl;
        console.log('✅ Avatar encontrado en bucket:', avatarUrl);
      }

      // Buscar banner en el bucket
      const { data: bannerFiles, error: bannerError } = await supabaseAdmin.storage
        .from('banners')
        .list(userId, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (!bannerError && bannerFiles && bannerFiles.length > 0) {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('banners')
          .getPublicUrl(`${userId}/${bannerFiles[0].name}`);
        bannerUrl = publicUrl;
        console.log('✅ Banner encontrado en bucket:', bannerUrl);
      }
    } catch (error) {
      console.error('❌ Error obteniendo imágenes de buckets:', error);
    }

    return { avatar: avatarUrl, banner: bannerUrl };
  };

  // Función para cargar usuario desde token JWT
  const loadUserFromToken = async (token: string): Promise<boolean> => {
    try {
      console.log('🔑 Cargando usuario desde token JWT');
      
      const payload = decodeJWT(token);
      if (!payload || !payload.userId) {
        console.error('❌ Token no contiene userId');
        return false;
      }

      console.log('📦 Buscando usuario con ID:', payload.userId);

      // Intentar obtener usuario de Supabase con admin API
      try {
        const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.admin.getUserById(payload.userId);
        
        if (!error && supabaseUser) {
          console.log('✅ Usuario encontrado en Supabase:', supabaseUser.email);
          
          // Obtener URLs de los buckets
          const { avatar, banner } = await getUserImageUrls(supabaseUser.id, supabaseUser.email || payload.email);
          
          const appUser: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || payload.email || '',
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuario',
            avatar: avatar,
            banner: banner,
            role: 'user',
            created_at: supabaseUser.created_at,
            updated_at: supabaseUser.updated_at,
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
          };
          
          setUser(appUser);
          localStorage.setItem('user', JSON.stringify(appUser));
          localStorage.setItem('auth_token', token);
          return true;
        }
      } catch (adminError) {
        console.log('⚠️ Admin API no disponible, usando método alternativo');
      }

      // Si no se pudo obtener de admin API, crear usuario mínimo
      const { avatar, banner } = await getUserImageUrls(payload.userId, payload.email || 'usuario');
      
      const minimalUser: User = {
        id: payload.userId,
        email: payload.email || 'usuario@email.com',
        name: payload.email?.split('@')[0] || 'Usuario',
        avatar: avatar,
        banner: banner,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
      };
      
      setUser(minimalUser);
      localStorage.setItem('user', JSON.stringify(minimalUser));
      localStorage.setItem('auth_token', token);
      console.log('✅ Usuario creado con URLs de buckets:', minimalUser.email);
      return true;
      
    } catch (err) {
      console.error('❌ Error cargando usuario desde token:', err);
      return false;
    }
  };

  // Limpiar datos de sesión al cerrar sesión
  const clearSessionData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  // Verificar token existente al iniciar
  const checkExistingToken = async () => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 Verificando token existente:', { 
      token: token ? 'Sí' : 'No', 
      storedUser: storedUser ? 'Sí' : 'No' 
    });
    
    if (token && !user) {
      setIsUsingJWT(true);
      await loadUserFromToken(token);
      setIsUsingJWT(false);
    } else if (storedUser && !user) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('✅ Usuario restaurado desde localStorage:', parsedUser.email);
      } catch (err) {
        console.error('❌ Error restaurando usuario:', err);
        clearSessionData();
      }
    }
  };

  const mapSupabaseUserToAppUser = async (supabaseUser: any): Promise<User> => {
    const { avatar, banner } = await getUserImageUrls(supabaseUser.id, supabaseUser.email);
    
    console.log('🔄 Mapeando usuario:', {
      id: supabaseUser.id,
      email: supabaseUser.email,
      avatar: avatar,
      banner: banner,
      metadata: supabaseUser.user_metadata
    });

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '',
      avatar: avatar,
      banner: banner,
      role: 'user',
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at,
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
    };
  };

  useEffect(() => {
    checkExistingToken();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('📥 Sesión Supabase:', session?.user?.email || 'No hay sesión');
      setSession(session);
      
      if (session?.user && !isUsingJWT && !user) {
        const appUser = await mapSupabaseUserToAppUser(session.user);
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
        
        // ✅ Guardar token de Supabase como auth_token
        if (session.access_token) {
          localStorage.setItem('auth_token', session.access_token);
          console.log('🔑 Token guardado desde sesión Supabase');
        }
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Cambio en autenticación Supabase:', _event, session?.user?.email);
      setSession(session);
      
      const token = localStorage.getItem('auth_token');
      
      if (!isUsingJWT && !token) {
        if (session?.user) {
          const appUser = await mapSupabaseUserToAppUser(session.user);
          setUser(appUser);
          localStorage.setItem('user', JSON.stringify(appUser));
          
          // ✅ Guardar token cuando cambia la sesión
          if (session.access_token) {
            localStorage.setItem('auth_token', session.access_token);
            console.log('🔑 Token actualizado por cambio de sesión');
          }
        } else {
          setUser(null);
          clearSessionData();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [isUsingJWT]);

  // ✅ CORREGIDO: login con email ahora guarda el token
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Iniciando sesión con email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // ✅ Guardar token de Supabase
      if (data.session) {
        localStorage.setItem('auth_token', data.session.access_token);
        console.log('🔑 Token guardado:', data.session.access_token.substring(0, 20) + '...');
        
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }

      console.log('✅ Login exitoso');
      toast.success('¡Bienvenido de vuelta!');
      return true;
      
    } catch (err) {
      console.error('❌ Error en login:', err);
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ MEJORADO: loginWithPasskey
  const loginWithPasskey = async (email: string, credential: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Iniciando sesión con passkey para:', email);
      
      const response = await fetch('/api/passkey/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...credential }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en autenticación con passkey');
      }

      const data = await response.json();
      
      if (data.verified && data.token) {
        // Guardar token
        localStorage.setItem('auth_token', data.token);
        console.log('🔑 Token guardado desde passkey:', data.token.substring(0, 20) + '...');
        
        // Guardar usuario
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Usar loginWithToken para cargar el usuario
        const success = await loginWithToken(data.token);
        
        if (success) {
          console.log('✅ Login con passkey exitoso');
          toast.success('¡Autenticación biométrica exitosa!');
          return true;
        }
      }
      
      throw new Error('No se pudo completar la autenticación');
      
    } catch (err) {
      console.error('❌ Error en loginWithPasskey:', err);
      const message = err instanceof Error ? err.message : 'Error en autenticación biométrica';
      setError(message);
      toast.error(message);
      
      // Limpiar datos si hay error
      clearSessionData();
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FUNCIÓN MEJORADA: loginWithToken
  const loginWithToken = async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setIsUsingJWT(true);
    
    try {
      console.log('🔐 Iniciando sesión con token JWT');
      
      if (!token) throw new Error('Token vacío');
      
      // Guardar token primero
      localStorage.setItem('auth_token', token);
      
      const successResult = await loadUserFromToken(token);
      
      if (!successResult) {
        clearSessionData();
        throw new Error('No se pudo cargar el usuario desde el token');
      }
      
      console.log('✅ Login con token exitoso');
      return true;
      
    } catch (err) {
      console.error('❌ Error en loginWithToken:', err);
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión con token';
      setError(message);
      toast.error(message);
      
      clearSessionData();
      setUser(null);
      
      return false;
    } finally {
      setIsUsingJWT(false);
      setIsLoading(false);
    }
  };

  // ✅ Función para refrescar token
  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refrescando token...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session) {
        localStorage.setItem('auth_token', data.session.access_token);
        console.log('✅ Token refrescado');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📝 Registrando usuario:', email);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      console.log('✅ Usuario creado');
      toast.success('¡Registro exitoso! Revisa tu correo para confirmar la cuenta.');
      return true;
      
    } catch (err) {
      console.error('❌ Error en registro:', err);
      const message = err instanceof Error ? err.message : 'Error al registrarse';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithPasskey = async (email: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Registrando passkey para:', email);
      
      // Primero verificar si el usuario existe
      const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userError) throw userError;
      
      let userId: string;
      let existingUser = users.find((u: any) => u.email === email);
      
      if (!existingUser) {
        // Crear usuario temporal sin contraseña
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { full_name: name },
        });
        
        if (createError) throw createError;
        if (!newUser.user) throw new Error('No se pudo crear el usuario');
        
        userId = newUser.user.id;
        console.log('✅ Usuario creado para passkey:', userId);
      } else {
        userId = existingUser.id;
        console.log('✅ Usuario existente encontrado:', userId);
      }
      
      // Ahora registrar la passkey
      const response = await fetch('/api/passkey/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en registro de passkey');
      }

      toast.success('¡Passkey registrada exitosamente!');
      return true;
      
    } catch (err) {
      console.error('❌ Error en registerWithPasskey:', err);
      const message = err instanceof Error ? err.message : 'Error al registrar passkey';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📧 Enviando correo de recuperación a:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      console.log('✅ Correo de recuperación enviado');
      toast.success('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
      return true;
      
    } catch (err) {
      console.error('❌ Error al enviar correo de recuperación:', err);
      const message = err instanceof Error ? err.message : 'Error al enviar correo de recuperación';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Actualizando contraseña...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      console.log('✅ Contraseña actualizada correctamente');
      toast.success('Contraseña actualizada correctamente');
      return true;
      
    } catch (err) {
      console.error('❌ Error al actualizar contraseña:', err);
      const message = err instanceof Error ? err.message : 'Error al actualizar contraseña';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ MEJORADO: logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🚪 Cerrando sesión');
      
      // Limpiar datos de sesión
      clearSessionData();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      
      console.log('✅ Sesión cerrada');
      toast.info('Sesión cerrada correctamente');
      
    } catch (err) {
      console.error('❌ Error al cerrar sesión:', err);
      toast.error('Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) {
      console.log('❌ No hay usuario autenticado');
      return false;
    }
    
    console.log('📝 Actualizando perfil con:', data);
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      try {
        const updateData: any = {};
        if (data.name) updateData.full_name = data.name;
        if (data.avatar) updateData.avatar_url = data.avatar;
        if (data.banner) updateData.banner_url = data.banner;
        
        const { error } = await supabase.auth.updateUser({
          data: updateData
        });

        if (error) {
          console.error('❌ Error en updateUser:', error);
        }
      } catch (metaError) {
        console.log('⚠️ No se pudo actualizar metadata en Supabase');
      }
      
      console.log('✅ Perfil actualizado correctamente');
      toast.success('Perfil actualizado correctamente');
      return true;
      
    } catch (err) {
      console.error('❌ Error en updateProfile:', err);
      const message = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      console.log('❌ No hay usuario autenticado');
      return null;
    }
    
    console.log('📤 Subiendo avatar...', {
      userId: user.id,
      fileName: file.name,
      fileSize: file.size
    });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      console.log('📝 Nombre del archivo:', fileName);
      
      const { error } = await supabaseAdmin.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ Error al subir avatar:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      console.log('🔗 URL pública:', publicUrl);

      const updated = await updateProfile({ avatar: publicUrl });
      
      if (updated) {
        console.log('✅ Perfil actualizado con nueva URL de avatar');
        toast.success('Avatar actualizado correctamente');
        return publicUrl;
      } else {
        console.log('❌ Error al actualizar perfil');
        return null;
      }
    } catch (err) {
      console.error('❌ Error en uploadAvatar:', err);
      toast.error('Error al subir avatar');
      return null;
    }
  };

  const uploadBanner = async (file: File): Promise<string | null> => {
    if (!user) {
      console.log('❌ No hay usuario autenticado');
      return null;
    }
    
    console.log('📤 Subiendo banner...', {
      userId: user.id,
      fileName: file.name,
      fileSize: file.size
    });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/banner-${Date.now()}.${fileExt}`;
      console.log('📝 Nombre del archivo:', fileName);
      
      const { error } = await supabaseAdmin.storage
        .from('banners')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ Error al subir banner:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('banners')
        .getPublicUrl(fileName);
      
      console.log('🔗 URL pública:', publicUrl);

      const updated = await updateProfile({ banner: publicUrl });
      
      if (updated) {
        console.log('✅ Perfil actualizado con nueva URL de banner');
        toast.success('Banner actualizado correctamente');
        return publicUrl;
      } else {
        console.log('❌ Error al actualizar perfil');
        return null;
      }
    } catch (err) {
      console.error('❌ Error en uploadBanner:', err);
      toast.error('Error al subir banner');
      return null;
    }
  };

  // Función para obtener el token actual
  const getToken = (): string | null => {
    return localStorage.getItem('auth_token');
  };

  const value = {
    user,
    session,
    isLoading,
    error,
    login,
    loginWithPasskey,
    register,
    registerWithPasskey,
    logout,
    updateProfile,
    uploadAvatar,
    uploadBanner,
    isAuthenticated: !!user,
    resetPassword,
    updatePassword,
    loginWithToken,
    getToken,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};