// Raza.js
class Raza {
    constructor(id, nombre) {
      this.id = id;
      this.nombre = nombre;
    }
  
    static validate(raza) {
      if (!raza.nombre) {
        throw new Error('El campo nombre es obligatorio.');
      }
    }
  }
  
  module.exports = Raza;
  