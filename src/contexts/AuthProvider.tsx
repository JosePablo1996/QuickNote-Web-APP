// src/contexts/AuthProvider.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../models/User';
import { supabase } from '../services/supabase';
import { createClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';
import { AuthContext, LoginResponse } from './AuthContext';
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

  // URL de la API (desde variable de entorno o por defecto)
  const getApiUrl = (): string => {
    return import.meta.env.VITE_API_URL || 'https://quicknote-api-app-react.onrender.com';
  };

  // Funcion para decodificar JWT
  const decodeJWT = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Error decodificando JWT:', err);
      return null;
    }
  };

  // Funcion para obtener URLs de los buckets
  const getUserImageUrls = async (userId: string, email: string): Promise<{ avatar: string; banner: string }> => {
    console.log('Buscando imagenes en buckets para usuario:', userId);
    
    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=3B82F6&color=fff&size=200`;
    let bannerUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=8B5CF6&color=fff&size=400&length=2`;

    try {
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
        console.log('Avatar encontrado en bucket:', avatarUrl);
      }

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
        console.log('Banner encontrado en bucket:', bannerUrl);
      }
    } catch (error) {
      console.error('Error obteniendo imagenes de buckets:', error);
    }

    return { avatar: avatarUrl, banner: bannerUrl };
  };

  // Funcion para cargar usuario desde token JWT
  const loadUserFromToken = async (token: string): Promise<boolean> => {
    try {
      console.log('Cargando usuario desde token JWT');
      
      const payload = decodeJWT(token);
      if (!payload || !payload.userId) {
        console.error('Token no contiene userId');
        return false;
      }

      console.log('Buscando usuario con ID:', payload.userId);

      try {
        const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.admin.getUserById(payload.userId);
        
        if (!error && supabaseUser) {
          console.log('Usuario encontrado en Supabase:', supabaseUser.email);
          
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
        console.log('Admin API no disponible, usando metodo alternativo');
      }

      // Fallback: crear usuario mínimo con datos del token
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
      console.log('Usuario creado con URLs de buckets:', minimalUser.email);
      return true;
      
    } catch (err) {
      console.error('Error cargando usuario desde token:', err);
      return false;
    }
  };

  // Limpiar datos de sesion al cerrar sesion
  const clearSessionData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('temp_2fa_token');
    sessionStorage.removeItem('temp_user_email');
    sessionStorage.removeItem('temp_user_name');
    sessionStorage.removeItem('2fa_user_data');
    sessionStorage.removeItem('login_in_progress');
  };

  // Verificar token existente al iniciar
  const checkExistingToken = async () => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Verificando token existente:', { 
      token: token ? 'Si' : 'No', 
      storedUser: storedUser ? 'Si' : 'No' 
    });
    
    if (token && !user) {
      console.log('Token JWT encontrado, cargando usuario...');
      setIsUsingJWT(true);
      const success = await loadUserFromToken(token);
      setIsUsingJWT(false);
      
      if (success) {
        console.log('Usuario cargado desde token JWT');
        return;
      }
    }
    
    if (storedUser && !user) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Usuario restaurado desde localStorage:', parsedUser.email);
      } catch (err) {
        console.error('Error restaurando usuario:', err);
        clearSessionData();
      }
    }
  };

  const mapSupabaseUserToAppUser = async (supabaseUser: any): Promise<User> => {
    const { avatar, banner } = await getUserImageUrls(supabaseUser.id, supabaseUser.email);
    
    console.log('Mapeando usuario:', {
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

  // useEffect principal
  useEffect(() => {
    checkExistingToken();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Sesion Supabase:', session?.user?.email || 'No hay sesion');
      setSession(session);
      
      const token = localStorage.getItem('auth_token');
      const temp2faToken = sessionStorage.getItem('temp_2fa_token');
      
      if (session?.user && !isUsingJWT && !user && !token && !temp2faToken) {
        console.log('Cargando usuario desde sesion Supabase...');
        const appUser = await mapSupabaseUserToAppUser(session.user);
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
        
        if (session.access_token) {
          localStorage.setItem('auth_token', session.access_token);
          console.log('Token guardado desde sesion Supabase');
        }
      }
      
      if (!isUsingJWT) {
        setIsLoading(false);
      }
    });

    // onAuthStateChange - Solo para cambios de sesión normales
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Cambio en autenticacion Supabase:', _event, session?.user?.email);
      setSession(session);
      
      const token = localStorage.getItem('auth_token');
      const temp2faToken = sessionStorage.getItem('temp_2fa_token');
      
      // Si hay flujo 2FA, ignorar
      if (temp2faToken) {
        console.log('Flujo 2FA en progreso, ignorando cambio de sesión Supabase');
        return;
      }
      
      if (!isUsingJWT && !token) {
        if (session?.user) {
          const appUser = await mapSupabaseUserToAppUser(session.user);
          setUser(appUser);
          localStorage.setItem('user', JSON.stringify(appUser));
          
          if (session.access_token) {
            localStorage.setItem('auth_token', session.access_token);
            console.log('Token actualizado por cambio de sesion');
          }
        } else {
          setUser(null);
          clearSessionData();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [isUsingJWT]);

  // ============================================
  // FUNCION LOGIN (CORREGIDA CON URL COMPLETA)
  // ============================================
  const login = async (email: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const API_URL = getApiUrl();
      const url = `${API_URL}/api/v1/auth/login`;
      
      console.log('Iniciando sesion con email:', email);
      console.log('Llamando a POST', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const loginData = await response.json();
      console.log('Respuesta del backend:', {
        success: loginData.success,
        requires_2fa: loginData.requires_2fa,
        has_token: !!loginData.access_token,
        has_temp_token: !!loginData.temp_token,
        has_user: !!loginData.user
      });

      if (loginData.requires_2fa === true) {
        console.log('2FA requerido para este usuario');
        return {
          success: true,
          requires2FA: true,
          tempToken: loginData.temp_token || loginData.user_id || '',
          message: loginData.message || 'Se requiere verificación 2FA',
          user: loginData.user || null
        };
      }

      if (loginData.access_token) {
        console.log('Login exitoso (sin 2FA), guardando token');
        
        localStorage.setItem('auth_token', loginData.access_token);
        
        if (loginData.refresh_token) {
          localStorage.setItem('refresh_token', loginData.refresh_token);
        }

        if (loginData.user) {
          const { avatar, banner } = await getUserImageUrls(
            loginData.user.id, 
            loginData.user.email || email
          );
          
          const appUser: User = {
            id: loginData.user.id,
            email: loginData.user.email || email,
            name: loginData.user.full_name || loginData.user.username || email.split('@')[0],
            avatar: loginData.user.avatar || avatar,
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
          
          setUser(appUser);
          localStorage.setItem('user', JSON.stringify(appUser));
          console.log('Usuario guardado:', appUser.email);
        }

        toast.success('¡Bienvenido de vuelta!');
        return {
          success: true,
          requires2FA: false,
          access_token: loginData.access_token,
          user: loginData.user
        };
      }

      throw new Error('Respuesta inesperada del servidor: no se recibió token ni requerimiento 2FA');
      
    } catch (err) {
      console.error('Error en login:', err);
      const message = err instanceof Error ? err.message : 'Error al iniciar sesion';
      setError(message);
      toast.error(message);
      return {
        success: false,
        requires2FA: false
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // LOGIN CON PASSKEY (CORREGIDO)
  // ============================================
  const loginWithPasskey = async (email: string, credential: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const API_URL = getApiUrl();
      const url = `${API_URL}/api/v1/passkeys/login/complete`;
      
      console.log('Iniciando sesion con passkey para:', email);
      console.log('Llamando a POST', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          credential: {
            ...credential,
            challenge_id: credential.challenge_id
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error en autenticacion con passkey');
      }

      const data = await response.json();
      
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        console.log('Token guardado desde passkey:', data.access_token.substring(0, 20) + '...');
        
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        const success = await loginWithToken(data.access_token);
        
        if (success) {
          console.log('Login con passkey exitoso');
          toast.success('Autenticacion biometrica exitosa!');
          return true;
        }
      }
      
      throw new Error('No se pudo completar la autenticacion');
      
    } catch (err) {
      console.error('Error en loginWithPasskey:', err);
      const message = err instanceof Error ? err.message : 'Error en autenticacion biometrica';
      setError(message);
      toast.error(message);
      clearSessionData();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // LOGIN CON TOKEN JWT
  // ============================================
  const loginWithToken = async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setIsUsingJWT(true);
    
    try {
      console.log('Iniciando sesion con token JWT');
      
      if (!token) throw new Error('Token vacio');
      
      localStorage.setItem('auth_token', token);
      
      const successResult = await loadUserFromToken(token);
      
      if (!successResult) {
        clearSessionData();
        throw new Error('No se pudo cargar el usuario desde el token');
      }
      
      console.log('Login con token exitoso');
      return true;
      
    } catch (err) {
      console.error('Error en loginWithToken:', err);
      const message = err instanceof Error ? err.message : 'Error al iniciar sesion con token';
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

  // ============================================
  // REGISTRO
  // ============================================
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Registrando usuario:', email);
      
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

      console.log('Usuario creado');
      toast.success('Registro exitoso! Revisa tu correo para confirmar la cuenta.');
      return true;
      
    } catch (err) {
      console.error('Error en registro:', err);
      const message = err instanceof Error ? err.message : 'Error al registrarse';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // REGISTRO CON PASSKEY (CORREGIDO)
  // ============================================
  const registerWithPasskey = async (email: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const API_URL = getApiUrl();
      const url = `${API_URL}/api/v1/passkeys/register/complete`;
      
      console.log('Registrando passkey para:', email);
      console.log('Llamando a POST', url);
      
      const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userError) throw userError;
      
      let userId: string;
      let existingUser = users.find((u: any) => u.email === email);
      
      if (!existingUser) {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { full_name: name },
        });
        
        if (createError) throw createError;
        if (!newUser.user) throw new Error('No se pudo crear el usuario');
        
        userId = newUser.user.id;
        console.log('Usuario creado para passkey:', userId);
      } else {
        userId = existingUser.id;
        console.log('Usuario existente encontrado:', userId);
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error en registro de passkey');
      }

      toast.success('Passkey registrada exitosamente!');
      return true;
      
    } catch (err) {
      console.error('Error en registerWithPasskey:', err);
      const message = err instanceof Error ? err.message : 'Error al registrar passkey';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // RESET PASSWORD (enviar correo)
  // ============================================
  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Enviando correo de recuperacion a:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      console.log('Correo de recuperacion enviado');
      toast.success('Correo de recuperacion enviado. Revisa tu bandeja de entrada.');
      return true;
      
    } catch (err) {
      console.error('Error al enviar correo de recuperacion:', err);
      const message = err instanceof Error ? err.message : 'Error al enviar correo de recuperacion';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // UPDATE PASSWORD (desde enlace de recuperación)
  // ============================================
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Actualizando contrasena...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      console.log('Contrasena actualizada correctamente');
      toast.success('Contrasena actualizada correctamente');
      return true;
      
    } catch (err) {
      console.error('Error al actualizar contrasena:', err);
      const message = err instanceof Error ? err.message : 'Error al actualizar contrasena';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // CHANGE PASSWORD (con sesión activa) (CORREGIDO)
  // ============================================
  const changePassword = async (currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
    requires_relogin: boolean;
  }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No hay sesión activa');
      }
      
      const API_URL = getApiUrl();
      const url = `${API_URL}/api/v1/auth/change-password`;
      
      console.log('Cambiando contraseña para usuario:', user?.email);
      console.log('Llamando a POST', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Contraseña cambiada exitosamente');
        
        if (data.requires_relogin) {
          console.log('Cerrando sesión por cambio de contraseña');
          
          // Limpiar todos los datos de sesión
          clearSessionData();
          setUser(null);
          setSession(null);
          
          toast.success(data.message || 'Contraseña actualizada. Por favor, inicia sesión nuevamente.');
        } else {
          toast.success(data.message || 'Contraseña actualizada correctamente');
        }
        
        return {
          success: true,
          message: data.message || 'Contraseña actualizada correctamente',
          requires_relogin: data.requires_relogin || false
        };
      } else {
        const errorMsg = data.detail?.message || data.message || data.detail || 'Error al cambiar la contraseña';
        console.error('Error cambiando contraseña:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        
        return {
          success: false,
          message: errorMsg,
          requires_relogin: false
        };
      }
      
    } catch (err) {
      console.error('Error en changePassword:', err);
      const message = err instanceof Error ? err.message : 'Error al cambiar la contraseña';
      setError(message);
      toast.error(message);
      
      return {
        success: false,
        message: message,
        requires_relogin: false
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Cerrando sesion');
      
      clearSessionData();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      
      console.log('Sesion cerrada');
      toast.info('Sesion cerrada correctamente');
      
    } catch (err) {
      console.error('Error al cerrar sesion:', err);
      toast.error('Error al cerrar sesion');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // UPDATE PROFILE
  // ============================================
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) {
      console.log('No hay usuario autenticado');
      return false;
    }
    
    console.log('Actualizando perfil con:', data);
    
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
          console.error('Error en updateUser:', error);
        }
      } catch (metaError) {
        console.log('No se pudo actualizar metadata en Supabase');
      }
      
      console.log('Perfil actualizado correctamente');
      toast.success('Perfil actualizado correctamente');
      return true;
      
    } catch (err) {
      console.error('Error en updateProfile:', err);
      const message = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // UPLOAD AVATAR
  // ============================================
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      console.log('No hay usuario autenticado');
      return null;
    }
    
    console.log('Subiendo avatar...', {
      userId: user.id,
      fileName: file.name,
      fileSize: file.size
    });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      console.log('Nombre del archivo:', fileName);
      
      const { error } = await supabaseAdmin.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error al subir avatar:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      console.log('URL publica:', publicUrl);

      const updated = await updateProfile({ avatar: publicUrl });
      
      if (updated) {
        console.log('Perfil actualizado con nueva URL de avatar');
        toast.success('Avatar actualizado correctamente');
        return publicUrl;
      } else {
        console.log('Error al actualizar perfil');
        return null;
      }
    } catch (err) {
      console.error('Error en uploadAvatar:', err);
      toast.error('Error al subir avatar');
      return null;
    }
  };

  // ============================================
  // UPLOAD BANNER
  // ============================================
  const uploadBanner = async (file: File): Promise<string | null> => {
    if (!user) {
      console.log('No hay usuario autenticado');
      return null;
    }
    
    console.log('Subiendo banner...', {
      userId: user.id,
      fileName: file.name,
      fileSize: file.size
    });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/banner-${Date.now()}.${fileExt}`;
      console.log('Nombre del archivo:', fileName);
      
      const { error } = await supabaseAdmin.storage
        .from('banners')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error al subir banner:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('banners')
        .getPublicUrl(fileName);
      
      console.log('URL publica:', publicUrl);

      const updated = await updateProfile({ banner: publicUrl });
      
      if (updated) {
        console.log('Perfil actualizado con nueva URL de banner');
        toast.success('Banner actualizado correctamente');
        return publicUrl;
      } else {
        console.log('Error al actualizar perfil');
        return null;
      }
    } catch (err) {
      console.error('Error en uploadBanner:', err);
      toast.error('Error al subir banner');
      return null;
    }
  };

  // ============================================
  // VALOR DEL CONTEXTO
  // ============================================
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
    changePassword,
    loginWithToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};