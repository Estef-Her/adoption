// usuarioModel.js
const db = require('../db'); // Importa la conexión a la base de datos
const Usuario = require('../entidades/usuario'); // Importa la clase Usuario
const bcrypt = require('bcryptjs'); // Si estás usando contraseñas encriptadas
const saltRounds = 12;
// Obtener todos los usuarios
const getAllUsuarios = (callback) => {
  db.query('SELECT * FROM usuario', (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results.map(row => new Usuario(row.id, row.nombre, row.telefono, row.correo, row.contrasena)));
  });
};

// Obtener un usuario por ID
const getUsuarioById = (id, callback) => {
  db.query('SELECT * FROM usuario WHERE id = ?', [id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    if (result.length === 0) {
      return callback(null, null); // Usuario no encontrado
    }
    const row = result[0];
    const usuario = new Usuario(row.id, row.nombre, row.telefono, row.correo, row.contrasena);
    callback(null, usuario);
  });
};

// Crear un nuevo usuario
// Define el número de rondas de sal para bcrypt (cuanto mayor sea, más seguro, pero más lento)

const createUsuario = (usuarioData, callback) => {
  try {
    // Validar el objeto Usuario
    Usuario.validate(usuarioData);

    // Encriptar la contraseña antes de guardarla
    bcrypt.hash(usuarioData.contrasena, saltRounds, (err, hash) => {
      if (err) {
        return callback(err, null); // Error al encriptar
      }

      // Reemplazar la contraseña original con el hash generado
      usuarioData.contrasena = hash;

      // Insertar el usuario en la base de datos
      db.query('INSERT INTO usuario SET ?', usuarioData, (err, result) => {
        if (err) {
          return callback(err, null); // Error al insertar en la base de datos
        }

        // Crear una nueva instancia de Usuario con el ID insertado
        const newUsuario = new Usuario(result.insertId, usuarioData.nombre, usuarioData.telefono, usuarioData.correo, usuarioData.contrasena);
        callback(null, newUsuario);
      });
    });
  } catch (error) {
    return callback(error, null); // Error de validación
  }
};
function getUsuarioByEmail(email, callback) {
  try {
    const query = "SELECT * FROM usuario WHERE correo = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        return callback(err);
      }
      if (results.length === 0) {
        return callback(new Error("Correo no encontrado"), null); // Error si no se encuentra el usuario
      }
      callback(null, results[0]); // Retorna el primer usuario encontrado
    });
  } catch (error) {
    return callback(error, null); // Error inesperado
  }
}

const saveRecoveryCode = (userId, recoveryCode, callback) => {
  try {
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos de expiración
    const query = 'UPDATE usuario SET recoveryCode = ?, recoveryCodeExpiration = ? WHERE id = ?';
    db.query(query, [recoveryCode, expiration, userId], (err, result) => {
      if (err) {
        return callback(err,null);
      }
      const newUsuario = new Usuario(result.insertId, result.nombre, result.telefono, result.correo, result.contrasena);
      callback(null, newUsuario);
    });
  } catch (error) {
    return callback(error, null); // Error inesperado
  }
};

const verifyRecoveryCode = (userId, recoveryCode, callback) => {
  try{
    const query = 'SELECT * FROM usuario WHERE id = ?';
    db.query(query, [userId], (err, results) => {
      if (err || results.length === 0) return callback(err, false);
      const user = results[0];
      
      // Verificar si el código es correcto y no ha expirado
      if (user.recoveryCode !== recoveryCode || new Date() > new Date(user.recoveryCodeExpiration)) {
        return callback(null, false);
      }
  
      return callback(null, true);
    });
  }
  catch(error){
    return callback(error, false); // Error inesperado
  }
};
function actualizarContrasena(id,contrasena,callback){
  try {

    // Encriptar la contraseña antes de guardarla
    bcrypt.hash(contrasena, saltRounds, (err, hash) => {
      if (err) {
        return callback(err, null); // Error al encriptar
      }

      // Reemplazar la contraseña original con el hash generado
      var newContrasena = hash;

      // Insertar el usuario en la base de datos
      const query = 'UPDATE usuario SET contrasena = ? where id = ?';
      db.query(query, [newContrasena,id], (err, result) => {
        if (err) {
          return callback(err, null); // Error al actualizar
        }

        // Crear una nueva instancia de Usuario con el ID insertado
        const newUsuario = new Usuario(result.insertId, result.nombre, result.telefono, result.correo, result.contrasena);
        callback(null, newUsuario);
      });
    });
  } catch (error) {
    return callback(error, null); // Error de validación
  }
}
// Exportar las funciones
module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  getUsuarioByEmail,
  saveRecoveryCode,
  verifyRecoveryCode,
  actualizarContrasena
};
