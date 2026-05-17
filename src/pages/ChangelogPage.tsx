// src/pages/ChangelogPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

interface ChangeItem {
  description: string;
  subItems?: string[];
}

interface ChangeCategory {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: ChangeItem[];
}

interface VersionData {
  version: string;
  date: string;
  title: string;
  gradientColors: string[];
  changes: ChangeCategory[];
  isLatest?: boolean;
  isInitial?: boolean;
}

const ChangelogPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set(['2.6.0']));
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Función para toggle de versión SOLO con clic
  const toggleVersion = (version: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  };

  // Versiones de la aplicación web (desde 1.0.0 hasta 2.6.0)
  const versions: VersionData[] = [
    {
      version: '2.6.0',
      date: '16 May 2026',
      title: '💾 Sistema Completo de Copias de Seguridad (Fases 1-5)',
      gradientColors: ['#10B981', '#059669'],
      isLatest: true,
      changes: [
        {
          title: '💾 Backups Locales Completos',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          ),
          color: '#10B981',
          items: [
            {
              description: '📁 Gestión completa de backups locales',
              subItems: [
                'Crear, restaurar, eliminar y descargar backups',
                'Selección múltiple para eliminación masiva',
                'Límite aumentado de 10 a 20 backups por usuario',
                'Indicador visual X/20 backups usados',
                'Alertas cuando quedan pocos espacios disponibles',
              ],
            },
            {
              description: '🔄 Sincronización selectiva',
              subItems: [
                'Nuevo parámetro syncToCloud: false por defecto',
                'Backups locales no se suben automáticamente a la nube',
                'Sincronización manual usando token JWT',
                'Endpoint /cloud/sync para sincronización bidireccional',
              ],
            },
          ],
        },
        {
          title: '☁️ Backups en la Nube Mejorados',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '📤 Funcionalidades cloud mejoradas',
              subItems: [
                'Límite ampliado a 20 backups en la nube',
                'extractNotesFromData() soporta 5 formatos diferentes',
                'Manejo de error 404 como éxito al eliminar',
                'Preservación de shape, icon, size, colorIntensity al restaurar',
              ],
            },
            {
              description: '📊 Tarjetas de estadísticas',
              subItems: [
                'Sincronización automática cada 30 segundos',
                'Alertas visuales para límite bajo/alcanzado',
                'Información del backup más reciente en la nube',
              ],
            },
          ],
        },
        {
          title: '🤖 Auto-Backup Inteligente',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: '#F59E0B',
          items: [
            {
              description: '⏱️ Detección automática de cambios',
              subItems: [
                'Hash de notas para detectar cambios reales',
                'Debounce inteligente de 30 segundos',
                'Backup automático cuando hay cambios pendientes',
                'Función forceBackup() para backup manual forzado',
              ],
            },
            {
              description: '📱 Indicador visual AutoBackupIndicator',
              subItems: [
                'Posiciones configurables: top-right, top-left, bottom-right, bottom-left, inline',
                'Estados visuales: "Cambios pendientes", "Guardando...", "Backup en la nube"',
                'Barra de progreso con animación durante el backup',
                'Botón de acción "Guardar" para backup manual',
              ],
            },
          ],
        },
        {
          title: '🖥️ Nuevos Componentes de Backup',
          icon: (
            <svg className="w-5 h-5"fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ),
          color: '#8B5CF6',
          items: [
            {
              description: '🧩 Componentes creados',
              subItems: [
                'BackupLocalSection.tsx - Gestión de backups locales',
                'CloudBackupSection.tsx - Gestión de backups en nube',
                'BackupStatsCards.tsx - Estadísticas y alertas',
                'BackupSelectionBar.tsx - Barra de selección múltiple',
                'BackupLimitModal.tsx - Modal de límite alcanzado',
                'BackupDeleteConfirmModal.tsx - Confirmación de eliminación',
                'BackupModals.tsx - Unificación de modales',
              ],
            },
          ],
        },
        {
          title: '📄 Página de Ayuda Rediseñada',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: '#EC4899',
          items: [
            {
              description: '🎨 Nuevo diseño y funcionalidades',
              subItems: [
                'Banner decorativo con gradiente',
                'Sistema de tabs: FAQ, Contacto, Acerca de',
                '8 categorías de FAQ con colores distintos',
                'Buscador para filtrar por pregunta/respuesta',
                'Grid de 6 características principales',
                'Guías rápidas en modales con pasos y consejos',
                'Información de versión v2.6.0 con detalles técnicos',
              ],
            },
          ],
        },
        {
          title: '🐛 Correcciones de Errores v2.6.0',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          ),
          color: '#EF4444',
          items: [
            {
              description: '🔧 Backend',
              subItems: [
                'Solución error Illegal header value b"Bearer "',
                'Límite aumentado de 10 a 20 backups en enforce_backup_limit',
                'Endpoint DELETE retorna 200 OK con already_deleted: true',
                'Mejor manejo de errores en autenticación',
              ],
            },
            {
              description: '🔧 Frontend',
              subItems: [
                'Solución error usuario no autenticado al sincronizar',
                'Uso de localStorage.getItem("auth_token") en lugar de supabase.auth',
                'Función extractNotesFromData() que maneja 5 formatos diferentes',
                'Eliminado isDarkMode is not defined en TabButton',
                'Eliminado widget duplicado en esquina inferior',
                'Limpieza completa de backups huérfanos en localStorage',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.5.0',
      date: '15 May 2026',
      title: '🔐 Seguridad Avanzada, 2FA Completo y Recuperación por OTP',
      gradientColors: ['#8B5CF6', '#EC4899'],
      changes: [
        {
          title: '🔐 Seguridad Avanzada de Contraseñas',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          color: '#10B981',
          items: [
            {
              description: '📜 Historial de contraseñas',
              subItems: [
                'Almacena las últimas 5 contraseñas usadas por usuario',
                'Prevención de reutilización de contraseñas anteriores',
                'Tabla password_history en Supabase con hashes seguros',
              ],
            },
            {
              description: '⏰ Expiración de contraseñas',
              subItems: [
                'Contraseñas expiran automáticamente después de 90 días',
                'Notificación al usuario antes de la expiración',
                'Forzar cambio de contraseña al expirar',
              ],
            },
            {
              description: '🚪 Invalidación de sesiones',
              subItems: [
                'Al cambiar contraseña, se invalidan todas las sesiones activas',
                'Nueva columna session_version en profiles',
                'Requiere relogin después de cambios de seguridad',
              ],
            },
          ],
        },
        {
          title: '📧 Recuperación de Contraseña con OTP (4 pasos)',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '🔄 Flujo completo de 4 pasos',
              subItems: [
                'Paso 1: Bienvenida y explicación del proceso',
                'Paso 2: Ingreso de email para recibir código OTP',
                'Paso 3: Verificación de código OTP de 6 dígitos',
                'Paso 4: Establecer nueva contraseña segura',
              ],
            },
            {
              description: '⏱️ Timer de reenvío de código',
              subItems: [
                'Botón de reenvío habilitado después de 60 segundos',
                'Límite de 3 intentos por código OTP',
                'Código OTP válido por 10 minutos',
              ],
            },
            {
              description: '🔒 Validación de fortaleza de contraseña',
              subItems: [
                'Barra de progreso visual con colores (rojo/amarillo/verde)',
                'Niveles: Débil, Media, Fuerte',
                'Requisitos mínimos: 8 caracteres, mayúscula, número, símbolo',
              ],
            },
          ],
        },
        {
          title: '🔢 Autenticación 2FA (TOTP) Completa',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          ),
          color: '#F59E0B',
          items: [
            {
              description: '📱 Integración con Google Authenticator',
              subItems: [
                'Generación de código QR para escanear con la app',
                'Verificación de código TOTP de 6 dígitos',
                'Códigos expiran cada 30 segundos por seguridad',
              ],
            },
            {
              description: '🎫 Códigos de respaldo (backup codes)',
              subItems: [
                '8 códigos de un solo uso generados al activar 2FA',
                'Almacenamiento hasheado en base de datos',
                'Códigos regenerables desde configuración',
              ],
            },
            {
              description: '🔄 Flujo de login con 2FA',
              subItems: [
                'Backend retorna requires_2fa + temp_token al detectar 2FA activo',
                'Redirección automática a pantalla de verificación',
                'temp_token válido por 5 minutos para verificación',
              ],
            },
            {
              description: '⚙️ Gestión completa desde Settings',
              subItems: [
                'Activar/Desactivar 2FA con verificación de código',
                'Visualización y regeneración de códigos de respaldo',
                'Modal de configuración paso a paso',
              ],
            },
          ],
        },
        {
          title: '📨 Sistema de Emails OTP con SendGrid',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          color: '#EC4899',
          items: [
            {
              description: '📧 Envío real con SendGrid',
              subItems: [
                'SendGrid como método primario (100 emails/día gratis)',
                'Respaldo automático con SMTP Gmail si SendGrid falla',
                'Email HTML profesional con diseño responsive',
              ],
            },
            {
              description: '🎨 Diseño de email personalizado',
              subItems: [
                'Gradiente QuickNote (púrpura/azul) en el encabezado',
                'Código OTP destacado en fuente grande (48px)',
                'Borde punteado alrededor del código para fácil identificación',
                'Mensajes de seguridad y expiración en el email',
                'Pie de página personalizado con créditos',
              ],
            },
          ],
        },
        {
          title: '🗄️ Base de Datos - Nuevas Tablas y Columnas',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          ),
          color: '#6366F1',
          items: [
            {
              description: '📊 Nuevas tablas en Supabase',
              subItems: [
                'password_history - Historial de hashes de contraseñas',
                'password_policies - Políticas de expiración y reutilización',
                'active_sessions - Sesiones activas de usuarios',
                'security_events - Auditoría de eventos de seguridad',
                'two_factor_settings - Configuración TOTP por usuario',
              ],
            },
            {
              description: '📝 Nuevas columnas en profiles',
              subItems: [
                'session_version (BIGINT) - Versión de sesión para invalidar tokens',
                'password_changed_at (TIMESTAMP) - Fecha del último cambio',
                'password_expires_at (TIMESTAMP) - Fecha de expiración',
                'password_reset_via_otp (BOOLEAN) - Indica reset por OTP',
              ],
            },
            {
              description: '🔧 Funciones SQL implementadas',
              subItems: [
                'check_password_history() - Verifica si contraseña ya fue usada',
                'is_password_expired() - Verifica si la contraseña expiró',
                'password_days_remaining() - Días restantes hasta expiración',
              ],
            },
          ],
        },
        {
          title: '🖥️ Nuevos Componentes Frontend',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ),
          color: '#8B5CF6',
          items: [
            {
              description: '✨ Componentes UI creados',
              subItems: [
                'GreetingWidget.tsx - Saludo dinámico con avatar y hora',
                'ViewToggle.tsx - Cambio entre vista Grid y Lista',
                'TwoFactorSetup.tsx - Configuración de 2FA con QR',
                'TwoFactorVerify.tsx - Verificación 2FA durante login',
                'ForgotPasswordPage.tsx - Recuperación OTP de 4 pasos',
              ],
            },
            {
              description: '🎨 Rediseños UI/UX',
              subItems: [
                'SplashScreen - Gradiente radial + partículas animadas + tips rotativos',
                'SettingsPage - Perfil centrado, avatar cuadrado, modal compacto',
                'DeveloperPage - Avatar personalizado y optimización móvil',
                'LoginPage - Ocultar Passkey en producción',
              ],
            },
          ],
        },
        {
          title: '🐛 Correcciones de Errores v2.5.0',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          ),
          color: '#EF4444',
          items: [
            {
              description: '🔧 Backend',
              subItems: [
                'Corrección de RLS policies para 2FA',
                'Soporte para tokens HS256 (passkey) y ES256 (Supabase)',
                'Métodos is_null e is_not_null agregados a Supabase client',
                'Filtro de campos permitidos en update_user_metadata',
                'CORS configurado con orígenes explícitos',
              ],
            },
            {
              description: '🔧 Frontend',
              subItems: [
                'URLs absolutas en AuthProvider (eliminado /api/v1 duplicado)',
                'Archivo _redirects para SPA en Render',
                'Detección de entorno para ocultar Passkey en producción',
                'Prevención de múltiples llamadas loadUserFromToken con hasChecked',
                'Corrección de bucle infinito al archivar/desarchivar notas',
              ],
            },
            {
              description: '🔧 Seguridad',
              subItems: [
                'Normalización de credential_id como base64url',
                'Validación y sanitización de claves públicas',
                'Manejo de errores en registro de passkeys',
                'Cierre de sesiones remotas al cambiar contraseña',
              ],
            },
          ],
        },
        {
          title: '📦 Dependencias Actualizadas v2.5.0',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          ),
          color: '#14B8A6',
          items: [
            {
              description: '📦 Backend',
              subItems: [
                'fastapi: ^0.115.6',
                'pydantic: ^2.10.6',
                'supabase: ^2.7.0',
                'python-multipart: ^0.0.20',
                'pyotp: ^2.9.0 (TOTP)',
                'qrcode: ^7.4.2',
                'Pillow: ^10.4.0',
              ],
            },
            {
              description: '📦 Frontend',
              subItems: [
                'react: ^18.3.1',
                'typescript: ^5.6.3',
                'framer-motion: ^11.11.17',
                'lucide-react: ^0.460.0',
                'react-router-dom: ^6.26.2',
                'qrcode.react: ^4.2.0',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.4.0',
      date: '12 May 2026',
      title: '🧹 Estabilización, limpieza y preparación para producción',
      gradientColors: ['#10B981', '#059669'],
      changes: [
        {
          title: '🧹 Mejoras generales - Backend',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          ),
          color: '#F59E0B',
          items: [
            {
              description: '🔧 CORS configurado con orígenes explícitos',
              subItems: [
                'Configuración segura de CORS para producción',
                'Lista blanca de dominios permitidos',
                'Manejo de preflight requests optimizado',
              ],
            },
            {
              description: '📊 Logs sin emojis (compatibilidad Windows CP1252)',
              subItems: [
                'Eliminación de emojis de logs para compatibilidad con terminales Windows',
                'Formato de logs limpio y consistente',
                'Mejor legibilidad en entornos de producción',
              ],
            },
            {
              description: '🔐 Middleware de autenticación dual (HS256 + ES256)',
              subItems: [
                'Soporte para tokens HS256 (passkey) y ES256 (Supabase)',
                'Verificación de audiencia desactivada para tokens Supabase',
                'Extracción consistente de userId del token',
              ],
            },
          ],
        },
        {
          title: '🧹 Mejoras generales - Frontend',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ),
          color: '#8B5CF6',
          items: [
            {
              description: '⚡ Eliminado React.StrictMode',
              subItems: [
                'Evita doble render en desarrollo',
                'Mejora rendimiento en desarrollo',
                'Reduce llamadas API duplicadas',
              ],
            },
            {
              description: '🔄 Sistema de hasChecked en sessionStorage',
              subItems: [
                'Evita múltiples llamadas loadUserFromToken',
                'Persistencia de estado por sesión de navegación',
                'Reducción de peticiones innecesarias al backend',
              ],
            },
            {
              description: '🛡️ Protección de rutas con isLoading',
              subItems: [
                'Loader mientras se verifica autenticación',
                'Previene flashes de pantallas no autorizadas',
                'Mejor experiencia de usuario',
              ],
            },
            {
              description: '♿ Accesibilidad mejorada',
              subItems: [
                'Botones con title y aria-label en todos los componentes',
                'Mejor navegación por teclado',
                'Soporte para lectores de pantalla',
              ],
            },
          ],
        },
        {
          title: '🐛 Correcciones Críticas v2.4.0',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          ),
          color: '#EF4444',
          items: [
            {
              description: '🔧 generate_login_challenge() recibía email en lugar de existing_credentials',
              subItems: [
                'Corregido parámetro incorrecto en función de WebAuthn',
                'Ahora se pasa correctamente el objeto de credenciales existentes',
                'Mejor manejo de errores en registro de passkeys',
              ],
            },
            {
              description: '🔧 Error "Invalid base64-encoded string" en public_key',
              subItems: [
                'Validación y sanitización de claves públicas base64',
                'Manejo robusto de formatos de clave',
              ],
            },
            {
              description: '🔧 Error "Could not decode CBOR data"',
              subItems: [
                'Clave pública ahora preserva formato COSE/CBOR correctamente',
                'Sin transformaciones no deseadas en la clave',
              ],
            },
            {
              description: '🔧 credential_id no coincidía entre navegador y BD',
              subItems: [
                'Normalización de credential_id como string',
                'Uso de base64url para almacenamiento consistente',
              ],
            },
            {
              description: '🔄 Bucle infinito al archivar/desarchivar notas',
              subItems: [
                'Corregido estado que causaba re-renders infinitos',
                'Optimización de useEffect para notas archivadas',
              ],
            },
            {
              description: '📡 Múltiples peticiones GET /notes',
              subItems: [
                'Solución con hasLoaded + initialLoadRef',
                'Solo una carga inicial por sesión',
                'Cache de notas optimizado',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.3.0',
      date: '09 May 2026',
      title: '☁️ Backup en la nube (Cloud Backup)',
      gradientColors: ['#3B82F6', '#8B5CF6'],
      changes: [
        {
          title: '☁️ Backup en la nube con Supabase',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '🗄️ Nuevas tablas en Supabase',
              subItems: [
                'cloud_backups - Metadatos de backups',
                'backup_data - Datos comprimidos de notas',
              ],
            },
            {
              description: '🌐 Nuevos endpoints de backup',
              subItems: [
                'GET /backup/cloud - Listar backups del usuario',
                'POST /backup/cloud - Crear nuevo backup',
                'DELETE /backup/cloud/{id} - Eliminar backup específico',
              ],
            },
            {
              description: '💾 Compresión de datos',
              subItems: [
                'Uso de compresión gzip para minimizar almacenamiento',
                'JSON.stringify optimizado para grandes volúmenes de notas',
                'Límite de 10 backups por usuario',
              ],
            },
          ],
        },
        {
          title: '🎨 Frontend - Cloud Backup',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          color: '#8B5CF6',
          items: [
            {
              description: '📱 Nuevo componente CloudBackupSection.tsx',
              subItems: [
                'Listado de backups con fecha, tamaño y número de notas',
                'Botones para crear, restaurar y eliminar backups',
              ],
            },
            {
              description: '🔄 Servicio backupCloudService.ts',
              subItems: [
                'API calls para gestión de backups en la nube',
                'Manejo de errores y reintentos',
                'Notificaciones de éxito/error',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.2.0',
      date: '07 May 2026',
      title: '🔄 Flujo OTP por email y mejoras en login',
      gradientColors: ['#EC4899', '#F43F5E'],
      changes: [
        {
          title: '📧 Sistema completo de envío de emails OTP',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '📨 Envío real con SendGrid + respaldo SMTP',
              subItems: [
                'SendGrid como método primario (100 emails/día gratis)',
                'Respaldo automático con SMTP Gmail',
                'Email HTML profesional con diseño responsive',
              ],
            },
          ],
        },
        {
          title: '📱 Rediseño de LoginPage.tsx',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          color: '#10B981',
          items: [
            {
              description: '📱 Dropdown "Inicia sesión de otras formas"',
              subItems: [
                'Nuevo menú desplegable con métodos alternativos',
                'Opción Passkey (WebAuthn)',
                'Opción OTP por email',
              ],
            },
            {
              description: '🔑 Nuevo componente OtpLoginPage.tsx',
              subItems: [
                'Página dedicada para login con OTP de 6 dígitos',
                'Temporizador de 60 segundos para reenvío',
                'Máximo 3 intentos por código',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.1.0',
      date: '05 May 2026',
      title: '🔐 Soporte inicial de 2FA (TOTP)',
      gradientColors: ['#10B981', '#3B82F6'],
      changes: [
        {
          title: '🔐 2FA con Google Authenticator (TOTP)',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          color: '#10B981',
          items: [
            {
              description: '🔢 TOTP (Time-based One-Time Password)',
              subItems: [
                'Generación de códigos de 6 dígitos que expiran cada 30 segundos',
                'Compatibilidad con Google Authenticator, Authy, Microsoft Authenticator',
              ],
            },
            {
              description: '📱 Generación de QR para escanear',
              subItems: [
                'URL otpauth://totp/QuickNote:email',
                'QR code generado con librería qrcode',
              ],
            },
            {
              description: '🔑 Códigos de respaldo (backup codes)',
              subItems: [
                '10 códigos de un solo uso generados al habilitar 2FA',
                'Almacenamiento hasheado en base de datos',
              ],
            },
          ],
        },
        {
          title: '🌐 Nuevos endpoints 2FA',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '📡 Endpoints implementados',
              subItems: [
                'POST /auth/2fa/enable - Habilitar 2FA',
                'POST /auth/2fa/verify-login - Verificar durante login',
                'POST /auth/2fa/disable - Deshabilitar 2FA',
                'GET /auth/2fa/status - Ver estado de 2FA',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.0.0',
      date: '11 Mar 2026',
      title: '🚀 Rediseño Completo y Autenticación Biométrica Mejorada',
      gradientColors: ['#8B5CF6', '#EC4899'],
      changes: [
        {
          title: '✨ Rediseño Completo de UI/UX',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          ),
          color: '#8B5CF6',
          items: [
            {
              description: '🎨 Interfaz de usuario completamente rediseñada',
              subItems: [
                'Nuevo sistema de diseño con glassmorphism mejorado',
                'Animaciones suaves y transiciones optimizadas',
                'Componentes reutilizables con Tailwind CSS',
              ],
            },
            {
              description: '📱 Diseño responsive mejorado',
              subItems: [
                'Adaptación perfecta a todos los tamaños de pantalla',
                'Menús colapsables en dispositivos móviles',
                'Gestos táctiles para navegación',
              ],
            },
            {
              description: '🌙 Modo oscuro/claro mejorado',
              subItems: [
                'Transiciones suaves entre temas',
                'Persistencia de preferencia del usuario',
                'Soporte para tema del sistema',
              ],
            },
          ],
        },
        {
          title: '🔐 Sistema de Autenticación Dual',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '🔑 Autenticación con Passkeys (WebAuthn)',
              subItems: [
                'Inicio de sesión con huella dactilar, Face ID y Windows Hello',
                'Registro de múltiples dispositivos biométricos por usuario',
                'Tokens JWT HS256 para sesiones biométricas',
              ],
            },
            {
              description: '📧 Autenticación tradicional con email/password',
              subItems: [
                'Login y registro con Supabase Auth',
                'Tokens ES256 generados por Supabase',
                'Sincronización perfecta entre ambos métodos',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.0.0',
      date: '04 Mar 2026',
      title: '🎉 Lanzamiento Inicial - QuickNote Web',
      gradientColors: ['#3B82F6', '#10B981'],
      isInitial: true,
      changes: [
        {
          title: '🚀 Funcionalidades Principales',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          color: '#4CAF50',
          items: [
            {
              description: '📝 Gestión básica de notas',
              subItems: [
                'CRUD básico de notas',
                'Vista grid y lista',
                'Modo oscuro/claro',
              ],
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      {/* Header con efecto glassmorphism - Responsive */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="group p-2 hover:bg-gray-200/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Volver a configuración"
              title="Volver"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Historial de Cambios
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Evolución y mejoras de QuickNote Web
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de versiones - Responsive con mejor legibilidad móvil */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-5">
        {versions.map((version, index) => {
          const isExpanded = expandedVersions.has(version.version);
          const isLatest = version.isLatest;
          const gradientStart = version.gradientColors[0];
          const gradientEnd = version.gradientColors[1];

          return (
            <div
              key={version.version}
              className={`
                relative overflow-hidden transition-all duration-500 ease-out
                ${isExpanded ? 'scale-100' : 'hover:scale-[1.01] hover:shadow-2xl'}
                rounded-xl sm:rounded-2xl
                ${isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80' 
                  : 'bg-gradient-to-br from-white/90 via-white/80 to-gray-50/90'
                }
                backdrop-blur-lg border
                ${isLatest 
                  ? `border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20` 
                  : isDarkMode 
                    ? 'border-gray-700/30 shadow-lg' 
                    : 'border-gray-200/50 shadow-lg'
                }
              `}
              style={{
                boxShadow: isLatest ? `0 25px 50px -12px ${gradientStart}40` : undefined,
              }}
            >
              {/* Efectos decorativos para versión latest */}
              {isLatest && (
                <>
                  <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-tr from-blue-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                </>
              )}

              {/* Header de la versión - Mejorado para móvil */}
              <div
                className="relative p-3 sm:p-6 cursor-pointer select-none"
                onClick={() => toggleVersion(version.version)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleVersion(version.version);
                  }
                }}
                aria-label={`Versión ${version.version} - ${isExpanded ? 'expandida' : 'colapsada'}. ${version.title}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                    {/* Badge de versión */}
                    <div
                      className={`
                        px-2.5 sm:px-5 py-1 sm:py-2.5 rounded-full text-white font-bold text-[11px] sm:text-sm
                        transition-all duration-500
                        ${isExpanded ? 'scale-110 shadow-2xl' : 'shadow-lg hover:shadow-xl'}
                        relative overflow-hidden group
                      `}
                      style={{
                        background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                      }}
                    >
                      <span className="relative z-10">v{version.version}</span>
                      {isExpanded && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      )}
                    </div>

                    {/* Fecha - Más compacta en móvil */}
                    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full border border-gray-300/30 dark:border-gray-600/30">
                      <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300">
                        {version.date}
                      </span>
                    </div>

                    {/* Badge "Latest" - Más pequeño en móvil */}
                    {isLatest && (
                      <div className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-[9px] sm:text-xs font-bold shadow-lg animate-pulse whitespace-nowrap">
                        ✨ Última versión
                      </div>
                    )}
                  </div>

                  {/* Botón expandir/colapsar - Más pequeño en móvil */}
                  <button
                    onClick={(e) => toggleVersion(version.version, e)}
                    className={`
                      p-1.5 sm:p-3 rounded-full transition-all duration-500 cursor-pointer
                      hover:scale-110 active:scale-95 self-start sm:self-auto
                      ${isExpanded 
                        ? `bg-gradient-to-r from-${gradientStart}/20 to-${gradientEnd}/20 shadow-lg` 
                        : 'bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'
                      }
                    `}
                    aria-label={isExpanded ? "Colapsar versión" : "Expandir versión"}
                    title={isExpanded ? "Colapsar" : "Expandir"}
                  >
                    <svg
                      className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-all duration-500 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                      style={{ color: isExpanded ? gradientStart : undefined }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Título de la versión - Visible solo cuando expandido */}
                <div
                  className={`
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${isExpanded ? 'max-h-32 opacity-100 mt-2 sm:mt-4' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-1 sm:py-2.5 rounded-lg sm:rounded-xl"
                    style={{
                      backgroundColor: `${gradientStart}15`,
                      border: `1px solid ${gradientStart}25`,
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <span className="text-[10px] sm:text-sm font-medium break-words" style={{ color: gradientStart }}>
                      {version.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido expandible - Scroll mejorado para móvil */}
              <div
                ref={(el) => {
                  if (el) contentRefs.current.set(version.version, el);
                  else contentRefs.current.delete(version.version);
                }}
                className={`
                  overflow-y-auto transition-all duration-500 ease-in-out
                  ${isExpanded ? 'max-h-[2000px] sm:max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}
                  custom-scrollbar
                `}
              >
                <div className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="space-y-3 sm:space-y-6">
                    {version.changes.map((category, catIndex) => (
                      <div
                        key={catIndex}
                        className="space-y-1.5 sm:space-y-3 transform transition-all duration-500 hover:translate-x-0.5 sm:hover:translate-x-1"
                        style={{
                          animation: `slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${catIndex * 0.08}s both`,
                        }}
                      >
                        {/* Título de categoría sticky - Mejorado para móvil */}
                        <div 
                          className="flex items-center gap-1.5 sm:gap-3 group sticky top-0 py-1 sm:py-2 z-10 rounded-lg"
                          style={{
                            backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.98)' : 'rgba(249, 250, 251, 0.98)',
                            backdropFilter: 'blur(12px)',
                          }}
                        >
                          <div
                            className={`
                              p-1 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300
                              group-hover:scale-110 group-hover:shadow-lg
                            `}
                            style={{
                              backgroundColor: `${category.color}20`,
                              boxShadow: `0 2px 8px ${category.color}30`,
                            }}
                          >
                            <span style={{ color: category.color }} className="transition-transform duration-300 group-hover:rotate-12 block">
                              {category.icon}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-lg">
                            {category.title}
                          </h3>
                          <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700" />
                        </div>

                        {/* Items de la categoría - Espaciado mejorado para móvil */}
                        <div className="space-y-1.5 sm:space-y-3 pl-2 sm:pl-6">
                          {category.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="group/item p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
                              style={{
                                backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                                border: `1px solid ${category.color}15`,
                                backdropFilter: 'blur(4px)',
                              }}
                            >
                              {/* Descripción principal - Texto más legible */}
                              <div className="flex items-start gap-1.5 sm:gap-3">
                                <div
                                  className="p-0.5 sm:p-1 rounded-lg mt-0.5 transition-all duration-300 group-hover/item:scale-110 flex-shrink-0"
                                  style={{ backgroundColor: `${category.color}20` }}
                                >
                                  <svg
                                    className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover/item:translate-x-0.5"
                                    style={{ color: category.color }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                                <span className="text-[11px] sm:text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                                  {item.description}
                                </span>
                              </div>

                              {/* Sub-items - Mejor legibilidad en móvil */}
                              {item.subItems && item.subItems.length > 0 && (
                                <div className="mt-1.5 sm:mt-3 ml-4 sm:ml-10 space-y-1 sm:space-y-2">
                                  {item.subItems.map((subItem, subIndex) => (
                                    <div
                                      key={subIndex}
                                      className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs group/sub transition-all duration-200 hover:translate-x-0.5"
                                    >
                                      <span
                                        className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mt-1 sm:mt-1.5 transition-all duration-300 group-hover/sub:scale-150 flex-shrink-0"
                                        style={{ backgroundColor: category.color }}
                                      />
                                      <span className="text-gray-600 dark:text-gray-400 group-hover/sub:text-gray-800 dark:group-hover/sub:text-gray-200 transition-colors duration-300 leading-relaxed">
                                        {subItem}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Badge de versión inicial */}
                    {version.isInitial && (
                      <div
                        className="mt-3 sm:mt-6 p-4 sm:p-6 rounded-xl text-center transform transition-all duration-500 hover:scale-[1.02] animate-pulse"
                        style={{
                          background: `linear-gradient(135deg, ${gradientStart}15, ${gradientEnd}15)`,
                          border: `1px solid ${gradientStart}30`,
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <span className="text-xs sm:text-base font-bold" style={{ color: gradientStart }}>
                          🎉 El comienzo de QuickNote Web 🎉
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estilos globales - Mejorados para móvil */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @media (min-width: 640px) {
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        }

        /* Custom scrollbar premium - Mejorado para móvil */
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }
        
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7C3AED, #DB2777);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #A78BFA, #F472B6);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
        }

        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
        }

        /* Smooth transitions */
        * {
          -webkit-tap-highlight-color: transparent;
        }

        /* Mejora de contraste y legibilidad en móvil */
        @media (max-width: 640px) {
          .custom-scrollbar {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChangelogPage;