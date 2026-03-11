import { generateAuthenticationOptions } from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types';

// Tipos - Definimos tipos específicos para transports
type AllowedTransport = "internal" | "hybrid" | "usb" | "nfc" | "ble";

export interface AuthOptionsResponse {
  challenge: string;
  allowCredentials?: {
    id: string;
    type: "public-key";
    transports?: AllowedTransport[];
  }[];
  timeout?: number;
  userVerification?: string;
  rpId?: string;
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
 * Genera opciones de autenticación para un usuario con passkeys registradas
 * @param email - Email del usuario que intenta autenticarse
 * @param passkeys - Lista de passkeys registradas del usuario (incluye transports)
 * @returns Opciones de autenticación para el navegador
 */
export async function getPasskeyAuthOptions(
  email: string,
  passkeys: { credential_id: string; transports?: AuthenticatorTransportFuture[] }[]
): Promise<AuthOptionsResponse> {
  try {
    const normalizedEmail = email.toLowerCase();
    console.log('🔍 [Auth/Options] Generando opciones de autenticación para:', normalizedEmail);

    // Validar que hay passkeys
    if (!passkeys || passkeys.length === 0) {
      console.error('❌ [Auth/Options] No hay passkeys registradas para el usuario:', normalizedEmail);
      throw new Error('No hay passkeys registradas para este usuario');
    }

    console.log(`🔑 [Auth/Options] Usuario tiene ${passkeys.length} passkey(s) registrada(s)`);

    // Obtener el dominio desde variables de entorno o usar localhost por defecto
    const rpID = process.env.VITE_DOMAIN || 'localhost';
    console.log(`🌐 [Auth/Options] RP ID configurado: ${rpID}`);

    // Generar opciones de autenticación usando @simplewebauthn/server
    const options = await generateAuthenticationOptions({
      rpID: rpID,
      
      // Lista de credenciales permitidas (las passkeys del usuario)
      allowCredentials: passkeys.map((pk) => ({
        id: pk.credential_id,
        type: 'public-key' as const,
        // Incluir transports si existen, filtrados para tipos válidos
        transports: pk.transports ? filterTransports(pk.transports) : undefined,
      })),
      
      // Preferir verificación de usuario (biometría/PIN)
      userVerification: 'preferred',
      
      // Timeout de 60 segundos
      timeout: 60000,
    });

    console.log('🎯 [Auth/Options] Opciones generadas exitosamente');
    console.log(`📝 [Auth/Options] Challenge: ${options.challenge.substring(0, 10)}...`);
    console.log(`📝 [Auth/Options] Timeout: ${options.timeout}ms`);
    console.log(`📝 [Auth/Options] User Verification: ${options.userVerification}`);

    // Mapear las opciones para asegurar tipos correctos
    const mappedOptions: AuthOptionsResponse = {
      challenge: options.challenge,
      allowCredentials: options.allowCredentials?.map(cred => ({
        id: cred.id,
        type: 'public-key' as const,
        transports: cred.transports ? filterTransports(cred.transports) : undefined,
      })),
      timeout: options.timeout,
      userVerification: options.userVerification,
      rpId: options.rpId,
    };

    return mappedOptions;

  } catch (error) {
    console.error('❌ [Auth/Options] Error al generar opciones de autenticación:', error);
    
    // Mejorar el mensaje de error para debugging
    if (error instanceof Error) {
      console.error('❌ [Auth/Options] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    throw error;
  }
}