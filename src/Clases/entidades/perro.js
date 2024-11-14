// Perro.js
class Perro {
    constructor(id, ubicacion, tamano, contacto, edad, descripcion, nombre, foto, estadoAdopcion, userId) {
      this.id = id;
      this.ubicacion = ubicacion;
      this.tamano = tamano;
      this.contacto = contacto;
      this.edad = edad;
      this.descripcion = descripcion;
      this.nombre = nombre;
      this.foto = foto;
      this.estadoAdopcion = estadoAdopcion;
      this.userId = userId;
    }
  
    static validate(perro) {
      const requiredFields = ['ubicacion', 'tamano', 'contacto', 'edad', 'descripcion', 'nombre', 'foto', 'estadoAdopcion', 'userId'];
      for (const field of requiredFields) {
        if (perro[field] === undefined || perro[field] === null) {
          throw new Error(`El campo ${field} es obligatorio.`);
        }
      }
    }
  }
  
  module.exports = Perro;
  