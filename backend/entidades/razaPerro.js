// Raza.js
class RazaPerro {
    constructor(perro_id,raza_id, probabilidad) {
      this.perro_id = perro_id;
      this.raza_id = raza_id;
      this.probabilidad=probabilidad;
    }
  
    static validate(RazaPerro) {
        const requiredFields = ['perro_id', 'raza_id', 'probabilidad'];
        for (const field of requiredFields) {
          if (RazaPerro[field] === undefined || RazaPerro[field] === null) {
            throw new Error(`El campo ${field} es obligatorio.`);
          }
        }
      }
  }
  
  module.exports = RazaPerro;
  