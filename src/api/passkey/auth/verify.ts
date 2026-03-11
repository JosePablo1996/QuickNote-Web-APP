import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Tipos
export interface AuthVerifyResponse {
  verified: boolean;
  token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

interface PasskeyRecord {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  device_name: string;
  created_at: string;
  last_used?: string;
}

interface UserRecord {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

/**
 * Verifica la autenticación con passkey
 */
export async function verifyPasskeyAuthentication(
  email: string,
  credential: AuthenticationResponseJSON,
  supabaseAdmin: any
): Promise<AuthVerifyResponse> {
  try {
    const normalizedEmail = email.toLowerCase();
    console.log('🔐 [Auth/Verify] Iniciando verificación para:', normalizedEmail);
    console.log('📦 [Auth/Verify] Credential ID recibido:', credential.id);

    // 1. Buscar usuario en Supabase Auth
    console.log('🔍 [Auth/Verify] Buscando usuario en Supabase Auth...');
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ [Auth/Verify] Error al listar usuarios:', userError);
      throw new Error('Error al buscar usuario');
    }
    
    const user = users.find((u: UserRecord) => u.email?.toLowerCase() === normalizedEmail);
    
    if (!user) {
      console.error('❌ [Auth/Verify] Usuario no encontrado:', normalizedEmail);
      throw new Error('Usuario no encontrado');
    }

    console.log('✅ [Auth/Verify] Usuario encontrado - ID:', user.id);

    // 2. Obtener challenge guardado
    console.log('🔍 [Auth/Verify] Buscando challenge en BD...');
    const { data: challengeData, error: challengeError } = await supabaseAdmin
      .from('auth_challenges')
      .select('challenge')
      .eq('user_id', user.id)
      .single();

    if (challengeError || !challengeData) {
      console.error('❌ [Auth/Verify] Challenge no encontrado o expirado:', challengeError);
      throw new Error('Challenge no encontrado o expirado');
    }

    console.log('✅ [Auth/Verify] Challenge recuperado de BD');

    // 3. Obtener la passkey del usuario
    console.log('🔍 [Auth/Verify] Buscando passkey en BD...');
    const { data: passkeys, error: passkeyError } = await supabaseAdmin
      .from('passkeys')
      .select('*')
      .eq('user_id', user.id)
      .eq('credential_id', credential.id);

    if (passkeyError) {
      console.error('❌ [Auth/Verify] Error al buscar passkey:', passkeyError);
      throw new Error('Error al buscar passkey');
    }

    if (!passkeys?.length) {
      console.error('❌ [Auth/Verify] Passkey no encontrada para credential ID:', credential.id);
      throw new Error('Passkey no encontrada');
    }

    const passkey = passkeys[0] as PasskeyRecord;
    console.log('✅ [Auth/Verify] Passkey encontrada - ID:', passkey.id);
    console.log(`📊 [Auth/Verify] Contador actual: ${passkey.counter}`);

    // 4. Verificar la autenticación
    console.log('🔐 [Auth/Verify] Verificando respuesta de autenticación...');
    
    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: challengeData.challenge,
        expectedOrigin: process.env.VITE_ORIGIN || 'http://localhost:5173',
        expectedRPID: process.env.VITE_DOMAIN || 'localhost',
        credential: {
          id: passkey.credential_id,
          publicKey: Buffer.from(passkey.public_key, 'base64'),
          counter: passkey.counter,
        },
        requireUserVerification: true,
      });
    } catch (verifyError) {
      console.error('❌ [Auth/Verify] Error en verifyAuthenticationResponse:', verifyError);
      throw new Error('Error en verificación criptográfica');
    }

    if (!verification.verified) {
      console.log('❌ [Auth/Verify] Verificación fallida - Firma inválida');
      throw new Error('Autenticación fallida');
    }

    console.log('✅ [Auth/Verify] Verificación exitosa');
    console.log(`📊 [Auth/Verify] Nuevo contador: ${verification.authenticationInfo.newCounter}`);

    // 5. Actualizar contador
    console.log('🔄 [Auth/Verify] Actualizando contador en BD...');
    await supabaseAdmin
      .from('passkeys')
      .update({ 
        counter: verification.authenticationInfo.newCounter,
        last_used: new Date().toISOString(),
      })
      .eq('id', passkey.id);

    // 6. Limpiar challenge
    console.log('🧹 [Auth/Verify] Eliminando challenge usado...');
    await supabaseAdmin
      .from('auth_challenges')
      .delete()
      .eq('user_id', user.id);

    // ============== 🔑 GENERAR TOKEN CON FORMATO CORRECTO ==============

    console.log('🔑 [Auth/Verify] Generando token JWT...');

    // Verificar que tenemos las variables necesarias
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ [Auth/Verify] JWT_SECRET no configurado');
      throw new Error('Error de configuración del servidor');
    }

    // ✅ IMPORTANTE: Incluir BOTH "userId" y "sub" para compatibilidad
    const payload = {
      // Para el backend de Python y AuthProvider.tsx
      userId: user.id,
      email: user.email,
      
      // Para Supabase (formato estándar)
      aud: 'authenticated',
      sub: user.id,
      role: 'authenticated',
      user_metadata: user.user_metadata || {},
      
      // Estándar JWT
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 días
    };

    console.log('📦 [Auth/Verify] Payload del token:', {
      userId: payload.userId,
      sub: payload.sub,
      email: payload.email,
      exp: new Date(payload.exp * 1000).toISOString()
    });

    // Firmar el token
    const token = jwt.sign(payload, jwtSecret);
    
    console.log('✅ [Auth/Verify] Token JWT generado exitosamente');
    console.log(`🔑 [Auth/Verify] Token (primeros 30): ${token.substring(0, 30)}...`);

    // 7. Preparar respuesta
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
    
    console.log('✅ [Auth/Verify] Proceso completado exitosamente para:', normalizedEmail);

    return {
      verified: true,
      token: token,
      refresh_token: token, // Usar el mismo token como refresh por ahora
      user: {
        id: user.id,
        email: user.email || '',
        name: userName,
      }
    };

  } catch (error) {
    console.error('❌ [Auth/Verify] Error en verifyPasskeyAuthentication:', error);
    throw error;
  }
}