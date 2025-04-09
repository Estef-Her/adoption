// PerroModel.js
const db = require('../db'); // Importa la conexión a la base de datos
const Perro = require('../entidades/perro'); // Importa la clase Perro
const razaPerroModel = require('./razaPerroModel'); // Importa el modelo de razaPerro

// Obtener todas las Perros
const getAllPerros = (callback) => {
  if (typeof callback !== 'function') {
    throw new Error('El callback proporcionado no es una función');
  }

  // Consulta SQL con JOIN para incluir las razas y probabilidades
  const sql = `
    SELECT 
      p.id, p.ubicacion, p.tamano, p.contacto, p.edad, p.descripcion, 
      p.nombre, p.foto, p.estadoAdopcion, p.userId, 
      r.nombre AS razaNombre, pr.probabilidad, u.nombre as nombreUsuario 
    FROM perro p
    LEFT JOIN perro_razas pr ON p.id = pr.perro_id
    LEFT JOIN raza r ON pr.raza_id = r.id
    LEFT JOIN usuario u ON p.userId = u.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return callback(err, null);
    }

    // Mapear los resultados para agrupar las razas por perro
    const perrosMap = new Map();

    results.forEach(row => {
      const perroId = row.id;

      // Si el perro aún no existe en el mapa, lo creamos
      if (!perrosMap.has(perroId)) {
        perrosMap.set(perroId, {
          id: perroId,
          ubicacion: row.ubicacion,
          tamano: row.tamano,
          contacto: row.contacto,
          edad: row.edad,
          descripcion: row.descripcion,
          nombre: row.nombre,
          foto: row.foto,
          estadoAdopcion: row.estadoAdopcion,
          userId: row.userId,
          razas: [],
          nombreUsuario:row.nombreUsuario
        });
      }
      // Si hay una raza asociada, la añadimos al array de razas
      if (row.razaNombre) {
        perrosMap.get(perroId).razas.push({
          nombre: row.razaNombre,
          probabilidad: row.probabilidad
        });
      }
    });

    // Convertir el mapa a un array de perros
    const perros = Array.from(perrosMap.values());

    // Llamar al callback con el resultado final
    callback(null, perros);
  });
};


// Obtener una Perro por ID
const getPerroById = (id, callback) => {
  if (typeof callback !== 'function') {
    throw new Error('El callback proporcionado no es una función');
  }
  const sql = `
  SELECT 
    p.id, p.ubicacion, p.tamano, p.contacto, p.edad, p.descripcion, 
    p.nombre, p.foto, p.estadoAdopcion, p.userId, 
    r.nombre AS razaNombre, pr.probabilidad, u.nombre as nombreUsuario 
  FROM perro p
  LEFT JOIN perro_razas pr ON p.id = pr.perro_id
  LEFT JOIN raza r ON pr.raza_id = r.id
  LEFT JOIN usuario u ON p.userId = u.id WHERE p.id = ?
`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    if (result.length === 0) {
      return callback(null, null); // Perro no encontrada
    }
    
    const row1 = result[0];
    var perro = new Perro(
      row1.id, 
      row1.ubicacion, 
      row1.tamano, 
      row1.contacto, 
      row1.edad, 
      row1.descripcion, 
      row1.nombre, 
      row1.foto, 
      row1.estadoAdopcion,
      row1.userId,
      [],
      row1.nombreUsuario
    );

    
    result.forEach(row => {
      // Si hay una raza asociada, la añadimos al array de razas
      if (row.razaNombre) {
        perro.razas.push({
          nombre: row.razaNombre,
          probabilidad: row.probabilidad
        });
      }
    });
    callback(null, perro);
  });
};
const getPerrosByUsuario = (idUsuario, callback) => {
  if (typeof callback !== 'function') {
    throw new Error('El callback proporcionado no es una función');
  }
  const sql = `
  SELECT 
    p.id, p.ubicacion, p.tamano, p.contacto, p.edad, p.descripcion, 
    p.nombre, p.foto, p.estadoAdopcion, p.userId, 
    r.nombre AS razaNombre, pr.probabilidad, u.nombre as nombreUsuario 
  FROM perro p
  LEFT JOIN perro_razas pr ON p.id = pr.perro_id
  LEFT JOIN raza r ON pr.raza_id = r.id
  LEFT JOIN usuario u ON p.userId = u.id WHERE p.userId = ?
`;
  db.query(sql, [idUsuario], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    const perrosMap = new Map();

    results.forEach(row => {
      const perroId = row.id;

      // Si el perro aún no existe en el mapa, lo creamos
      if (!perrosMap.has(perroId)) {
        perrosMap.set(perroId, {
          id: perroId,
          ubicacion: row.ubicacion,
          tamano: row.tamano,
          contacto: row.contacto,
          edad: row.edad,
          descripcion: row.descripcion,
          nombre: row.nombre,
          foto: row.foto,
          estadoAdopcion: row.estadoAdopcion,
          userId: row.userId,
          razas: [],
          nombreUsuario:row.nombreUsuario
        });
      }

      // Si hay una raza asociada, la añadimos al array de razas
      if (row.razaNombre) {
        perrosMap.get(perroId).razas.push({
          nombre: row.razaNombre,
          probabilidad: row.probabilidad
        });
      }
    });

    // Convertir el mapa a un array de perros
    const perros = Array.from(perrosMap.values());

    // Llamar al callback con el resultado final
    callback(null, perros);
  });
};

// Crear una nueva Perro
const createPerro = (PerroData, razaArray, callback) => {
  if (typeof callback !== 'function') {
    throw new Error('El callback proporcionado no es una función');
  }
  try {
    Perro.validate(PerroData); // Validar el objeto contra la clase
    db.query('INSERT INTO perro SET ?', PerroData, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      var newPerro = new Perro(
        result.insertId, 
        PerroData.ubicacion, 
        PerroData.tamano, 
        PerroData.contacto, 
        PerroData.edad, 
        PerroData.descripcion, 
        PerroData.nombre, 
        PerroData.foto, 
        PerroData.estadoAdopcion,
        PerroData.userId,
        []
      );
      if (razaArray && razaArray.length > 0) {
        // Procesar cada raza y asociarla al perro
        razaArray.forEach((raza) => {
          const { id, probabilidad } = raza;
          if (id) {
            // Insertar la relación en la tabla `perro_razas` usando la función createRazaPerro
            const razaPerroData = {
              perro_id: newPerro.id,
              raza_id: id,
              probabilidad: parseFloat(probabilidad),
            };

            razaPerroModel.createRazaPerro(razaPerroData, (err, newRazaPerro) => {
              if (err) {
                console.error('Error al asociar la raza con el perro:', err);
              }
            });
          }
        });
      }
      callback(null, newPerro);
    });
  } catch (error) {
    return callback(error, null); // Devuelve un error si la validación falla
  }
};

const eliminarPerro = (id, callback) => {
  // Eliminar las razas asociadas
  db.query('DELETE FROM perro_razas WHERE perro_id = ?', [id], (err) => {
    if (err) {
      return callback(err, null);
    }

    // Ahora eliminar el perro
    db.query('DELETE FROM perro WHERE id = ?', [id], (err) => {
      if (err) {
        return callback(err, null);
      }
      callback(null); // El perro fue eliminado con éxito
    });
  });
};

const modificarPerro = (datos,razaArray, callback) => {
  if (typeof callback !== 'function') {
    throw new Error('El callback proporcionado no es una función');
  }
  try{
    const eliminarRazasQuery = 'DELETE FROM perro_razas WHERE perro_id = ?';
  
  db.query(eliminarRazasQuery, [datos.id], (error) => {
      if (error) {
          return callback(error);
      }
      console.log("Eliminó las razas asignadas");

      // Actualiza la información del perro
      const actualizarPerroQuery = 'UPDATE perro SET ubicacion = ?, tamano = ?, contacto = ?, edad = ?, nombre = ?, descripcion = ?, foto = ? WHERE id = ?';
      
      db.query(actualizarPerroQuery, [datos.ubicacion,datos.tamano,datos.contacto,datos.edad,datos.nombre,datos.descripcion,datos.foto,datos.id], (error, resultado) => {
          if (error) {
              return callback(error);
          }
          var newPerro = new Perro(
            resultado.insertId, 
            resultado.ubicacion, 
            resultado.tamano, 
            resultado.contacto, 
            resultado.edad, 
            resultado.descripcion, 
            resultado.nombre, 
            resultado.foto, 
            resultado.estadoAdopcion,
            resultado.userId,
            []
          );
          if (razaArray && razaArray.length > 0) {
            // Procesar cada raza y asociarla al perro
            razaArray.forEach((raza) => {
              const { id, probabilidad } = raza;
              if (id) {
                // Insertar la relación en la tabla `perro_razas` usando la función createRazaPerro
                const razaPerroData = {
                  perro_id: datos.id,
                  raza_id: id,
                  probabilidad: parseFloat(probabilidad),
                };
    
                razaPerroModel.createRazaPerro(razaPerroData, (err, newRazaPerro) => {
                  if (err) {
                    console.error('Error al asociar la raza con el perro:', err);
                  }
                });
              }
            });
          }
          callback(null, newPerro);
      });
  });
  } catch (error) {
    return callback(error, null); // Devuelve un error si la validación falla
  }
};


// Exportar las funciones
module.exports = {
  getAllPerros,
  getPerroById,
  getPerrosByUsuario,
  createPerro,
  eliminarPerro,
  modificarPerro
};
