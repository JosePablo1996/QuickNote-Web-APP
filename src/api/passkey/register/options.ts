import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types';

// Tipos - Definimos tipos específicos para transports
type AllowedTransport = "internal" | "hybrid" | "usb" | "nfc" | "ble";

export interface RegistrationOptionsResponse {
  challenge: string;
  rp: {
    name: string;
    id?: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: {
    type: "public-key";
    alg: number;
  }[];
  timeout?: number;
  excludeCredentials?: {
    id: string;
    type: "public-key";
    transports?: AllowedTransport[];
  }[];
  authenticatorSelection?: {
    residentKey?: string;
    userVerification?: string;
    authenticatorAttachment?: string;
  };
  attestation?: string;
}

interface UserRecord {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface PasskeyRecord {
  credential_id: string;
  transports?: AuthenticatorTransportFuture[];
}

// Función para filtrar transports válidos
function filterTransports(transports?: AuthenticatorTransportFuture[]): AllowedTransport[] | undefined {
  if (!transports) return undefined;
  
  const allowedTransports: AllowedTransport[] = ['internal', 'hybrid', 'usb', 'nfc', 'ble'];
  return transports.filter((t): t is AllowedTransport => 
    allowedTransports.includes(t as AllowedTransport)
  );
}

/**
 * Genera opciones de registro para una nueva passkey
 * @param email - Email del usuario que quiere registrar una passkey
 * @param supabaseAdmin - Cliente de Supabase con permisos de administrador
 * @returns Opciones de registro para el navegador
 */
export async function getPasskeyRegistrationOptions(
  email: string,
  supabaseAdmin: any
): Promise<RegistrationOptionsResponse> {
  try {
    const normalizedEmail = email.toLowerCase();
    console.log('🔍 [Register/Options] Generando opciones de registro para:', normalizedEmail);

    // 1. Buscar usuario en Supabase Auth
    console.log('🔍 [Register/Options] Buscando usuario en Supabase Auth...');
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ [Register/Options] Error al listar usuarios:', userError);
      throw new Error('Error al buscar usuario');
    }
    
    const user = users.find((u: UserRecord) => u.email?.toLowerCase() === normalizedEmail);
    
    if (!user) {
      console.error('❌ [Register/Options] Usuario no encontrado:', normalizedEmail);
      throw new Error('Usuario no encontrado');
    }

    console.log('✅ [Register/Options] Usuario encontrado - ID:', user.id);

    // 2. Convertir el userID a Uint8Array para WebAuthn
    const userIDBuffer = new TextEncoder().encode(user.id);
    console.log('🔑 [Register/Options] User ID buffer generado');

    // 3. Buscar passkeys existentes para excluirlas (evitar duplicados)
    console.log('🔍 [Register/Options] Buscando passkeys existentes...');
    const { data: passkeys, error: passkeyError } = await supabaseAdmin
      .from('passkeys')
      .select('credential_id, transports')
      .eq('user_id', user.id);

    if (passkeyError) {
      console.error('❌ [Register/Options] Error al buscar passkeys existentes:', passkeyError);
      throw new Error('Error al verificar passkeys existentes');
    }

    console.log(`🔑 [Register/Options] Usuario tiene ${passkeys?.length || 0} passkey(s) registrada(s)`);

    // 4. Obtener configuración del RP (Relying Party)
    const rpID = process.env.VITE_DOMAIN || 'localhost';
    const rpName = 'QuickNote';
    const origin = process.env.VITE_ORIGIN || 'http://localhost:5173';
    
    console.log(`🌐 [Register/Options] RP ID: ${rpID}`);
    console.log(`🌐 [Register/Options] RP Name: ${rpName}`);
    console.log(`🌐 [Register/Options] Origin: ${origin}`);

    // 5. Generar opciones de registro usando @simplewebauthn/server
    console.log('🔧 [Register/Options] Generando opciones de registro...');
    
    const options = await generateRegistrationOptions({
      rpName: rpName,
      rpID: rpID,
      userID: userIDBuffer,
      userName: normalizedEmail,
      userDisplayName: user.user_metadata?.full_name || normalizedEmail.split('@')[0] || 'Usuario',
      
      // No requerimos attestation para simplificar
      attestationType: 'none',
      
      // Excluir credenciales ya registradas
      excludeCredentials: passkeys?.map((pk: PasskeyRecord) => ({
        id: pk.credential_id,
        type: 'public-key' as const,
        transports: pk.transports ? filterTransports(pk.transports) : undefined,
      })) || [],
      
      // Configuración del autenticador
      authenticatorSelection: {
        // Preferir resident key para mejor experiencia
        residentKey: 'preferred',
        // Preferir verificación de usuario (biometría/PIN)
        userVerification: 'preferred',
        // Forzar autenticador de plataforma (Windows Hello, Touch ID, etc.)
        authenticatorAttachment: 'platform',
      },
      
      // Timeout de 60 segundos
      timeout: 60000,
      
      // Algoritmos soportados
      supportedAlgorithmIDs: [-7, -257], // ES256 y RS256
    });

    console.log('🎯 [Register/Options] Opciones generadas exitosamente');
    console.log(`📝 [Register/Options] Challenge: ${options.challenge.substring(0, 10)}...`);
    console.log(`📝 [Register/Options] Timeout: ${options.timeout}ms`);
    console.log(`📝 [Register/Options] User Verification: ${options.authenticatorSelection?.userVerification}`);

    // 6. Mapear las opciones para asegurar tipos correctos
    const mappedOptions: RegistrationOptionsResponse = {
      challenge: options.challenge,
      rp: {
        name: options.rp.name,
        id: options.rp.id,
      },
      user: {
        id: options.user.id,
        name: options.user.name,
        displayName: options.user.displayName,
      },
      pubKeyCredParams: options.pubKeyCredParams,
      timeout: options.timeout,
      excludeCredentials: options.excludeCredentials?.map(cred => ({
        id: cred.id,
        type: 'public-key' as const,
        transports: cred.transports ? filterTransports(cred.transports) : undefined,
      })),
      authenticatorSelection: options.authenticatorSelection,
      attestation: options.attestation,
    };

    // NOTA: El challenge se guarda en el servidor (server.ts), no aquí
    // Esta función SOLO genera las opciones

    console.log('✅ [Register/Options] Proceso completado exitosamente');

    return mappedOptions;

  } catch (error) {
    console.error('❌ [Register/Options] Error al generar opciones de registro:', error);
    
    // Mejorar el mensaje de error para debugging
    if (error instanceof Error) {
      console.error('❌ [Register/Options] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    throw error;
  }
}