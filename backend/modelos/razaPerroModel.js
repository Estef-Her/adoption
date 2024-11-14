// razaPerroModel.js
const db = require('../db'); // Importa la conexión a la base de datos
const RazaPerro = require('../entidades/razaPerro'); // Importa la clase RazaPerro

// Obtener todas las razas de perro
const getAllRazaPerro = (callback) => {
  db.query('SELECT * FROM perro_razas', (err, results) => {
    if (err) {
      return callback(err, null);
    }
    // Mapeamos cada fila de la tabla a un objeto RazaPerro completo
    callback(null, results.map(row => new RazaPerro(row.perro_id, row.raza_id, row.probabilidad)));
  });
};

// Obtener una raza de perro por perro_id y raza_id
const getRazaPerroById = (perro_id, raza_id, callback) => {
  db.query('SELECT * FROM perro_razas WHERE perro_id = ? AND raza_id = ?', [perro_id, raza_id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    if (result.length === 0) {
      return callback(null, null); // RazaPerro no encontrada
    }
    const row = result[0];
    const razaPerro = new RazaPerro(row.perro_id, row.raza_id, row.probabilidad);
    callback(null, razaPerro);
  });
};

// Crear una nueva relación raza de perro
const createRazaPerro = (razaPerroData, callback) => {
  try {
    // Validar los datos antes de la inserción
    RazaPerro.validate(razaPerroData);

    // Inserta la nueva relación raza-perro en la base de datos
    db.query('INSERT INTO perro_razas SET ?', razaPerroData, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      // Crear una instancia del nuevo objeto RazaPerro con los datos insertados
      const newRazaPerro = new RazaPerro(razaPerroData.perro_id, razaPerroData.raza_id, razaPerroData.probabilidad);
      callback(null, newRazaPerro);
    });
  } catch (error) {
    return callback(error, null); // Devuelve un error si la validación falla
  }
};

// Exportar las funciones
module.exports = {
  getAllRazaPerro,
  getRazaPerroById,
  createRazaPerro
};
