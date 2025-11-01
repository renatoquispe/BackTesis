import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { BaseResponse } from "../shared/base-response";
import { generarToken } from "../shared/jwt.utils";
import {
  verifyGoogleIdToken,
  findOrCreateGoogleUser,
  buildAuthResponse,
} from "../services/auth.service";

// export const login = async (req: Request, res: Response): Promise<void> => {
//   const { correo, contrasena } = req.body;

//   if (!correo || !contrasena) {
//     res.status(400).json(BaseResponse.error("Correo y contraseña requeridos"));
//     return;
//   }

//   try {
//     const usuario = await authService.login(correo, contrasena);

//     if (!usuario) {
//       res.status(404).json(BaseResponse.error("Usuario o contraseña incorrectos"));
//       return;
//     }
//     const data = await authService.buildAuthResponse(usuario);

//     // Generar el token
//     // const token = generarToken(usuario);
//     res.status(200).json(BaseResponse.success(
//       // {
//       //   token,
//       //   usuario: {
//       //     idUsuario: usuario.idUsuario,
//       //     correo: usuario.correo,
//       //   }
//       // },
//       data,
//       "Inicio de sesión exitoso"
//     ));
//   } catch (error: any) {
//     console.error("Error en login:", error);
//     res.status(500).json(BaseResponse.error("Error en el servidor"));
//   }
// };

export const login = async (req: Request, res: Response): Promise<void> => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    res.status(400).json(BaseResponse.error("Correo y contraseña requeridos"));
    return;
  }

  try {
    const usuario = await authService.login(correo, contrasena);

    if (!usuario) {
      // Verificar si el usuario existe pero no está verificado
      const existeUsuario = await authService.verificarUsuarioEstaVerificado(correo);
      if (!existeUsuario) {
        res.status(403).json(BaseResponse.error("Tu email no ha sido verificado. Revisa tu correo."));
        return;
      }
      res.status(404).json(BaseResponse.error("Usuario o contraseña incorrectos"));
      return;
    }
    
    const data = await authService.buildAuthResponse(usuario);
    res.status(200).json(BaseResponse.success(data, "Inicio de sesión exitoso"));
  } catch (error: any) {
    console.error("Error en login:", error);
    res.status(500).json(BaseResponse.error("Error en el servidor"));
  }
};

// 👇 NUEVO: Endpoint para registro
export const register = async (req: Request, res: Response): Promise<void> => {
  const { nombre, correo, contrasena, apellidoPaterno, apellidoMaterno, fechaNacimiento, fotoPerfil } = req.body;

  console.log(`🔍 [REGISTER CONTROLLER] ========== INICIANDO REGISTRO ==========`);
  console.log(`🔍 [REGISTER CONTROLLER] Recibiendo registro para: ${correo}`);
  console.log(`🔍 [REGISTER CONTROLLER] Datos recibidos:`, { 
    nombre, 
    correo, 
    tieneContrasena: !!contrasena,
    apellidoPaterno, 
    apellidoMaterno 
  });

  if (!nombre || !correo || !contrasena) {
    console.log(`❌ [REGISTER CONTROLLER] Faltan campos requeridos`);
    res.status(400).json(BaseResponse.error("Nombre, correo y contraseña requeridos"));
    return;
  }

  try {
    console.log(`🔍 [REGISTER CONTROLLER] Llamando a authService.crearUsuario...`);
    const usuario = await authService.crearUsuario(
      nombre,
      correo,
      contrasena,
      apellidoPaterno,
      apellidoMaterno,
      fechaNacimiento,
      fotoPerfil
    );

    console.log(`✅ [REGISTER CONTROLLER] Usuario creado exitosamente: ${usuario.idUsuario}, estado: ${usuario.estadoAuditoria}`);

    res.status(201).json(BaseResponse.success(
      { idUsuario: usuario.idUsuario, correo: usuario.correo },
      "Usuario registrado correctamente. Por favor verifica tu email."
    ));
  } catch (error: any) {
    console.error("❌ [REGISTER CONTROLLER] Error en registro:", error);
    res.status(400).json(BaseResponse.error(error.message || "Error al registrar usuario"));
  }
};
// export const register = async (req: Request, res: Response): Promise<void> => {
//   const { nombre, correo, contrasena, apellidoPaterno, apellidoMaterno, fechaNacimiento, fotoPerfil } = req.body;

//   if (!nombre || !correo || !contrasena) {
//     res.status(400).json(BaseResponse.error("Nombre, correo y contraseña requeridos"));
//     return;
//   }

//   try {
//     const usuario = await authService.crearUsuario(
//       nombre,
//       correo,
//       contrasena,
//       apellidoPaterno,
//       apellidoMaterno,
//       fechaNacimiento,
//       fotoPerfil
//     );

//     res.status(201).json(BaseResponse.success(
//       { idUsuario: usuario.idUsuario, correo: usuario.correo },
//       "Usuario registrado correctamente. Por favor verifica tu email."
//     ));
//   } catch (error: any) {
//     console.error("Error en registro:", error);
//     res.status(400).json(BaseResponse.error(error.message || "Error al registrar usuario"));
//   }
// };

export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: "Falta idToken" });

    const payload = await verifyGoogleIdToken(idToken);
    const email = payload.email;
    const nombre = payload.name || payload.given_name || "Usuario";
    const picture = payload.picture || null;
    const sub = payload.sub!;

    if (!email) return res.status(400).json({ success: false, message: "No se obtuvo email válido" });

    const usuario = await findOrCreateGoogleUser({
      email,
      nombre,
      googleId: sub,
      fotoPerfil: picture,
    });

    const data = await buildAuthResponse(usuario);
    return res.json({ success: true, message: "Login con Google exitoso", data });
  } catch (err: any) {
    console.error("googleSignIn error:", err);
    return res.status(401).json({ success: false, message: err.message || "Token de Google inválido" });
  }
};