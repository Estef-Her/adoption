// Raza.js
class Rol {
    constructor(idrol, nombre) {
      this.idrol = idrol;
      this.nombre = nombre;
    }
  
    static validate(raza) {
      if (!raza.nombre) {
        throw new Error('El campo descripcion es obligatorio.');
      }
    }
  }
  
  module.exports = Rol;
  