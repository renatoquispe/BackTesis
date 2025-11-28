import { AppDataSource } from "../config/appdatasource";
import { CodigoVerificacion } from "../entities/codigoVerificacion";
import { Usuario } from "../entities/usuario";
// import * as nodemailer from 'nodemailer'; 
import * as bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";


export class VerificationService {
    private transporter: any; // 
    constructor() {
    console.log("🔐 [VerificationService] Inicializando con SendGrid");

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    console.log("✅ [VerificationService] SendGrid configurado");
}

    // constructor() {
    //     console.log(`🔐 [VerificationService] Inicializando con Gmail SMTP`);
        
    //     // 👇 CAMBIO 3 - Configuración Gmail
    //     this.transporter = nodemailer.createTransport({
    //         service: 'gmail',
    //         auth: {
    //             user: process.env.GMAIL_USER,
    //             pass: process.env.GMAIL_APP_PASSWORD
    //         }
    //     });
        
    //     console.log(`✅ [VerificationService] Gmail SMTP configurado`);
    // }

    // Generar código de 6 dígitos
    private generarCodigo(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // 👇 CAMBIO 4 - SOLO ESTE MÉTODO CAMBIA COMPLETAMENTE
    async enviarEmail(correo: string, asunto: string, mensaje: string): Promise<void> {
    try {
        console.log(`📧 [enviarEmail] Enviando a: ${correo}`);

        const msg = {
            to: correo,
            from: process.env.SENDGRID_FROM_EMAIL, 
            subject: asunto,
            html: this.crearTemplateEmail(asunto, mensaje),
        };

        await sgMail.send(msg);

        console.log("✅ [enviarEmail] Email enviado con SendGrid");
    } catch (error: any) {
        console.error("❌ [enviarEmail] Error:", error);
        throw new Error(`Error al enviar correo: ${error.message}`);
    }
}

    // async enviarEmail(correo: string, asunto: string, mensaje: string): Promise<void> {
    //     try {
    //         console.log(`📧 [enviarEmail] Enviando a: ${correo}`);
            
    //         const info = await this.transporter.sendMail({
    //             from: '"Tu App" <susanarbaizodelacruz@gmail.com>', // 👈 Cambia por tu Gmail real
    //             to: correo,
    //             subject: asunto,
    //             html: this.crearTemplateEmail(asunto, mensaje),
    //         });

    //         console.log('✅ [enviarEmail] Email enviado con Gmail:', info.messageId);
    //     } catch (error: any) {
    //         console.error('❌ [enviarEmail] Error:', error);
    //         throw new Error(`Error al enviar el código de verificación: ${error.message}`);
    //     }
    // }

    // 👇 TODO ESTO QUEDA EXACTAMENTE IGUAL
    private crearTemplateEmail(asunto: string, mensaje: string): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
                .code { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; margin: 20px 0; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>${asunto}</h2>
                ${mensaje}
                <div class="footer">
                    <p>Saludos,<br>El equipo de Tu App</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // 👇 TODOS TUS MÉTODOS EXISTENTES QUEDAN EXACTAMENTE IGUAL
    async solicitarVerificacionEmail(correo: string): Promise<string> {
        console.log(`🔐 [solicitarVerificacionEmail] Iniciando para: ${correo}`);
        return await this.crearCodigo(correo, 'VERIFICACION_EMAIL');
    }

    async crearCodigo(correo: string, tipo: 'RECUPERACION_CONTRASENA' | 'VERIFICACION_EMAIL'): Promise<string> {
        console.log(`🔐 [crearCodigo] Iniciando para: ${correo}, tipo: ${tipo}`);
        
        if (!AppDataSource.isInitialized) {
            console.log(`🔐 [crearCodigo] Inicializando AppDataSource...`);
            await AppDataSource.initialize();
        }

        const repo = AppDataSource.getRepository(CodigoVerificacion);
        
        // Limpiar códigos expirados
        console.log(`🔐 [crearCodigo] Limpiando códigos expirados...`);
        await repo.createQueryBuilder()
            .delete()
            .where("fecha_expiracion < NOW() OR usado = 1")
            .execute();

        // Verificar si el usuario existe (solo para recuperación de contraseña)
        if (tipo === 'RECUPERACION_CONTRASENA') {
            const userRepo = AppDataSource.getRepository(Usuario);
            const usuario = await userRepo.findOne({ where: { correo } });
            
            if (!usuario) {
                throw new Error("No existe una cuenta con este correo");
            }
        }

        // Generar nuevo código
        const codigo = this.generarCodigo();
        const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        console.log(`🔐 [crearCodigo] Creando código en BD: ${codigo}, expira: ${fechaExpiracion}`);

        const codigoVerificacion = repo.create({
            correo,
            codigo,
            tipo,
            fechaExpiracion: fechaExpiracion
        });

        const codigoGuardado = await repo.save(codigoVerificacion);
        console.log(`🔐 [crearCodigo] Código guardado en BD con ID: ${codigoGuardado.idCodigo}`);
        
        return codigo;
    }

    async verificarCodigo(correo: string, codigo: string, tipo: string): Promise<boolean> {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const repo = AppDataSource.getRepository(CodigoVerificacion);
        
        const codigoVerificacion = await repo.findOne({
            where: {
                correo,
                codigo,
                tipo,
                usado: 0
            }
        });

        if (!codigoVerificacion) {
            return false;
        }

        // Verificar expiración
        if (new Date() > codigoVerificacion.fechaExpiracion) {
            return false;
        }

        return true;
    }

    async verificarCodigoEmail(correo: string, codigo: string): Promise<boolean> {
        const esValido = await this.verificarCodigo(correo, codigo, 'VERIFICACION_EMAIL');
        
        if (esValido) {
            // Marcar el email como verificado en la base de datos
            await this.marcarEmailComoVerificado(correo);
            
            // Marcar el código como usado
            await this.marcarCodigoComoUsado(correo, codigo, 'VERIFICACION_EMAIL');
            return true;
        }
        return false;
    }

    // async usarCodigoYActualizarContrasena(correo: string, codigo: string, nuevaContrasena: string): Promise<boolean> {
    //     if (!AppDataSource.isInitialized) {
    //         await AppDataSource.initialize();
    //     }

    //     const codigoRepo = AppDataSource.getRepository(CodigoVerificacion);
    //     const usuarioRepo = AppDataSource.getRepository(Usuario);

    //     // Verificar código primero
    //     const esValido = await this.verificarCodigo(correo, codigo, 'RECUPERACION_CONTRASENA');
    //     if (!esValido) {
    //         return false;
    //     }

    //     // Actualizar contraseña del usuario
    //     await usuarioRepo.createQueryBuilder()
    //         .update(Usuario)
    //         .set({ contrasena: nuevaContrasena })
    //         .where("correo = :correo", { correo })
    //         .execute();

    //     // Marcar código como usado
    //     await codigoRepo.createQueryBuilder()
    //         .update(CodigoVerificacion)
    //         .set({ usado: 1 })
    //         .where("correo = :correo AND codigo = :codigo", { correo, codigo })
    //         .execute();

    //     return true;
    // }
    async usarCodigoYActualizarContrasena(correo: string, codigo: string, nuevaContrasena: string): Promise<boolean> {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    const codigoRepo = AppDataSource.getRepository(CodigoVerificacion);
    const usuarioRepo = AppDataSource.getRepository(Usuario);

    // 1. Verificar código
    const esValido = await this.verificarCodigo(correo, codigo, 'RECUPERACION_CONTRASENA');
    if (!esValido) {
        return false;
    }

    // 2. Buscar usuario
    const usuario = await usuarioRepo.findOne({ where: { correo } });
    if (!usuario) {
        throw new Error("Usuario no encontrado");
    }

    // 3. Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

    // 4. Guardar la contraseña hasheada
    usuario.contrasena = hashedPassword;
    await usuarioRepo.save(usuario);

    // 5. Marcar el código como usado
    await codigoRepo.update(
        { correo, codigo, tipo: 'RECUPERACION_CONTRASENA' },
        { usado: 1 }
    );

    return true;
}


    async marcarEmailComoVerificado(correo: string): Promise<void> {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepo = AppDataSource.getRepository(Usuario);
        await userRepo.createQueryBuilder()
            .update(Usuario)
            .set({ estadoAuditoria: 1 })
            .where("correo = :correo AND estadoAuditoria = 0", { correo })
            .execute();
    }

    private async marcarCodigoComoUsado(correo: string, codigo: string, tipo: string): Promise<void> {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const repo = AppDataSource.getRepository(CodigoVerificacion);
        await repo.createQueryBuilder()
            .update(CodigoVerificacion)
            .set({ usado: 1 })
            .where("correo = :correo AND codigo = :codigo AND tipo = :tipo", 
                { correo, codigo, tipo })
            .execute();
    }
}