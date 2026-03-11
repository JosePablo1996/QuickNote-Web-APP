import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { getPasskeyAuthOptions } from './src/api/passkey/auth/options.js';
import { verifyPasskeyAuthentication } from './src/api/passkey/auth/verify.js';
import { getPasskeyRegistrationOptions } from './src/api/passkey/register/options.js';
import { verifyPasskeyRegistration } from './src/api/passkey/register/verify.js';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración CORS
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json());

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`📨 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Inicializar Supabase admin con la service role key (solo para operaciones de admin)
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('✅ Supabase admin client initialized');

// ==================== MIDDLEWARE DE AUTENTICACIÓN UNIFICADO ====================

// Interfaz para el usuario en el request
interface UserPayload {
  userId: string;
  email: string;
  sub?: string;
  authMethod: 'passkey' | 'email';
}

// Extender el tipo Request de Express
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      token?: string;
    }
  }
}

/**
 * Middleware para verificar token JWT (soporta HS256 y ES256)
 * Siempre extrae el userId y guarda el token en req
 */
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ Token no proporcionado');
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  console.log('🔑 Verificando token:', token.substring(0, 30) + '...');
  
  // Guardar el token en req para usarlo después
  req.token = token;

  // 1️⃣ Intentar verificar con JWT_SECRET (para tokens HS256 de passkey)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quicknote-super-secret-jwt-key-change-in-production') as JwtPayload;
    console.log('✅ Token HS256 (passkey) verificado correctamente');
    console.log('📦 Payload:', {
      userId: decoded.userId || decoded.sub,
      email: decoded.email
    });
    
    req.user = {
      userId: decoded.userId || decoded.sub || '',
      email: decoded.email || '',
      sub: decoded.sub || decoded.userId,
      authMethod: 'passkey'
    };
    return next();
  } catch (hs256Error) {
    console.log('⚠️ No es token HS256, intentando verificación con Supabase...');
  }

  // 2️⃣ Intentar verificar con Supabase (para tokens ES256 de email/password)
  try {
    // Crear cliente de Supabase con el token
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // Verificar el token obteniendo el usuario
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('❌ Token Supabase inválido:', error);
      return res.status(403).json({ error: 'Token inválido' });
    }

    console.log('✅ Token ES256 (Supabase) verificado correctamente');
    console.log('👤 Usuario:', user.id, user.email);

    req.user = {
      userId: user.id,
      email: user.email || '',
      sub: user.id,
      authMethod: 'email'
    };
    
    next();
  } catch (supabaseError) {
    console.error('❌ Error verificando token:', supabaseError);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

/**
 * Crear cliente de Supabase con el token del usuario
 * FUNCIONA PARA CUALQUIER TIPO DE TOKEN
 */
const getSupabaseClient = (req: express.Request) => {
  const token = req.token; // El token ya está guardado por el middleware
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  console.log('🔑 Creando cliente Supabase autenticado');

  return createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}` // El token original
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'quicknote-api',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== RUTAS DE NOTAS ====================

/**
 * Obtener todas las notas del usuario autenticado
 * FUNCIONA IGUAL PARA PASSKEY Y EMAIL/PASSWORD
 */
app.get('/api/v1/notes/', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const deleted = req.query.deleted === 'true';
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log(`📥 GET /api/v1/notes/ - Usuario: ${userId}, Método: ${req.user?.authMethod}`);

    // ✅ USAR EL MISMO CLIENTE PARA AMBOS MÉTODOS
    const supabase = getSupabaseClient(req);

    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);

    if (deleted) {
      query = query.not('deleted_at', 'is', null);
    } else {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener notas:', error);
      return res.status(500).json({ error: 'Error al obtener notas' });
    }

    console.log(`✅ ${data.length} notas encontradas para usuario ${userId}`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error en GET /notes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Obtener una nota por ID
 */
app.get('/api/v1/notes/:id', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log(`🔍 GET /api/v1/notes/${id} - Usuario: ${userId}`);

    const supabase = getSupabaseClient(req);

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }
      console.error('❌ Error al obtener nota:', error);
      return res.status(500).json({ error: 'Error al obtener nota' });
    }

    res.json(data);
  } catch (error) {
    console.error('❌ Error en GET /notes/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Crear una nueva nota
 */
app.post('/api/v1/notes/', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { title, content, color, is_favorite, is_archived, tags } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log(`📝 POST /api/v1/notes/ - Usuario: ${userId}, Método: ${req.user?.authMethod}`);
    console.log('📦 Datos recibidos:', { title, content, color, is_favorite, is_archived, tags });

    if (!title) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    const supabase = getSupabaseClient(req);

    const newNote = {
      title,
      content: content || '',
      color: color || '#3B82F6',
      is_favorite: is_favorite || false,
      is_archived: is_archived || false,
      tags: tags || [],
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    console.log('📦 Nueva nota a insertar:', newNote);

    const { data, error } = await supabase
      .from('notes')
      .insert([newNote])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear nota:', error);
      return res.status(500).json({ error: 'Error al crear nota' });
    }

    console.log('✅ Nota creada:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('❌ Error en POST /notes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Actualizar una nota
 */
app.put('/api/v1/notes/:id', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log(`✏️ PUT /api/v1/notes/${id} - Usuario: ${userId}`);

    const supabase = getSupabaseClient(req);

    const { data: existingNote, error: checkError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingNote) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar nota:', error);
      return res.status(500).json({ error: 'Error al actualizar nota' });
    }

    console.log('✅ Nota actualizada:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ Error en PUT /notes/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Eliminar una nota
 */
app.delete('/api/v1/notes/:id', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log(`🗑️ DELETE /api/v1/notes/${id} - Usuario: ${userId}`);

    const supabase = getSupabaseClient(req);

    const { data: existingNote, error: checkError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingNote) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error al eliminar nota:', error);
      return res.status(500).json({ error: 'Error al eliminar nota' });
    }

    console.log('✅ Nota eliminada');
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error en DELETE /notes/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==================== RUTAS DE PASSKEY ====================

/**
 * Obtener opciones para iniciar sesión con passkey
 */
app.post('/api/passkey/auth/options', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    console.log('📨 POST /api/passkey/auth/options - email:', email);

    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error al listar usuarios:', userError);
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }
    
    const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('✅ Usuario encontrado - ID:', user.id);

    const { data: passkeys, error: passkeyError } = await supabaseAdmin
      .from('passkeys')
      .select('credential_id, transports')
      .eq('user_id', user.id);

    if (passkeyError) {
      console.error('❌ Error al obtener passkeys:', passkeyError);
      return res.status(500).json({ error: 'Error al obtener passkeys' });
    }

    if (!passkeys?.length) {
      console.log('❌ No hay passkeys registradas para:', email);
      return res.status(404).json({ error: 'No hay passkeys registradas para este usuario' });
    }

    console.log(`✅ Usuario tiene ${passkeys.length} passkey(s) registrada(s)`);

    const options = await getPasskeyAuthOptions(email, passkeys);
    
    const { error: challengeError } = await supabaseAdmin
      .from('auth_challenges')
      .upsert({
        user_id: user.id,
        challenge: options.challenge,
        expires_at: new Date(Date.now() + 60000).toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (challengeError) {
      console.error('❌ Error al guardar challenge:', challengeError);
      return res.status(500).json({ error: 'Error al guardar challenge' });
    }

    console.log('✅ Challenge guardado para usuario:', user.id);
    console.log('✅ Opciones generadas exitosamente');
    
    res.json(options);

  } catch (error) {
    console.error('❌ Error en auth/options:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Verificar autenticación con passkey
 */
app.post('/api/passkey/auth/verify', async (req, res) => {
  try {
    const { email, ...credential } = req.body;
    
    if (!email || !credential) {
      return res.status(400).json({ error: 'Email y credential son requeridos' });
    }

    console.log('📨 POST /api/passkey/auth/verify - email:', email);
    console.log('📦 Credential ID:', credential.id);

    const result = await verifyPasskeyAuthentication(email, credential, supabaseAdmin);
    
    console.log('✅ Autenticación exitosa para:', email);
    res.json(result);

  } catch (error) {
    console.error('❌ Error en auth/verify:', error);
    
    const status = error instanceof Error && 
      (error.message === 'Usuario no encontrado' || 
       error.message === 'Passkey no encontrada' ||
       error.message === 'Challenge no encontrado o expirado') 
      ? 404 : 400;
    
    res.status(status).json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
});

/**
 * Obtener opciones para registrar una nueva passkey
 */
app.post('/api/passkey/register/options', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    console.log('📨 POST /api/passkey/register/options - email:', email);

    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error al listar usuarios:', userError);
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }
    
    const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('✅ Usuario encontrado - ID:', user.id);

    const options = await getPasskeyRegistrationOptions(email, supabaseAdmin);
    
    const { error: challengeError } = await supabaseAdmin
      .from('auth_challenges')
      .upsert({
        user_id: user.id,
        challenge: options.challenge,
        expires_at: new Date(Date.now() + 60000).toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (challengeError) {
      console.error('❌ Error al guardar challenge:', challengeError);
      return res.status(500).json({ error: 'Error al guardar challenge' });
    }

    console.log('✅ Challenge guardado para usuario:', user.id);
    console.log('✅ Opciones generadas exitosamente');
    
    res.json(options);

  } catch (error) {
    console.error('❌ Error en register/options:', error);
    
    const status = error instanceof Error && error.message === 'Usuario no encontrado' ? 404 : 500;
    
    res.status(status).json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
});

/**
 * Verificar registro de passkey
 */
app.post('/api/passkey/register/verify', async (req, res) => {
  try {
    const { email, deviceName, ...credential } = req.body;
    
    if (!email || !credential) {
      return res.status(400).json({ error: 'Email y credential son requeridos' });
    }

    console.log('📨 POST /api/passkey/register/verify - email:', email);
    console.log('📦 Credential ID:', credential.id);
    console.log('📱 Device name:', deviceName || 'No especificado');

    const result = await verifyPasskeyRegistration(
      email, 
      credential, 
      deviceName, 
      supabaseAdmin
    );

    console.log('✅ Registro exitoso para:', email);
    res.json(result);

  } catch (error) {
    console.error('❌ Error en register/verify:', error);
    
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
});

// ==================== RUTA DE VERIFICACIÓN DE TOKEN ====================

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quicknote-super-secret-jwt-key-change-in-production');
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// ==================== MANEJO DE ERRORES 404 ====================
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    method: req.method,
    path: req.originalUrl
  });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`
  🚀 ==================================
  🚀 Servidor de Notas y Passkey corriendo
  🚀 ==================================
  📡 Puerto: ${PORT}
  🌐 URL: http://localhost:${PORT}
  🔒 CORS Origins: ${corsOrigins.join(', ')}
  🌍 Entorno: ${process.env.NODE_ENV || 'development'}
  🚀 ==================================
  `);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});