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
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set(['2.4.0']));
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Función para toggle de versión SOLO con clic
  const toggleVersion = (version: string, e?: React.MouseEvent) => {
    // Prevenir que el clic en el botón se propague al contenedor padre
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

  // Versiones de la aplicación web (completas desde 1.0.0 hasta 2.4.0)
  const versions: VersionData[] = [
    {
      version: '2.4.0',
      date: '15 May 2026',
      title: '🧹 Estabilización, limpieza y preparación para producción',
      gradientColors: ['#10B981', '#059669'],
      isLatest: true,
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
        {
          title: '📦 Dependencias Actualizadas',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          ),
          color: '#6366F1',
          items: [
            {
              description: '📦 Backend',
              subItems: [
                '@supabase/supabase-js: ^2.99.0',
                '@simplewebauthn/server: ^13.2.3',
                'express: ^5.2.1',
                'jsonwebtoken: ^9.0.3',
                'speakeasy: ^2.0.0 (TOTP)',
                'qrcode: ^1.5.4',
              ],
            },
            {
              description: '📦 Frontend',
              subItems: [
                'react: ^18.2.0',
                '@simplewebauthn/browser: ^13.2.2',
                'framer-motion: ^12.35.1',
                'tailwindcss: ^3.4.1',
                'qrcode.react: ^4.2.0',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.3.0',
      date: '12 May 2026',
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
                'Límite de 10 backups por usuario (configurable)',
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
                'Grid de resumen en BackupPage.tsx',
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
            {
              description: '📊 Grid de resumen en BackupPage.tsx',
              subItems: [
                'Visualización de almacenamiento usado',
                'Límite de backups disponibles',
                'Animaciones al crear/restaurar backups',
              ],
            },
          ],
        },
        {
          title: '🐛 Correcciones v2.3.0',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          ),
          color: '#EF4444',
          items: [
            {
              description: '🔧 Importación circular en app/models/backup.py',
              subItems: [
                'Refactorización de imports para evitar circularidad',
                'Separación de tipos y modelos',
              ],
            },
            {
              description: '🔧 Error 422 al guardar backup',
              subItems: [
                'Formato incorrecto de notes_data corregido',
                'Validación de datos antes de guardar',
              ],
            },
            {
              description: '🔧 TypeScript: restoredNotes puede ser null',
              subItems: [
                'Manejo de null en restoredNotes',
                'Operadores opcionales y valores por defecto',
              ],
            },
            {
              description: '📤 Falta de exportación de CloudBackupMetadata',
              subItems: [
                'Exportación agregada en api.ts',
                'Tipos completos para TypeScript',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.2.0',
      date: '10 May 2026',
      title: '🔄 Flujo 2FA completo + Integración con login',
      gradientColors: ['#EC4899', '#F43F5E'],
      changes: [
        {
          title: '🔄 Flujo completo de login con 2FA',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          ),
          color: '#EC4899',
          items: [
            {
              description: '🔐 Backend retorna requires_2fa y temp_token',
              subItems: [
                'Nueva respuesta en /auth/login cuando 2FA está habilitado',
                'temp_token válido por 5 minutos para verificación 2FA',
                'Requiere_2fa flag para UI condicional',
              ],
            },
            {
              description: '🎨 Frontend maneja paso a paso (credentials → 2fa)',
              subItems: [
                'Redirección automática a pantalla de verificación 2FA',
                'Manejo de estado intermedio entre login y verificación',
                'Persistencia de email en sessionStorage durante el flujo',
              ],
            },
          ],
        },
        {
          title: '📧 Rediseño de LoginPage.tsx',
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
        {
          title: '📨 Sistema completo de envío de emails OTP',
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
                'Respaldo automático con SMTP Gmail si SendGrid falla',
                'Email HTML profesional con diseño responsive',
              ],
            },
            {
              description: '🎨 Diseño con gradiente QuickNote',
              subItems: [
                'Email con gradiente púrpura/azul (QuickNote)',
                'Código OTP destacado en fuente grande (48px)',
                'Borde punteado alrededor del código',
                'Mensajes de seguridad y expiración en el email',
                'Pie de página personalizado con créditos',
              ],
            },
          ],
        },
        {
          title: '🐛 Correcciones v2.2.0',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          ),
          color: '#EF4444',
          items: [
            {
              description: '🔧 email_service.py no enviaba correos reales',
              subItems: [
                'El código original solo logueaba el OTP en consola',
                'Todo el código de envío SMTP estaba comentado',
                'Reescritura completa con lógica real SendGrid + SMTP',
              ],
            },
            {
              description: '🔧 auth.py no llamaba a send_otp_email()',
              subItems: [
                'La ruta /send-otp solo logueaba el código',
                'Había un TODO sin implementar el envío real',
                'Agregada llamada real a la función de envío',
              ],
            },
            {
              description: '🔧 Faltaban variables de entorno en backend',
              subItems: [
                'Creación de archivo .env con SENDGRID_API_KEY y SMTP_*',
                'Carga de variables con ruta absoluta en config.py',
              ],
            },
            {
              description: '🔧 Pantalla 2FA no aparecía',
              subItems: [
                'Redirección anticipada corregida',
                'Espera completa del flujo antes de redirigir',
              ],
            },
            {
              description: '🔧 Inconsistencias snake_case/camelCase',
              subItems: [
                'Unificación de formato en respuestas API',
                'Conversión automática en frontend',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.1.0',
      date: '09 May 2026',
      title: '🔐 Soporte inicial de 2FA (TOTP) + Mejoras en autenticación',
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
                'Uso de librería speakeasy para generación/verificación',
              ],
            },
            {
              description: '📱 Generación de QR para escanear',
              subItems: [
                'Endpoint GET /auth/2fa/generate-qr',
                'URL otpauth://totp/QuickNote:email',
                'QR code generado con librería qrcode',
              ],
            },
            {
              description: '🔑 Códigos de respaldo (backup codes)',
              subItems: [
                '10 códigos de un solo uso generados al habilitar 2FA',
                'Almacenamiento hasheado en base de datos',
                'Códigos regenerables desde configuración',
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
                'POST /auth/2fa/enable - Habilitar 2FA con código TOTP',
                'POST /auth/2fa/verify-enable - Verificar código durante habilitación',
                'POST /auth/2fa/verify-login - Verificar código durante login',
                'POST /auth/2fa/disable - Deshabilitar 2FA',
                'GET /auth/2fa/status - Ver estado de 2FA del usuario',
              ],
            },
          ],
        },
        {
          title: '🎨 Nuevos componentes frontend 2FA',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          color: '#8B5CF6',
          items: [
            {
              description: '📁 Componentes creados',
              subItems: [
                'TwoFactorSetup.tsx - Configuración inicial de 2FA (QR + código)',
                'TwoFactorVerify.tsx - Verificación durante login',
                'TwoFactorBackupCodes.tsx - Visualización y regeneración de códigos de respaldo',
              ],
            },
            {
              description: '🎯 Integración en SettingsPage',
              subItems: [
                'Toggle para habilitar/deshabilitar 2FA',
                'Sección dedicada a códigos de respaldo',
                'Diálogos modales para cada paso del proceso',
              ],
            },
          ],
        },
        {
          title: '🗄️ Base de datos y RLS',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          ),
          color: '#F59E0B',
          items: [
            {
              description: '📊 Nueva tabla two_factor_settings',
              subItems: [
                'user_id (UUID, PK) - Referencia a auth.users',
                'enabled (boolean) - Estado de 2FA',
                'secret_encrypted (text) - Secreto TOTP encriptado',
                'backup_codes_hashed (text[]) - Array de códigos de respaldo hasheados',
                'created_at / updated_at - Timestamps',
              ],
            },
            {
              description: '🔒 Políticas RLS implementadas',
              subItems: [
                'Solo el usuario puede leer/escribir su configuración 2FA',
                'Service role puede leer para verificación durante login',
              ],
            },
          ],
        },
        {
          title: '🐛 Correcciones v2.1.0',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          ),
          color: '#EF4444',
          items: [
            {
              description: '🔧 Importaciones rotas en servicios de Supabase',
              subItems: [
                'Corrección de paths en imports',
                'Reorganización de estructura de carpetas',
              ],
            },
            {
              description: '🔧 Error con result.data en cliente Supabase personalizado',
              subItems: [
                'Normalización de respuesta de Supabase',
                'Manejo consistente de result.data vs result',
              ],
            },
            {
              description: '🔧 Incompatibilidad con Pillow 10.2.0',
              subItems: [
                'Actualización de Pillow a 11.0.0',
                'Resuelve problemas de compatibilidad con Python 3.12',
              ],
            },
            {
              description: '🔧 Errores TypeScript en componentes 2FA',
              subItems: [
                'Tipado correcto de props y estados',
                'Definición de interfaces faltantes',
              ],
            },
            {
              description: '🔧 Redirecciones duplicadas y bucles en autenticación',
              subItems: [
                'Prevención de múltiples navigate() en useEffect',
                'Manejo de estado de carga para evitar loops',
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
                'Experiencia de usuario fluida en todas las páginas',
              ],
            },
            {
              description: '📱 Diseño responsive mejorado',
              subItems: [
                'Adaptación perfecta a todos los tamaños de pantalla',
                'Menús colapsables en dispositivos móviles',
                'Gestos táctiles para navegación',
                'Optimización para tablets y smartphones',
              ],
            },
            {
              description: '🌙 Modo oscuro/claro mejorado',
              subItems: [
                'Transiciones suaves entre temas',
                'Persistencia de preferencia del usuario',
                'Colores optimizados para cada tema',
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
                'Verificación criptográfica con @simplewebauthn/server',
              ],
            },
            {
              description: '📧 Autenticación tradicional con email/password',
              subItems: [
                'Login y registro con Supabase Auth',
                'Tokens ES256 generados por Supabase',
                'Mismo usuario ve sus notas sin importar el método',
                'Sincronización perfecta entre ambos métodos',
              ],
            },
            {
              description: '🔄 Middleware unificado de autenticación',
              subItems: [
                'Soporte para tokens HS256 (passkey) y ES256 (Supabase)',
                'Verificación dual con jwt.verify() y supabase.auth.getUser()',
                'Extracción consistente de userId del token',
                'Cliente Supabase unificado con el token del usuario',
              ],
            },
          ],
        },
        {
          title: '🛡️ Seguridad y Aislamiento de Datos',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          color: '#10B981',
          items: [
            {
              description: '🔒 Políticas RLS implementadas correctamente',
              subItems: [
                'Aislamiento total de notas entre usuarios',
                'Usuario 1 no puede ver notas del Usuario 2 y viceversa',
                'Políticas para SELECT, INSERT, UPDATE y DELETE',
                'Verificación con auth.uid() = user_id',
              ],
            },
            {
              description: '🗑️ Soft delete con columna deleted_at',
              subItems: [
                'Mover notas a papelera sin eliminarlas permanentemente',
                'Restaurar notas desde la papelera',
                'Filtrado de notas activas vs eliminadas',
              ],
            },
            {
              description: '🔐 Manejo seguro de tokens',
              subItems: [
                'Tokens con expiración de 7 días',
                'Almacenamiento seguro en localStorage',
                'Limpieza automática al cerrar sesión',
                'Verificación de tokens en cada petición',
              ],
            },
          ],
        },
        {
          title: '⚙️ Backend y APIs Mejorados',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          ),
          color: '#F59E0B',
          items: [
            {
              description: '🌐 Servidor Express unificado',
              subItems: [
                'Middleware authenticateToken con soporte dual',
                'Cliente getSupabaseClient para operaciones CRUD',
                'Logs detallados de depuración',
                'Manejo robusto de errores',
              ],
            },
            {
              description: '🗄️ Integración con Supabase',
              subItems: [
                'Uso de service role key para operaciones admin',
                'Cliente autenticado para respetar RLS',
                'Buckets de storage para avatares y banners',
                'Políticas RLS configuradas correctamente',
              ],
            },
            {
              description: '📊 Logs de depuración mejorados',
              subItems: [
                'Logs detallados en servidor Node.js',
                'Logs en consola del navegador con colores',
                'Información de tokens y headers',
                'Tiempos de respuesta de API',
              ],
            },
          ],
        },
        {
          title: '🐛 Correcciones Críticas v2.0.0',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          ),
          color: '#EF4444',
          items: [
            {
              description: '🔧 Corrección de RLS para notas',
              subItems: [
                'Solución al error "new row violates row-level security policy"',
                'Implementación de políticas correctas para todas las operaciones',
                'Uso de cliente autenticado con token del usuario',
              ],
            },
            {
              description: '🔄 Unificación de tokens de autenticación',
              subItems: [
                'Tokens HS256 (passkey) y ES256 (Supabase) funcionando juntos',
                'Middleware que verifica ambos tipos de token',
                'Mismo usuario ve sus notas sin importar el método',
              ],
            },
            {
              description: '📝 Corrección en creación de notas',
              subItems: [
                'Asignación correcta de user_id desde el token',
                'Validación de datos antes de insertar',
                'Manejo de errores mejorado',
              ],
            },
            {
              description: '🎨 Mejoras en UI/UX',
              subItems: [
                'Pantalla de bienvenida después de login',
                'Redirecciones correctas en todos los flujos',
                'Mensajes de error más descriptivos',
                'Animaciones suaves sin conflictos',
              ],
            },
          ],
        },
        {
          title: '📦 Dependencias Actualizadas v2.0.0',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          ),
          color: '#6366F1',
          items: [
            {
              description: '📦 Backend',
              subItems: [
                '@supabase/supabase-js: ^2.99.0',
                '@simplewebauthn/server: ^13.2.3',
                'express: ^5.2.1',
                'jsonwebtoken: ^9.0.3',
              ],
            },
            {
              description: '📦 Frontend',
              subItems: [
                'react: ^18.2.0',
                '@simplewebauthn/browser: ^13.2.2',
                'framer-motion: ^12.35.1',
                'tailwindcss: ^3.4.1',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.4.0',
      date: '08 Mar 2026',
      title: '🔐 Autenticación Biométrica y Mejoras de Perfil',
      gradientColors: ['#3B82F6', '#10B981'],
      changes: [
        {
          title: '🔑 Autenticación Biométrica (WebAuthn)',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '🖐️ Implementación inicial de WebAuthn',
              subItems: [
                'Soporte para huella dactilar y Face ID',
                'Registro de dispositivos biométricos',
                'Fallback a contraseña si no hay biometría',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.3.0',
      date: '07 Mar 2026',
      title: '🔐 Sistema de Autenticación y Recuperación de Contraseña',
      gradientColors: ['#3B82F6', '#EC4899'],
      changes: [
        {
          title: '🔐 Sistema de Autenticación Completo',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '🔑 Flujo completo de autenticación con Supabase',
              subItems: [
                'Login con email y contraseña',
                'Registro de nuevos usuarios',
                'Recuperación de contraseña con email',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.2.0',
      date: '07 Mar 2026',
      title: '🔐 Autenticación y Perfiles de Usuario',
      gradientColors: ['#3B82F6', '#EC4899'],
      changes: [
        {
          title: '🔐 Sistema de Autenticación',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '🔑 Autenticación básica con Supabase',
              subItems: [
                'Login con email y contraseña',
                'Registro de nuevos usuarios',
              ],
            },
          ],
        },
        {
          title: '👤 Perfil de Usuario',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          color: '#8B5CF6',
          items: [
            {
              description: '📱 Página de perfil básica',
              subItems: [
                'Banner de usuario',
                'Avatar circular',
                'Estadísticas de usuario',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.1.0',
      date: '05 Mar 2026',
      title: '🚀 Integración con Supabase y Mejoras Visuales',
      gradientColors: ['#3B82F6', '#8B5CF6'],
      changes: [
        {
          title: '📦 Base de datos y Backend',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          ),
          color: '#10B981',
          items: [
            {
              description: '🔄 Migración inicial a Supabase',
              subItems: [
                'Integración básica con Supabase',
                'Migración de IDs a UUIDs',
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
              ],
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      {/* Header con efecto glassmorphism */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="group p-2.5 hover:bg-gray-200/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Volver a configuración"
              title="Volver"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Historial de Cambios
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Evolución y mejoras de QuickNote Web
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de versiones */}
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        {versions.map((version, index) => {
          const isExpanded = expandedVersions.has(version.version);
          const isLatest = version.isLatest || index === 0;
          const gradientStart = version.gradientColors[0];
          const gradientEnd = version.gradientColors[1];

          return (
            <div
              key={version.version}
              className={`
                relative overflow-hidden transition-all duration-500 ease-out
                ${isExpanded ? 'scale-100' : 'hover:scale-[1.01] hover:shadow-2xl'}
                rounded-2xl
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
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-blue-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                </>
              )}

              {/* Header de la versión - Ahora con onClick para toggle */}
              <div
                className="relative p-6 cursor-pointer select-none"
                onClick={() => toggleVersion(version.version)}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Badge de versión con gradiente animado */}
                    <div
                      className={`
                        px-5 py-2.5 rounded-full text-white font-bold text-sm
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

                    {/* Fecha */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full border border-gray-300/30 dark:border-gray-600/30">
                      <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {version.date}
                      </span>
                    </div>

                    {/* Badge "Latest" animado */}
                    {isLatest && (
                      <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-bold shadow-lg animate-pulse">
                        ✨ Última versión
                      </div>
                    )}
                  </div>

                  {/* Botón de expandir/colapsar - con stopPropagation */}
                  <button
                    onClick={(e) => toggleVersion(version.version, e)}
                    className={`
                      p-3 rounded-full transition-all duration-500 cursor-pointer
                      hover:scale-110 active:scale-95
                      ${isExpanded 
                        ? `bg-gradient-to-r from-${gradientStart}/20 to-${gradientEnd}/20 shadow-lg` 
                        : 'bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'
                      }
                    `}
                    aria-label={isExpanded ? "Colapsar versión" : "Expandir versión"}
                    title={isExpanded ? "Colapsar" : "Expandir"}
                  >
                    <svg
                      className={`w-5 h-5 transition-all duration-500 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                      style={{ color: isExpanded ? gradientStart : undefined }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Título de la versión - aparece al expandir */}
                <div
                  className={`
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${isExpanded ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl"
                    style={{
                      backgroundColor: `${gradientStart}15`,
                      border: `1px solid ${gradientStart}25`,
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: gradientStart }}>
                      {version.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido expandible - Scroll suave */}
              <div
                ref={(el) => {
                  if (el) contentRefs.current.set(version.version, el);
                  else contentRefs.current.delete(version.version);
                }}
                className={`
                  overflow-y-auto transition-all duration-500 ease-in-out
                  ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
                  custom-scrollbar
                `}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: `${gradientStart} transparent`,
                }}
              >
                <div className="px-6 pb-6">
                  <div className="space-y-6">
                    {version.changes.map((category, catIndex) => (
                      <div
                        key={catIndex}
                        className="space-y-3 transform transition-all duration-500 hover:translate-x-1"
                        style={{
                          animation: `slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${catIndex * 0.08}s both`,
                        }}
                      >
                        {/* Título de categoría sticky */}
                        <div 
                          className="flex items-center gap-3 group sticky top-0 py-2 z-10 rounded-lg"
                          style={{
                            backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(249, 250, 251, 0.95)',
                            backdropFilter: 'blur(12px)',
                          }}
                        >
                          <div
                            className={`
                              p-2.5 rounded-xl transition-all duration-300
                              group-hover:scale-110 group-hover:shadow-lg
                            `}
                            style={{
                              backgroundColor: `${category.color}20`,
                              boxShadow: `0 4px 12px ${category.color}30`,
                            }}
                          >
                            <span style={{ color: category.color }} className="transition-transform duration-300 group-hover:rotate-12 block">
                              {category.icon}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                            {category.title}
                          </h3>
                          <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700" />
                        </div>

                        {/* Items de la categoría */}
                        <div className="space-y-3 pl-6">
                          {category.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="group/item p-4 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
                              style={{
                                backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                                border: `1px solid ${category.color}20`,
                                backdropFilter: 'blur(4px)',
                              }}
                            >
                              {/* Descripción principal */}
                              <div className="flex items-start gap-3">
                                <div
                                  className="p-1.5 rounded-lg mt-0.5 transition-all duration-300 group-hover/item:scale-110"
                                  style={{ backgroundColor: `${category.color}25` }}
                                >
                                  <svg
                                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover/item:translate-x-0.5"
                                    style={{ color: category.color }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {item.description}
                                </span>
                              </div>

                              {/* Sub-items con viñetas animadas */}
                              {item.subItems && item.subItems.length > 0 && (
                                <div className="mt-3 ml-10 space-y-2">
                                  {item.subItems.map((subItem, subIndex) => (
                                    <div
                                      key={subIndex}
                                      className="flex items-start gap-2.5 text-xs group/sub transition-all duration-200 hover:translate-x-1"
                                    >
                                      <span
                                        className="w-1.5 h-1.5 rounded-full mt-1.5 transition-all duration-300 group-hover/sub:scale-150 group-hover/sub:shadow-lg"
                                        style={{ backgroundColor: category.color }}
                                      />
                                      <span className="text-gray-600 dark:text-gray-400 group-hover/sub:text-gray-800 dark:group-hover/sub:text-gray-200 transition-colors duration-300">
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
                        className="mt-6 p-6 rounded-xl text-center transform transition-all duration-500 hover:scale-[1.02] animate-pulse"
                        style={{
                          background: `linear-gradient(135deg, ${gradientStart}15, ${gradientEnd}15)`,
                          border: `1px solid ${gradientStart}30`,
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <span className="text-base font-bold" style={{ color: gradientStart }}>
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

      {/* Estilos globales */}
      <style>{`
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

        /* Custom scrollbar premium */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
      `}</style>
    </div>
  );
};

export default ChangelogPage;