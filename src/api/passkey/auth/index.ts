/**
 * API de autenticación con passkey
 * Este archivo exporta funciones para interactuar con el backend de passkey
 */

export interface AuthOptionsResponse {
  challenge: string;
  allowCredentials?: {
    id: string;
    type: "public-key";
    transports?: string[];
  }[];
  timeout?: number;
  userVerification?: string;
  rpId?: string;
}

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

/**
 * Obtiene las opciones de autenticación para un usuario
 * @param email - Email del usuario
 * @returns Opciones de autenticación
 */
export async function getPasskeyAuthOptions(email: string): Promise<AuthOptionsResponse> {
  const response = await fetch('/api/passkey/auth/options', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener opciones de autenticación');
  }

  return response.json();
}

/**
 * Verifica la autenticación con passkey
 * @param email - Email del usuario
 * @param credential - Respuesta de autenticación del navegador
 * @returns Resultado de la verificación
 */
export async function verifyPasskeyAuthentication(
  email: string,
  credential: any
): Promise<AuthVerifyResponse> {
  const response = await fetch('/api/passkey/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, ...credential }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al verificar autenticación');
  }

  return response.json();
}