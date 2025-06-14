const https = require("https");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsp = require('fs').promises;  // IMPORTANTE: .promises
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
const URL_SITE = "https://estef-her.github.io/";
const URL_SITEL = "http://localhost:3000/";
const URL_USAR = URL_SITE;

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
      direccion,
      provincia,
      canton,
      distrito,
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
      !direccion ||
      !provincia ||
      !canton ||
      !distrito ||
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
    const tempPath     = req.file.path; 
    const inputBuffer  = await fsp.readFile(tempPath);
    await tryUnlink(tempPath); 
    
    const imageBuffer = await sharp(inputBuffer)
      .resize({ width: 500 }) // Ajusta el tamaño según sea necesario
      .toBuffer(); // Obtener el búfer redimensionado

    // Convertir a base64
    // const imageBase64 = imageBuffer.toString('base64');

    const newAnimal = {
      direccion,
      provincia,
      canton,
      distrito,
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
app.post("/modificarAnimal", upload.single("imageFile"), async (req, res) => {
  try {
    const {
      id,
      direccion,
      provincia,
      canton,
      distrito,
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
      !direccion ||
      !provincia ||
      !canton ||
      !distrito ||
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
    const tempPath     = req.file.path; 
    const inputBuffer  = await fsp.readFile(tempPath);
    await tryUnlink(tempPath); 
    
    const imageBuffer = await sharp(inputBuffer)
      .resize({ width: 500 }) // Ajusta el tamaño según sea necesario
      .toBuffer(); // Obtener el búfer redimensionado

    // Convertir a base64
    // const imageBase64 = imageBuffer.toString('base64');

    const newAnimal = {
      id,
      direccion,
      provincia,
      canton,
      distrito,
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
    perroModel.modificarPerro(
      newAnimal,
      razaArray,
      async (err, createdAnimal) => {
        if (err) {
          console.error(
            "Error al modificar el animal en la base de datos:",
            err
          );
          return res
            .status(500)
            .json({ error: "Error al modificar el animal" });
        }

        res.json(createdAnimal);
      }
    );
  } catch (error) {
    console.error("Error en el manejo de la solicitud:", error); // Añadir log para el error
    return res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});
async function tryUnlink(path, retries = 5, delay = 12000) {
  for (let i = 0; i < retries; i++) {
    try {
      await fsp.unlink(path);
      console.log("Archivo eliminado");
      return;
    } catch (err) {
      if (err.code === "EPERM" || err.code === "EBUSY") {
        const minutos = delay / (1000 * 60);

        console.log(`Intento ${i + 1} fallido, reintentando en ${minutos} minutos...`);
        console.log(err);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
  console.error("No se pudo eliminar el archivo tras varios intentos.");
}
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
        rol: { id: user.rol_id, descripcion: user.rol_descripcion },
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
app.post("/registroUsuario", async (req, res) => {
  const { nombre, telefono, correo, contrasena, rol } = req.body;
  const nuevoUsuario = { nombre, telefono, correo, contrasena, rol };

  // Crear el usuario en la base de datos
  usuarioModel.createUsuario(nuevoUsuario, async (err, usuarioCreado) => {
    if (err) {
      return res.status(500).json({ error: "Error al crear el usuario" });
    }
    
      await EnvioCorreo.enviarCorreoRegistroPropio(
        nuevoUsuario.correo,
        usuarioCreado,
        URL_USAR
      );
    res
      .status(201)
      .json({ message: "Usuario creado exitosamente", usuario: usuarioCreado });
  });
});
app.get("/usuarios", (req, res) => {
  usuarioModel.getAllUsuarios((err, usuarios) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener los usuarios" });
    }

    res.json(usuarios);
  });
});
//Usuario por administrador
app.post("/registroUsuarioAd", async (req, res) => {
  const { nombre, telefono, correo, rol } = req.body;
  var contrasena = usuarioModel.generarContrasena();
  const nuevoUsuario = { nombre, telefono, correo, contrasena, rol };
  // Crear el usuario en la base de datos
  usuarioModel.createUsuario(nuevoUsuario, async (err, usuarioCreado) => {
    if (err) {
      return res.status(500).json({ error: "Error al crear el usuario" });
    }
    try {
      // Crear un token para el restablecimiento de la contraseña
      // const token = tokenInstance.generarToken(usuario);

      await EnvioCorreo.enviarCorreoRegistro(
        nuevoUsuario.correo,
        contrasena,
        usuarioCreado,
        URL_USAR
      );
      res
        .status(201)
        .json({
          message: "Usuario creado exitosamente",
          usuario: usuarioCreado,
        });
    } catch (error) {
      return res
        .status(200)
        .json({ message: "Error al enviar el correo", error: true });
    }
  });
});
app.post("/modificarUsuario", async (req, res) => {
  const { nombre, telefono, correo, rol, id } = req.body;
  const nuevoUsuario = { nombre, telefono, correo, rol, id };
  // Crear el usuario en la base de datos
  usuarioModel.modificarUsuario(nuevoUsuario, async (err, usuarioCreado) => {
    if (err) {
      return res.status(500).json({ error: "Error al modificar el usuario" });
    }
    try {
      await EnvioCorreo.enviarCorreoModificacion(
        nuevoUsuario.correo,
        "",
        nuevoUsuario,
        URL_USAR
      );
      res
        .status(201)
        .json({
          message: "Usuario modificado exitosamente",
          usuario: usuarioCreado,
        });
    } catch (error) {
      return res
        .status(200)
        .json({ message: "Error al enviar el correo", error: true });
    }
  });
});
// Endpoint para eliminar un perro
app.delete("/usuario/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Llamar a la función en el modelo para eliminar el usuario y los perros asociados
    await usuarioModel.eliminarUsuario(id, (err) => {
      if (err) {
        console.error("Error al eliminar el usuario:", err);
        return res.status(500).json({ error: "Error al eliminar el usuario." });
      }
      res.status(204).send(); // No content
    });
  } catch (error) {
    console.error("Error en la solicitud:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});

app.get("/usuarios", (req, res) => {
  usuarioModel.getAllUsuarios((err, usuarios) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener los usuarios" });
    }

    res.json(usuarios);
  });
});

//Recuperacion de contrasemna

// Endpoint para solicitar el correo para restablecer la contraseña
app.post("/solicitar-restablecer", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(200)
      .json({ message: "El correo es obligatorio", error: true });
  }

  // Buscar al usuario en la base de datos

  usuarioModel.getUsuarioByEmail(email, async (err, user) => {
    if (err) {
      if (err.message === "Correo no encontrado") {
        return res
          .status(200)
          .json({ message: "Correo no encontrado", error: true });
      }
      return res
        .status(200)
        .json({ message: "Error interno del servidor", error: true });
    }

    const usuario = user;

    if (!usuario) {
      return res
        .status(200)
        .json({ message: "Correo no encontrado", error: true });
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
              .json({
                message: "Error al guardar el código de recuperación",
                error: true,
              });
          }
          await EnvioCorreo.sendPasswordRecoveryEmail(
            email,
            recoveryCode,
            usuario,
            URL_USAR
          );
          return res
            .status(200)
            .json({
              message: "Correo enviado para restablecer la contraseña",
              error: false,
            });
        }
      );
    } catch (error) {
      return res
        .status(200)
        .json({ message: "Error al enviar el correo", error: true });
    }
  });
});

// Endpoint para restablecer la contraseña
app.post("/restablecer-contrasena", async (req, res) => {
  const { codigo, nuevaContrasena, email } = req.body;

  if (!codigo || !nuevaContrasena) {
    return res
      .status(400)
      .json({
        message: "Código y nueva contraseña son requeridos",
        error: true,
      });
  }

  try {
    // Buscar al usuario usando el id decodificado
    usuarioModel.getUsuarioByEmail(email, async (err, user) => {
      if (err) {
        if (err.message === "Correo no encontrado") {
          return res
            .status(200)
            .json({ message: "Correo no encontrado", error: true });
        }
        return res
          .status(200)
          .json({ message: "Error interno del servidor", error: true });
      }
      if (!user) {
        return res
          .status(200)
          .json({ message: "Usuario no encontrado", error: true });
      }
      usuarioModel.verifyRecoveryCode(user.id, codigo, async (err, isValid) => {
        if (err || !isValid) {
          return res.status(200).json({
            message: "El código de recuperación es incorrecto o ha expirado",
          });
        }

        // Actualizar la contraseña del usuario en la base de datos
        usuarioModel.actualizarContrasena(
          user.id,
          nuevaContrasena,
          async (err, usuarioMod) => {
            if (err) {
              return res
                .status(200)
                .json({
                  message: "Error al guardar la contraseña",
                  error: true,
                });
            }
            return res
              .status(200)
              .json({
                message: "Contraseña restablecida con éxito",
                error: false,
              });
          }
        );
      });
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Código inválido o expirado", error: true });
  }
});

// Endpoint para cambiar la contraseña
app.post("/cambiar-contrasena", async (req, res) => {
  const { nuevaContrasena, actualContrasena, email } = req.body;

  if (!actualContrasena || !nuevaContrasena) {
    return res
      .status(400)
      .json({
        message: "Contraseña actual y nueva contraseña son requeridos",
        error: true,
      });
  }

  try {
    // Buscar al usuario usando el id decodificado
    usuarioModel.getUsuarioByEmail(email, async (err, user) => {
      if (err) {
        if (err.message === "Correo no encontrado") {
          return res
            .status(200)
            .json({ message: "Correo no encontrado", error: true });
        }
        return res
          .status(200)
          .json({ message: "Error interno del servidor", error: true });
      }
      if (!user) {
        return res
          .status(200)
          .json({ message: "Usuario no encontrado", error: true });
      }
      usuarioModel.verifyContrasena(
        user.id,
        actualContrasena,
        async (err, isValid) => {
          if (err || !isValid) {
            return res.status(200).json({
              message: "La contraseña actual es incorrecta",
            });
          }

          // Actualizar la contraseña del usuario en la base de datos
          usuarioModel.actualizarContrasena(
            user.id,
            nuevaContrasena,
            async (err, usuarioMod) => {
              if (err) {
                return res
                  .status(200)
                  .json({
                    message: "Error al guardar la contraseña",
                    error: true,
                  });
              }
              return res
                .status(200)
                .json({
                  message: "Contraseña cambiada con éxito",
                  error: false,
                });
            }
          );
        }
      );
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Contraseña incorrecta", error: true });
  }
});

// Configurar la carpeta de archivos estáticos para las imágenes subidas
app.use("/uploads", express.static("uploads"));

app.listen(4000, "0.0.0.0", () => {
  console.log("Servidor corriendo en http://0.0.0.0:4000");
});
