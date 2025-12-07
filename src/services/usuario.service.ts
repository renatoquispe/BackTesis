import AppDataSource from "../config/appdatasource";
import { Usuario } from "../entities/usuario";
import bcrypt from "bcrypt";


const usuarioRepository = AppDataSource.getRepository(Usuario);

// Insertar
// export const insertarUsuario = async (usuario: Partial<Usuario>) => {
//   return await usuarioRepository.save(usuario);
// };
export const insertarUsuario = async (usuario: Partial<Usuario>) => {
  if (usuario.contrasena) {
    usuario.contrasena = await bcrypt.hash(usuario.contrasena, 10);
  }

  return await usuarioRepository.save(usuario);
};


// Listar todos
export const listarUsuarios = async () => {
  return await usuarioRepository.find();
};

// Listar activos
export const listarUsuariosActivos = async () => {
  return await usuarioRepository.find({ where: { estadoAuditoria: 1 } });
};

// Buscar por ID
export const obtenerUsuarioPorId = async (id: number) => {
  return await usuarioRepository.findOne({ where: { idUsuario: id } });
};

// Actualizar
// export const actualizarUsuario = async (id: number, data: Partial<Usuario>) => {
//   await usuarioRepository.update({ idUsuario: id }, data);
// };
export const actualizarUsuario = async (id: number, data: Partial<Usuario>) => {
  const usuario = await usuarioRepository.findOne({ where: { idUsuario: id } });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  // Si llega una nueva contraseña, se hashea y NO se sobrescribe después
  if (data.contrasena) {
    usuario.contrasena = await bcrypt.hash(data.contrasena, 10);
    delete data.contrasena; // <-- Esto evita que se reemplace con texto plano
  }

  // Asignar otros campos (excepto contraseña porque ya la quitamos)
  Object.assign(usuario, data);

  await usuarioRepository.save(usuario);

  return usuario;
};



// Eliminar lógico (soft delete)
export const eliminarUsuario = async (id: number) => {
  await usuarioRepository.update({ idUsuario: id }, { estadoAuditoria: 0 });
};

// Activar usuario
export const activarUsuario = async (id: number) => {
  await usuarioRepository.update({ idUsuario: id }, { estadoAuditoria: 1 });
};
