// razaModel.js
const db = require('../db'); // Importa la conexión a la base de datos
const Raza = require('../entidades/raza'); // Importa la clase Raza

// Obtener todas las razas
const getAllRazas = (callback) => {
  if (typeof callback !== 'function') {
    throw new Error('El callback proporcionado no es una función');
  }
  db.query('SELECT * FROM raza', (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results.map(row => new Raza(row.id, row.nombre)));
  });
};
// Obtener una raza por ID
const getRazaById = (id, callback) => {
  db.query('SELECT * FROM raza WHERE id = ?', [id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    if (result.length === 0) {
      return callback(null, null); // Raza no encontrada
    }
    const row = result[0];
    const raza = new Raza(row.id, row.nombre);
    callback(null, raza);
  });
};

// Crear una nueva raza
const createRaza = (razaData, callback) => {
  try {
    Raza.validate(razaData); // Validar el objeto contra la clase
    db.query('INSERT INTO raza SET ?', razaData, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      const newRaza = new Raza(result.insertId, razaData.nombre);
      callback(null, newRaza);
    });
  } catch (error) {
    return callback(error, null); // Devuelve un error si la validación falla
  }
};

// Exportar las funciones
module.exports = {
  getAllRazas,
  getRazaById,
  createRaza
};
