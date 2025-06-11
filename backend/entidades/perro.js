// Perro.js
class Perro {
    constructor(id, direccion,provincia,canton,distrito, tamano, contacto, edad, descripcion, nombre, foto, estadoAdopcion, userId,razas,nombreUsuario) {
      this.id = id;
      this.direccion = direccion;
      this.tamano = tamano;
      this.contacto = contacto;
      this.edad = edad;
      this.descripcion = descripcion;
      this.nombre = nombre;
      this.foto = foto;
      this.estadoAdopcion = estadoAdopcion;
      this.userId = userId;
      this.razas=razas;
      this.nombreUsuario=nombreUsuario;
      this.provincia = provincia;
      this.canton = canton;
      this.distrito = distrito;
    }
  
    static validate(perro) {
      const requiredFields = ['direccion', 'tamano', 'contacto', 'edad', 'descripcion', 'nombre', 'foto', 'estadoAdopcion', 'userId','provincia','canton','distrito'];
      for (const field of requiredFields) {
        if (perro[field] === undefined || perro[field] === null) {
          throw new Error(`El campo ${field} es obligatorio.`);
        }
      }
    }
  }
  
  module.exports = Perro;
  