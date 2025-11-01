import { Request, Response } from "express";
import { BaseResponse } from "../shared/base-response";
import { VerificationService } from "../services/verificacion.service";

const verificationService = new VerificationService();

// export const solicitarVerificacionEmail = async (req: Request, res: Response): Promise<void> => {
//     const { correo } = req.body;

//     if (!correo) {
//         res.status(400).json(BaseResponse.error("Correo requerido"));
//         return;
//     }

//     try {
//         const codigo = await verificationService.solicitarVerificacionEmail(correo);
        
//         const mensaje = `
//             <p>¡Bienvenido/a!</p>
//             <p>Gracias por registrarte. Usa el siguiente código para verificar tu email:</p>
//             <div class="code">${codigo}</div>
//             <p>Este código expirará en <strong>15 minutos</strong>.</p>
//             <p>Si no te registraste, por favor ignora este mensaje.</p>
//         `;

//         await verificationService.enviarEmail(
//             correo,
//             "Verifica tu Email - Tu Código de Verificación",
//             mensaje
//         );

//         res.status(200).json(BaseResponse.success(
//             null,
//             "Código de verificación enviado a tu correo"
//         ));
//     } catch (error: any) {
//         console.error("Error en solicitar verificación email:", error);
//         res.status(400).json(BaseResponse.error(error.message || "Error al enviar código de verificación"));
//     }
// };
// En controllers/recuperacion.controller.ts - VERIFICAR QUE ESTÉN BIEN:

export const solicitarVerificacionEmail = async (req: Request, res: Response): Promise<void> => {
    const { correo } = req.body;

    if (!correo) {
        res.status(400).json(BaseResponse.error("Correo requerido"));
        return;
    }

    try {
        const codigo = await verificationService.solicitarVerificacionEmail(correo);
        
        const mensaje = `
            <p>¡Bienvenido/a!</p>
            <p>Gracias por registrarte. Usa el siguiente código para verificar tu email:</p>
            <div class="code">${codigo}</div>
            <p>Este código expirará en <strong>15 minutos</strong>.</p>
            <p>Si no te registraste, por favor ignora este mensaje.</p>
        `;

        await verificationService.enviarEmail(
            correo,
            "Verifica tu Email - Tu Código de Verificación",
            mensaje
        );

        res.status(200).json(BaseResponse.success(
            null,
            "Código de verificación enviado a tu correo"
        ));
    } catch (error: any) {
        console.error("Error en solicitar verificación email:", error);
        res.status(400).json(BaseResponse.error(error.message || "Error al enviar código de verificación"));
    }
};

export const verificarCodigoEmail = async (req: Request, res: Response): Promise<void> => {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
        res.status(400).json(BaseResponse.error("Correo y código requeridos"));
        return;
    }

    try {
        const esValido = await verificationService.verificarCodigoEmail(correo, codigo);
        
        if (esValido) {
            res.status(200).json(BaseResponse.success(
                null,
                "Email verificado correctamente"
            ));
        } else {
            res.status(400).json(BaseResponse.error("Código inválido o expirado"));
        }
    } catch (error: any) {
        console.error("Error en verificar código email:", error);
        res.status(500).json(BaseResponse.error("Error al verificar código"));
    }
};
// export const verificarCodigoEmail = async (req: Request, res: Response): Promise<void> => {
//     const { correo, codigo } = req.body;

//     if (!correo || !codigo) {
//         res.status(400).json(BaseResponse.error("Correo y código requeridos"));
//         return;
//     }

//     try {
//         const esValido = await verificationService.verificarCodigoEmail(correo, codigo);
        
//         if (esValido) {
//             res.status(200).json(BaseResponse.success(
//                 null,
//                 "Email verificado correctamente"
//             ));
//         } else {
//             res.status(400).json(BaseResponse.error("Código inválido o expirado"));
//         }
//     } catch (error: any) {
//         console.error("Error en verificar código email:", error);
//         res.status(500).json(BaseResponse.error("Error al verificar código"));
//     }
// };
// Solicitar código de recuperación
export const solicitarRecuperacionContrasena = async (req: Request, res: Response): Promise<void> => {
    const { correo } = req.body;

    if (!correo) {
        res.status(400).json(BaseResponse.error("Correo requerido"));
        return;
    }

    try {
        const codigo = await verificationService.crearCodigo(correo, 'RECUPERACION_CONTRASENA');
        
        // 👇 Usar template mejorado
        const mensaje = `
            <p>Hola,</p>
            <p>Has solicitado recuperar tu contraseña. Usa el siguiente código para continuar:</p>
            <div class="code">${codigo}</div>
            <p>Este código expirará en <strong>15 minutos</strong>.</p>
            <p>Si no solicitaste este código, por favor ignora este mensaje.</p>
        `;

        await verificationService.enviarEmail(
            correo,
            "Recuperación de Contraseña - Tu Código de Verificación",
            mensaje
        );

        res.status(200).json(BaseResponse.success(
            null,
            "Código de recuperación enviado a tu correo"
        ));
    } catch (error: any) {
        console.error("Error en solicitar recuperación:", error);
        res.status(400).json(BaseResponse.error(error.message || "Error al enviar código de recuperación"));
    }
};

// Verificar código
export const verificarCodigoRecuperacion = async (req: Request, res: Response): Promise<void> => {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
        res.status(400).json(BaseResponse.error("Correo y código requeridos"));
        return;
    }

    try {
        const esValido = await verificationService.verificarCodigo(correo, codigo, 'RECUPERACION_CONTRASENA');
        
        if (esValido) {
            res.status(200).json(BaseResponse.success(
                null,
                "Código verificado correctamente"
            ));
        } else {
            res.status(400).json(BaseResponse.error("Código inválido o expirado"));
        }
    } catch (error: any) {
        console.error("Error en verificar código:", error);
        res.status(500).json(BaseResponse.error("Error al verificar código"));
    }
};

// Restablecer contraseña
export const restablecerContrasena = async (req: Request, res: Response): Promise<void> => {
    const { correo, codigo, nuevaContrasena } = req.body;

    if (!correo || !codigo || !nuevaContrasena) {
        res.status(400).json(BaseResponse.error("Correo, código y nueva contraseña requeridos"));
        return;
    }

    if (nuevaContrasena.length < 6) {
        res.status(400).json(BaseResponse.error("La contraseña debe tener al menos 6 caracteres"));
        return;
    }

    try {
        const exito = await verificationService.usarCodigoYActualizarContrasena(correo, codigo, nuevaContrasena);
        
        if (exito) {
            res.status(200).json(BaseResponse.success(
                null,
                "Contraseña actualizada correctamente"
            ));
        } else {
            res.status(400).json(BaseResponse.error("Código inválido o expirado"));
        }
    } catch (error: any) {
        console.error("Error en restablecer contraseña:", error);
        res.status(500).json(BaseResponse.error("Error al restablecer contraseña"));
    }

    
};