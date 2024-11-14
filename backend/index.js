const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Si estás usando contraseñas encriptadas
const Token = require("./token");
const tokenInstance = new Token();
const perroModel = require("./modelos/perroModel"); // Importa el modelo de Perro
const usuarioModel = require("./modelos/usuarioModel"); // Importa el modelo de Usuario
const razaModel = require("./modelos/razaModel"); // Importa el modelo de Raza
const razaPerroModel = require("./modelos/razaPerroModel"); // Importa el modelo de razaPerro
const tokenBlacklist = new Set();
const sharp = require("sharp");
const rimraf = require("rimraf");
const EnvioCorreo = require("./modelos/EnvioCorreo");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // Usar la ruta de uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

// Inicializar Multer
const upload = multer({ storage: storage });

//Animales
// Endpoint para obtener todos los animales
app.get("/animals", (req, res) => {
  perroModel.getAllPerros((err, animals) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener los animales" });
    }

    // Convertir el Buffer de la foto a Base64
    const animalsWithBase64Photos = animals.map((animal) => ({
      ...animal,
      foto: animal.foto
        ? `data:image/jpeg;base64,${animal.foto.toString("base64")}`
        : null, // Convertir el Buffer a Base64
    }));

    res.json(animalsWithBase64Photos); // Enviar la lista modificada
  });
});

// Endpoint para obtener animales por usuario
app.get("/animalsPorUsuario/:id", (req, res) => {
  const userId = parseInt(req.params.id);

  perroModel.getPerrosByUsuario(userId, (err, animals) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener los animales" });
    }
    const animalsWithBase64Photos = animals.map((animal) => ({
      ...animal,
      foto: animal.foto
        ? `data:image/jpeg;base64,${animal.foto.toString("base64")}`
        : null, // Convertir el Buffer a Base64
    }));
    res.json(animalsWithBase64Photos);
  });
});

// Endpoint para obtener un animal por ID
app.get("/animals/:id", (req, res) => {
  const animalId = parseInt(req.params.id);

  perroModel.getPerroById(animalId, (err, animal) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener el animal" });
    }
    if (!animal) {
      return res.status(404).json({ error: "Animal no encontrado" });
    }
    const animalWithBase64Photo = {
      ...animal,
      foto: animal.foto
        ? `data:image/jpeg;base64,${animal.foto.toString("base64")}`
        : null, // Convertir el Buffer a Base64
    };
    res.json(animalWithBase64Photo);
  });
});

// Endpoint para crear un nuevo animal
app.post("/animals", upload.single("imageFile"), async (req, res) => {
  try {
    const {
      ubicacion,
      tamano,
      contacto,
      edad,
      descripcion,
      nombre,
      estadoAdopcion,
      usuario,
      razas,
    } = req.body;

    // Verificar si el archivo fue subido
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo." });
    }

    // Verificar campos requeridos
    if (
      !nombre ||
      !descripcion ||
      !ubicacion ||
      !usuario ||
      !tamano ||
      !contacto ||
      !edad ||
      !estadoAdopcion
    ) {
      return res.status(400).json({ error: "Faltan campos requeridos." });
    }

    const userIdd = parseInt(usuario, 10); // Asegúrate de que el campo se llama 'usuario'
    if (isNaN(userIdd)) {
      return res.status(400).json({ error: "Usuario inválido." });
    }

    // Leer la imagen y convertirla a base64
    const imageFile = req.file; // Cambiado a req.file
    const imageBuffer = await sharp(imageFile.path)
      .resize({ width: 500 }) // Ajusta el tamaño según sea necesario
      .toBuffer(); // Obtener el búfer redimensionado

    // Convertir a base64
    // const imageBase64 = imageBuffer.toString('base64');

    const newAnimal = {
      ubicacion,
      tamano: parseInt(tamano), // Asegúrate de convertir a número si es necesario
      contacto,
      edad: parseInt(edad), // Asegúrate de convertir a número si es necesario
      descripcion,
      nombre,
      estadoAdopcion: parseInt(estadoAdopcion), // Asegúrate de convertir a número si es necesario
      foto: imageBuffer, // Guardar la imagen como base64
      userId: userIdd,
    };
    const razaArray = JSON.parse(razas);
    perroModel.createPerro(newAnimal, razaArray, (err, createdAnimal) => {
      if (err) {
        console.error("Error al crear el animal en la base de datos:", err);
        return res.status(500).json({ error: "Error al crear el animal" });
      }
      fs.unlink(imageFile.path, (err) => {
        if (err) {
          console.error("Error al eliminar el archivo:", err);
        }
      });
      res.json(createdAnimal);
    });
  } catch (error) {
    console.error("Error en el manejo de la solicitud:", error); // Añadir log para el error
    return res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});
// Endpoint para eliminar un perro
app.delete("/animals/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Llamar a la función en el modelo para eliminar el perro y las razas asociadas
    await perroModel.eliminarPerro(id, (err) => {
      if (err) {
        console.error("Error al eliminar el perro:", err);
        return res.status(500).json({ error: "Error al eliminar el perro." });
      }
      res.status(204).send(); // No content
    });
  } catch (error) {
    console.error("Error en la solicitud:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});
app.put("/animals", upload.single("imageFile"), async (req, res) => {
  try {
    const {
      id,
      ubicacion,
      tamano,
      contacto,
      edad,
      descripcion,
      nombre,
      estadoAdopcion,
      usuario,
      razas,
    } = req.body;

    // Verificar si el archivo fue subido
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo." });
    }

    // Verificar campos requeridos
    if (
      !id ||
      !nombre ||
      !descripcion ||
      !ubicacion ||
      !usuario ||
      !tamano ||
      !contacto ||
      !edad ||
      !estadoAdopcion
    ) {
      return res.status(400).json({ error: "Faltan campos requeridos." });
    }

    const userIdd = parseInt(usuario, 10); // Asegúrate de que el campo se llama 'usuario'
    if (isNaN(userIdd)) {
      return res.status(400).json({ error: "Usuario inválido." });
    }

    // Leer la imagen y convertirla a base64
    const imageFile = req.file; // Cambiado a req.file
    const imageBuffer = await sharp(imageFile.path)
      .resize({ width: 500 }) // Ajusta el tamaño según sea necesario
      .toBuffer(); // Obtener el búfer redimensionado

    // Convertir a base64
    // const imageBase64 = imageBuffer.toString('base64');

    const newAnimal = {
      id,
      ubicacion,
      tamano: parseInt(tamano), // Asegúrate de convertir a número si es necesario
      contacto,
      edad: parseInt(edad), // Asegúrate de convertir a número si es necesario
      descripcion,
      nombre,
      estadoAdopcion: parseInt(estadoAdopcion), // Asegúrate de convertir a número si es necesario
      foto: imageBuffer, // Guardar la imagen como base64
      userId: userIdd,
    };
    const razaArray = JSON.parse(razas);
    perroModel.modificarPerro(newAnimal, razaArray, (err, createdAnimal) => {
      if (err) {
        console.error("Error al modificar el animal en la base de datos:", err);
        return res.status(500).json({ error: "Error al modificar el animal" });
      }
      fs.unlink(imageFile.path, (err) => {
        if (err) {
          console.error("Error al eliminar el archivo:", err);
        }
      });
      res.json(createdAnimal);
    });
  } catch (error) {
    console.error("Error en el manejo de la solicitud:", error); // Añadir log para el error
    return res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});
//Cuenta
// Ruta de login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  usuarioModel.getUsuarioByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Error en la autenticación" });
    }
    if (!user || !bcrypt.compareSync(password, user.contrasena)) {
      return res
        .status(401)
        .json({ message: "Email o contraseña incorrectos" });
    }

    const token = tokenInstance.generarToken(user);
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.correo,
        name: user.nombre,
        phone: user.telefono,
      },
    });
  });
});

// Endpoint de logout
app.post("/logout", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Obtener el token del encabezado de autorización

  if (!token) {
    return res.status(400).send("No token provided");
  }

  // Añadir el token a una blacklist (si estás utilizando esta estrategia)
  tokenBlacklist.add(token);

  return res.status(200).send("Logout successful");
});

// Middleware para verificar el token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (token && !tokenBlacklist.has(token)) {
    jwt.verify(token, "tu_clave_secreta", (err, decoded) => {
      if (err) {
        return res.status(403).send("Token no válido");
      }
      req.userId = decoded.id; // Guardar el id del usuario en el request
      next();
    });
  } else {
    return res.status(403).send("Token no proporcionado o inválido");
  }
}
//Raza
app.get("/razas", (req, res) => {
  razaModel.getAllRazas((err, razas) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener las razas" });
    }

    res.json(razas);
  });
});

//Usuario
app.post("/registroUsuario", (req, res) => {
  const { nombre, telefono, correo, contrasena } = req.body;
  const nuevoUsuario = { nombre, telefono, correo, contrasena };

  // Crear el usuario en la base de datos
  usuarioModel.createUsuario(nuevoUsuario, (err, usuarioCreado) => {
    if (err) {
      return res.status(500).json({ error: "Error al crear el usuario" });
    }
    res
      .status(201)
      .json({ message: "Usuario creado exitosamente", usuario: usuarioCreado });
  });
});

//Recuperacion de contrasemna

// Endpoint para solicitar el correo para restablecer la contraseña
app.post("/solicitar-restablecer", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(200).json({ message: "El correo es obligatorio",error:true });
  }

  // Buscar al usuario en la base de datos

  usuarioModel.getUsuarioByEmail(email, async (err, user) => {
    if (err) {
      if (err.message === "Correo no encontrado") {
        return res.status(200).json({ message: "Correo no encontrado",error:true });
      }
      return res.status(200).json({ message: "Error interno del servidor",error:true });
    }

    const usuario = user;

    if (!usuario) {
      return res.status(200).json({ message: "Correo no encontrado",error:true });
    }

    try {
      // Crear un token para el restablecimiento de la contraseña
      // const token = tokenInstance.generarToken(usuario);
      const recoveryCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      usuarioModel.saveRecoveryCode(
        usuario.id,
        recoveryCode,
        async (err, usuarioActualizado) => {
          if (err) {
            return res
              .status(200)
              .json({ message: "Error al guardar el código de recuperación",error:true });
          }
          await EnvioCorreo.sendPasswordRecoveryEmail(email, recoveryCode);
          return res
            .status(200)
            .json({ message: "Correo enviado para restablecer la contraseña",error:false });
        }
      );
    } catch (error) {
      return res.status(200).json({ message: "Error al enviar el correo",error:true });
    }
  });
});

// Endpoint para restablecer la contraseña
app.post("/restablecer-contrasena", async (req, res) => {
  const { codigo, nuevaContrasena, email } = req.body;

  if (!codigo || !nuevaContrasena) {
    return res
      .status(400)
      .json({ message: "Código y nueva contraseña son requeridos",error:true });
  }

  try {
    // Buscar al usuario usando el id decodificado
    usuarioModel.getUsuarioByEmail(email, async (err, user) => {
      if (err) {
        if (err.message === "Correo no encontrado") {
          return res.status(200).json({ message: "Correo no encontrado",error:true });
        }
        return res.status(200).json({ message: "Error interno del servidor",error:true });
      }
      if (!user) {
        return res.status(200).json({ message: "Usuario no encontrado",error:true });
      }
      usuarioModel.verifyRecoveryCode(user.id, codigo, async (err, isValid) => {
        if (err || !isValid) {
          return res
            .status(200)
            .json({
              message: "El código de recuperación es incorrecto o ha expirado",
            });
        }

        // Actualizar la contraseña del usuario en la base de datos
        usuarioModel.actualizarContrasena(user.id, nuevaContrasena, async (err,usuarioMod)=>{
          if (err) {
            return res.status(200).json({ message: "Error al guardar la contraseña",error:true });
          }
          return res
          .status(200)
          .json({ message: "Contraseña restablecida con éxito",error:false });
        });
      });
    });
  } catch (error) {
    return res.status(400).json({ message: "Código inválido o expirado",error:true });
  }
});

// Configurar la carpeta de archivos estáticos para las imágenes subidas
app.use("/uploads", express.static("uploads"));

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
