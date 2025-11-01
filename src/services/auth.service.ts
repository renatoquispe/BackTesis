import { AppDataSource } from "../config/appdatasource";
import { Usuario } from "../entities/usuario";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import jwt, { SignOptions } from "jsonwebtoken";
import { VerificationService } from "../services/verificacion.service"; // 👈 AGREGAR


// Cliente de Google para verificar idTokens
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

/* ===============  LOGIN NORMAL (correo + contraseña)  =============== */
export const login = async (
  correo: string,
  contrasena: string
): Promise<Usuario | null> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const repo = AppDataSource.getRepository(Usuario);
  const usuario = await repo.findOne({
    where: { correo: correo.trim().toLowerCase(), estadoAuditoria: 1 },
    relations: ["negocio"],   // 👈 aquí ya traes los negocios
  });
  if (!usuario) return null;
  return usuario.contrasena === contrasena ? usuario : null;
};
/* ===============  REGISTRO NORMAL (nuevo método)  =============== */
// En la función crearUsuario - AGREGAR MÁS LOGS:
export const crearUsuario = async (
  nombre: string,
  correo: string,
  contrasena: string,
  apellidoPaterno: string = "",
  apellidoMaterno: string = "",
  fechaNacimiento: string = "2000-01-01",
  fotoPerfil: string | null = null
): Promise<Usuario> => {
  
  console.log(`🔍 [AUTH SERVICE] ========== CREAR USUARIO ==========`);
  console.log(`🔍 [AUTH SERVICE] Parámetros recibidos:`, { nombre, correo });

  if (!AppDataSource.isInitialized) {
    console.log(`🔍 [AUTH SERVICE] Inicializando AppDataSource...`);
    await AppDataSource.initialize();
  }
  
  const repo = AppDataSource.getRepository(Usuario);
  
  // Verificar si el usuario ya existe
  console.log(`🔍 [AUTH SERVICE] Verificando si usuario existe: ${correo}`);
  const usuarioExistente = await repo.findOne({ 
    where: { correo: correo.trim().toLowerCase() } 
  });
  
  if (usuarioExistente) {
    console.log(`❌ [AUTH SERVICE] Usuario ya existe: ${correo}`);
    throw new Error("Ya existe un usuario con este correo");
  }

  console.log(`🔍 [AUTH SERVICE] Creando nuevo usuario con estadoAuditoria: 0`);

  // Crear nuevo usuario con estado NO verificado
  const usuario = repo.create({
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    correo: correo.trim().toLowerCase(),
    contrasena,
    fechaNacimiento: new Date(fechaNacimiento),
    fotoPerfil,
    estadoAuditoria: 0
  } as Partial<Usuario>);

  console.log(`🔍 [AUTH SERVICE] Guardando usuario en BD...`);
  const usuarioGuardado = await repo.save(usuario);
  console.log(`✅ [AUTH SERVICE] Usuario guardado en BD con ID: ${usuarioGuardado.idUsuario}, estado: ${usuarioGuardado.estadoAuditoria}`);

  // 👇 CÓDIGO CORREGIDO - usa el código real
  try {
    console.log(`📧 [AUTH SERVICE] ========== INICIANDO ENVÍO DE EMAIL ==========`);
    console.log(`📧 [AUTH SERVICE] Destinatario: ${correo}`);
    
    console.log(`📧 [AUTH SERVICE] Creando VerificationService...`);
    const verificationService = new VerificationService();
    console.log(`✅ [AUTH SERVICE] VerificationService creado`);
    
    // 👇 USA EL CÓDIGO REAL, NO EL HARCODEADO
    console.log(`📧 [AUTH SERVICE] Generando código de verificación...`);
    const codigo = await verificationService.solicitarVerificacionEmail(correo);
    console.log(`📧 [AUTH SERVICE] Código generado: ${codigo}`);
    
    const mensaje = `
      <p>¡Bienvenido/a!</p>
      <p>Gracias por registrarte. Usa el siguiente código para verificar tu email:</p>
      <div class="code">${codigo}</div>
      <p>Este código expirará en <strong>15 minutos</strong>.</p>
      <p>Si no te registraste, por favor ignora este mensaje.</p>
    `;

    console.log(`📧 [AUTH SERVICE] Intentando enviar email...`);
    await verificationService.enviarEmail(
      correo,
      "Verifica tu Email - Tu Código de Verificación",
      mensaje
    );
    
    console.log(`✅ [AUTH SERVICE] Email enviado exitosamente`);
    
  } catch (error: any) {
    console.error("❌ [AUTH SERVICE] ERROR al enviar email:", error.message);
    console.error("❌ [AUTH SERVICE] Stack trace:", error.stack);
  }

  console.log(`✅ [AUTH SERVICE] ========== FIN CREAR USUARIO ==========`);
  return usuarioGuardado;
};
// export const crearUsuario = async (
//   nombre: string,
//   correo: string,
//   contrasena: string,
//   apellidoPaterno: string = "",
//   apellidoMaterno: string = "",
//   fechaNacimiento: string = "2000-01-01",
//   fotoPerfil: string | null = null
// ): Promise<Usuario> => {
//   if (!AppDataSource.isInitialized) {
//     await AppDataSource.initialize();
//   }
  
//   const repo = AppDataSource.getRepository(Usuario);
  
//   // Verificar si el usuario ya existe
//   const usuarioExistente = await repo.findOne({ 
//     where: { correo: correo.trim().toLowerCase() } 
//   });
  
//   if (usuarioExistente) {
//     throw new Error("Ya existe un usuario con este correo");
//   }

//   // Crear nuevo usuario con estado NO verificado
//   const usuario = repo.create({
//     nombre,
//     apellidoPaterno,
//     apellidoMaterno,
//     correo: correo.trim().toLowerCase(),
//     contrasena,
//     fechaNacimiento: new Date(fechaNacimiento),
//     fotoPerfil,
//     estadoAuditoria: 0
//   } as Partial<Usuario>);

//   const usuarioGuardado = await repo.save(usuario);
//   console.log(`✅ Usuario guardado en BD con ID: ${usuarioGuardado.idUsuario}, estado: ${usuarioGuardado.estadoAuditoria}`);

//   // 👇 ENVIAR CÓDIGO DE VERIFICACIÓN AUTOMÁTICAMENTE DESPUÉS DEL REGISTRO
//   try {
//     console.log(`📧 [1/4] Iniciando envío de código a: ${correo}`);
    
//     console.log(`📧 [2/4] Llamando a verificationService.solicitarVerificacionEmail...`);
//     const codigo = await verificationService.solicitarVerificacionEmail(correo);
//     console.log(`📧 [3/4] Código generado: ${codigo}`);
    
//     const mensaje = `
//       <p>¡Bienvenido/a!</p>
//       <p>Gracias por registrarte. Usa el siguiente código para verificar tu email:</p>
//       <div class="code">${codigo}</div>
//       <p>Este código expirará en <strong>15 minutos</strong>.</p>
//       <p>Si no te registraste, por favor ignora este mensaje.</p>
//     `;

//     console.log(`📧 [4/4] Llamando a verificationService.enviarEmail...`);
//     await verificationService.enviarEmail(
//       correo,
//       "Verifica tu Email - Tu Código de Verificación",
//       mensaje
//     );

//     console.log(`✅ Código de verificación enviado exitosamente a: ${correo}`);
//   } catch (error: any) {
//     console.error("❌ ERROR CRÍTICO al enviar código de verificación:", error);
//     console.error("❌ Stack trace:", error.stack);
//     // NO lanzamos error aquí para no afectar el registro
//   }

//   return usuarioGuardado;
// };
// export const crearUsuario = async (
//   nombre: string,
//   correo: string,
//   contrasena: string,
//   apellidoPaterno: string = "",
//   apellidoMaterno: string = "",
//   fechaNacimiento: string = "2000-01-01",
//   fotoPerfil: string | null = null
// ): Promise<Usuario> => {
//   if (!AppDataSource.isInitialized) {
//     await AppDataSource.initialize();
//   }
  
//   const repo = AppDataSource.getRepository(Usuario);
  
//   // Verificar si el usuario ya existe
//   const usuarioExistente = await repo.findOne({ 
//     where: { correo: correo.trim().toLowerCase() } 
//   });
  
//   if (usuarioExistente) {
//     throw new Error("Ya existe un usuario con este correo");
//   }

//   // Crear nuevo usuario con estado NO verificado
//   const usuario = repo.create({
//     nombre,
//     apellidoPaterno,
//     apellidoMaterno,
//     correo: correo.trim().toLowerCase(),
//     contrasena,
//     fechaNacimiento: new Date(fechaNacimiento),
//     fotoPerfil,
//     estadoAuditoria: 0 // 👈 IMPORTANTE: Creado como NO verificado
//   } as Partial<Usuario>);

//   const usuarioGuardado = await repo.save(usuario);

//   // 👇 ENVIAR CÓDIGO DE VERIFICACIÓN AUTOMÁTICAMENTE DESPUÉS DEL REGISTRO
//   try {
//     console.log(`📧 Enviando código de verificación a: ${correo}`);
//     const codigo = await verificationService.solicitarVerificacionEmail(correo);
    
//     const mensaje = `
//       <p>¡Bienvenido/a!</p>
//       <p>Gracias por registrarte. Usa el siguiente código para verificar tu email:</p>
//       <div class="code">${codigo}</div>
//       <p>Este código expirará en <strong>15 minutos</strong>.</p>
//       <p>Si no te registraste, por favor ignora este mensaje.</p>
//     `;

//     await verificationService.enviarEmail(
//       correo,
//       "Verifica tu Email - Tu Código de Verificación",
//       mensaje
//     );

//     console.log(`✅ Código de verificación enviado a: ${correo}`);
//   } catch (error) {
//     console.error("❌ Error al enviar código de verificación:", error);
//     // NO lanzamos error aquí para no afectar el registro
//     // El usuario puede solicitar otro código más tarde
//   }

//   return usuarioGuardado;
// };

/* =====================  GOOGLE SIGN-IN  ===================== */

/** Verifica el idToken contra Google y devuelve el payload */
export async function verifyGoogleIdToken(
  idToken: string
): Promise<TokenPayload> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new Error("Token de Google inválido");
  return payload;
}

type GoogleUserParams = {
  email: string;
  nombre: string;
  googleId: string;
  fotoPerfil?: string | null;
};

/**
 * Busca por correo; si no existe, crea un usuario placeholder
 */
export async function findOrCreateGoogleUser(
  p: GoogleUserParams
): Promise<Usuario> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const repo = AppDataSource.getRepository(Usuario);

  // 1) Buscar por correo
  let user = await repo.findOne({
    where: { correo: p.email.toLowerCase() },
    relations: ["negocio"],   // ✅ por consistencia
  });

  if (user) {
    // Actualizar fotoPerfil y estadoAuditoria si hace falta
    if (!user.fotoPerfil && p.fotoPerfil) user.fotoPerfil = p.fotoPerfil;
    if (!user.estadoAuditoria) user.estadoAuditoria = 1;
    await repo.save(user);
    return user;
  }

  // 2) Crear nuevo con contraseña placeholder
  const placeholderPwd = `GOOGLE_${Math.random().toString(36).slice(2, 10)}`;

  user = repo.create({
    nombre: p.nombre,
    correo: p.email.toLowerCase(),
    contrasena: placeholderPwd,
    fechaNacimiento: null as any,       // asume nullable
    fotoPerfil: p.fotoPerfil ?? null,
    estadoAuditoria: 1,
  } as Partial<Usuario>);

  return await repo.save(user);
}
/* ===============  VERIFICAR SI USUARIO ESTÁ VERIFICADO  =============== */
export const verificarUsuarioEstaVerificado = async (correo: string): Promise<boolean> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  
  const repo = AppDataSource.getRepository(Usuario);
  const usuario = await repo.findOne({
    where: { correo: correo.trim().toLowerCase() }
  });
  
  return usuario ? usuario.estadoAuditoria === 1 : false;
};

/* =====================  JWT HELPERS  ===================== */

function generateToken(payload: object): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está definido en .env");
  }
  const expiresIn: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRES as any) || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Construye el objeto que envía tu controlador a la app Android:
 * { token, usuario: { … } }
 */
export async function buildAuthResponse(usuario: Usuario) {
  const token = generateToken({
    id: usuario.idUsuario,
    email: usuario.correo,
  });
    const negocioId = usuario.negocio ? usuario.negocio.idNegocio : null;

  return {
    token,
    usuario: {
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellidoPaterno ?? null,
      apellido_materno: usuario.apellidoMaterno ?? null,
      correo: usuario.correo,
      foto_perfil: usuario.fotoPerfil ?? null,
      // negocio_id: negocioId,
      negocioId: usuario.negocio ? usuario.negocio.idNegocio : null,
      // negocio_id: usuario.negocio ? usuario.negocio.idNegocio : null, // 👈 cambio aquí
      rol: "USER", // ajusta según tus roles
    },
  };
  
}