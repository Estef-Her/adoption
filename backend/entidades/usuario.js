// Usuario.js
class Usuario {
    constructor(id, nombre, telefono, correo, contrasena) {
      this.id = id;
      this.nombre = nombre;
      this.telefono = telefono;
      this.correo = correo;
      this.contrasena = contrasena;
    }
  
    static validate(usuario) {
      const requiredFields = ['nombre', 'telefono', 'correo', 'contrasena'];
      for (const field of requiredFields) {
        if (usuario[field] === undefined || usuario[field] === null) {
          throw new Error(`El campo ${field} es obligatorio.`);
        }
      }
    }
  }
  
  module.exports = Usuario;
  