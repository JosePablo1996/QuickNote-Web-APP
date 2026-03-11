/**
 * API de registro de passkey
 * Este archivo exporta funciones para interactuar con el backend de passkey
 */

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
    transports?: string[];
  }[];
  authenticatorSelection?: {
    residentKey?: string;
    userVerification?: string;
    authenticatorAttachment?: string;
  };
  attestation?: string;
}

export interface VerifyRegistrationResponse {
  verified: boolean;
  credentialId: string;
}

/**
 * Obtiene las opciones de registro para un usuario
 * @param email - Email del usuario
 * @returns Opciones de registro
 */
export async function getPasskeyRegistrationOptions(
  email: string
): Promise<RegistrationOptionsResponse> {
  const response = await fetch('/api/passkey/register/options', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Usuario no encontrado');
    }
    throw new Error(error.error || 'Error al obtener opciones de registro');
  }

  return response.json();
}

/**
 * Verifica el registro de una passkey
 * @param email - Email del usuario
 * @param credential - Respuesta de registro del navegador
 * @param deviceName - Nombre del dispositivo (opcional)
 * @returns Resultado de la verificación
 */
export async function verifyPasskeyRegistration(
  email: string,
  credential: any,
  deviceName?: string
): Promise<VerifyRegistrationResponse> {
  const response = await fetch('/api/passkey/register/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      email, 
      ...credential,
      deviceName 
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al verificar registro');
  }

  return response.json();
}