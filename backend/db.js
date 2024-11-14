// db.js
const mysql = require('mysql2');

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost', // Cambia esto si tu MySQL está en otro host
  user: 'root', // Cambia esto si tu usuario no es 'root'
  password: 'admin', // Cambia esto por tu contraseña
  database: 'db_findyourfriend' // Cambia esto por el nombre de tu base de datos
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Exportar la conexión para su uso en otros archivos
module.exports = db;
