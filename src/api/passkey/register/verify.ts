import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

// Tipos
export interface VerifyRegistrationResponse {
  verified: boolean;
  credentialId: string;
}

interface UserRecord {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface ChallengeRecord {
  challenge: string;
}

/**
 * Verifica el registro de una nueva passkey
 * @param email - Email del usuario que registra la passkey
 * @param credential - Respuesta de registro del navegador
 * @param deviceName - Nombre descriptivo del dispositivo (opcional)
 * @param supabaseAdmin - Cliente de Supabase con permisos de administrador
 * @returns Resultado de la verificación
 */
export async function verifyPasskeyRegistration(
  email: string,
  credential: RegistrationResponseJSON,
  deviceName: string | undefined,
  supabaseAdmin: any
): Promise<VerifyRegistrationResponse> {
  try {
    const normalizedEmail = email.toLowerCase();
    console.log('🔐 [Register/Verify] Iniciando verificación de registro para:', normalizedEmail);
    console.log('📦 [Register/Verify] Credential ID recibido:', credential.id);
    console.log('📦 [Register/Verify] Tipo de credential:', credential.type);
    console.log('📦 [Register/Verify] Device name:', deviceName || 'No especificado');

    // 1. Buscar usuario en Supabase Auth
    console.log('🔍 [Register/Verify] Buscando usuario en Supabase Auth...');
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ [Register/Verify] Error al listar usuarios:', userError);
      throw new Error('Error al buscar usuario');
    }
    
    const user = users.find((u: UserRecord) => u.email?.toLowerCase() === normalizedEmail);
    
    if (!user) {
      console.error('❌ [Register/Verify] Usuario no encontrado:', normalizedEmail);
      throw new Error('Usuario no encontrado');
    }

    console.log('✅ [Register/Verify] Usuario encontrado - ID:', user.id);

    // 2. Obtener challenge guardado
    console.log('🔍 [Register/Verify] Buscando challenge en BD...');
    const { data: challengeData, error: challengeError } = await supabaseAdmin
      .from('auth_challenges')
      .select('challenge')
      .eq('user_id', user.id)
      .single();

    if (challengeError || !challengeData) {
      console.error('❌ [Register/Verify] Challenge no encontrado o expirado:', challengeError);
      throw new Error('Challenge no encontrado o expirado. Por favor, intenta de nuevo.');
    }

    console.log('✅ [Register/Verify] Challenge recuperado de BD');
    console.log(`📝 [Register/Verify] Challenge: ${challengeData.challenge.substring(0, 10)}...`);

    // 3. Verificar el registro con @simplewebauthn/server
    console.log('🔐 [Register/Verify] Verificando respuesta de registro...');
    
    // Obtener configuración del RP
    const expectedOrigin = process.env.VITE_ORIGIN || 'http://localhost:5173';
    const expectedRPID = process.env.VITE_DOMAIN || 'localhost';
    
    console.log(`🌐 [Register/Verify] Expected Origin: ${expectedOrigin}`);
    console.log(`🌐 [Register/Verify] Expected RPID: ${expectedRPID}`);

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: challengeData.challenge,
        expectedOrigin: expectedOrigin,
        expectedRPID: expectedRPID,
        requireUserVerification: true,
      });
    } catch (verifyError) {
      console.error('❌ [Register/Verify] Error en verifyRegistrationResponse:', verifyError);
      
      if (verifyError instanceof Error) {
        console.error('❌ [Register/Verify] Detalles del error:', {
          message: verifyError.message,
          stack: verifyError.stack,
          name: verifyError.name
        });
      }
      
      throw new Error('Error en verificación criptográfica: ' + (verifyError instanceof Error ? verifyError.message : 'desconocido'));
    }

    if (!verification.verified || !verification.registrationInfo) {
      console.log('❌ [Register/Verify] Verificación fallida - No se pudo verificar el registro');
      throw new Error('Registro fallido: la verificación criptográfica no fue exitosa');
    }

    console.log('✅ [Register/Verify] Verificación exitosa');

    const { registrationInfo } = verification;

    // 4. Extraer los datos de la nueva passkey
    const credentialId = registrationInfo.credential.id;
    const credentialPublicKey = registrationInfo.credential.publicKey;
    const counter = registrationInfo.credential.counter;

    console.log('📝 [Register/Verify] Credential ID extraído:', credentialId);
    console.log(`📝 [Register/Verify] Contador inicial: ${counter}`);
    console.log(`📝 [Register/Verify] Tipo de clave pública: ${registrationInfo.credential.publicKey instanceof Uint8Array ? 'Uint8Array' : typeof registrationInfo.credential.publicKey}`);

    // 5. Convertir public key a base64 para guardar en BD
    // Aseguramos que sea un Buffer para convertir a base64
    let publicKeyBase64: string;
    
    if (registrationInfo.credential.publicKey instanceof Uint8Array) {
      // Si es Uint8Array, convertir directamente
      publicKeyBase64 = Buffer.from(registrationInfo.credential.publicKey).toString('base64');
    } else if (typeof registrationInfo.credential.publicKey === 'string') {
      // Si ya es string, asumimos que es base64
      publicKeyBase64 = registrationInfo.credential.publicKey;
    } else {
      // Intentar convertir como Buffer
      publicKeyBase64 = Buffer.from(registrationInfo.credential.publicKey as any).toString('base64');
    }

    console.log('✅ [Register/Verify] Clave pública convertida a base64');

    // 6. Guardar la passkey en la base de datos
    console.log('💾 [Register/Verify] Guardando passkey en BD...');
    
    // Verificar que no exista ya esta credential_id
    const { data: existingPasskey, error: checkError } = await supabaseAdmin
      .from('passkeys')
      .select('id')
      .eq('credential_id', credentialId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ [Register/Verify] Error al verificar passkey existente:', checkError);
    }

    if (existingPasskey) {
      console.error('❌ [Register/Verify] Ya existe una passkey con este credential ID:', credentialId);
      throw new Error('Esta passkey ya está registrada');
    }

    // Insertar la nueva passkey
    const { error: insertError } = await supabaseAdmin
      .from('passkeys')
      .insert({
        user_id: user.id,
        credential_id: credentialId,
        public_key: publicKeyBase64,
        counter: counter,
        device_name: deviceName || 'Dispositivo biométrico',
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString(),
        // Guardar también los transports si vienen en la respuesta
        transports: credential.response?.transports || ['internal', 'hybrid', 'usb', 'nfc', 'ble'],
      });

    if (insertError) {
      console.error('❌ [Register/Verify] Error guardando passkey:', insertError);
      
      // Verificar si es error de duplicado
      if (insertError.code === '23505') { // Código de PostgreSQL para unique violation
        throw new Error('Esta passkey ya está registrada en el sistema');
      }
      
      throw new Error('Error al guardar la passkey en la base de datos');
    }

    console.log('✅ [Register/Verify] Passkey guardada en BD exitosamente');

    // 7. Limpiar challenge usado
    console.log('🧹 [Register/Verify] Eliminando challenge usado...');
    const { error: deleteError } = await supabaseAdmin
      .from('auth_challenges')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('⚠️ [Register/Verify] Error al eliminar challenge:', deleteError);
      // No lanzamos error porque el registro ya fue exitoso
    } else {
      console.log('✅ [Register/Verify] Challenge eliminado');
    }

    console.log('✅ [Register/Verify] Proceso de registro completado exitosamente para:', normalizedEmail);

    return {
      verified: true,
      credentialId: credentialId,
    };

  } catch (error) {
    console.error('❌ [Register/Verify] Error en verifyPasskeyRegistration:', error);
    
    // Mejorar el mensaje de error para debugging
    if (error instanceof Error) {
      console.error('❌ [Register/Verify] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    throw error;
  }
}