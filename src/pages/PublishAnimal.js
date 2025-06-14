import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import * as tmImage from "@teachablemachine/image";
import imageCompression from "browser-image-compression";
import TeacheableMachine from "../Clases/TeacheableMachine";
import DeteccionImagen from "../Clases/DeteccionImagen";
import LoaderComponent from "components/Loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { URL_SERVICIO } from "Clases/Constantes";
import LoadingModal from "../LoadingModal";
import UbicacionForm from "components/UbicacionForm";

const TeacheableMachineInstance = new TeacheableMachine();
const DeteccionImagenInstance = new DeteccionImagen();

// Esquema de validación de Yup
const validationSchema = yup.object().shape({
  name: yup.string().required("El nombre es requerido"),
  description: yup.string().required("La descripción es requerida"),
  raza: yup.string().required("La raza es requerida"),
  edad: yup
    .number()
    .typeError("La edad debe ser un número")
    .required("La edad es obligatoria")
    .positive("La edad debe ser un número positivo")
    .integer("La edad debe ser un número entero"),
  provincia: yup.string().required("La provincia es obligatoria"),
  canton: yup.string().required("El cantón es obligatorio"),
  distrito: yup.string().required("El distrito es obligatorio"),
  direccionExacta: yup.string().required("La dirección es obligatoria"),
  tamano: yup.string().required("El tamaño es requerido"),
  contacto: yup
    .string()
    .matches(/^[0-9]+$/, "Solo se permiten números") // Asegura que solo sean números
    .length(8, "El número debe tener exactamente 8 dígitos") // Valida que tenga exactamente 8 dígitos
    .required("El número de teléfono es obligatorio"),
  estadoAdopcion: yup.string().required("El estado de adopción es requerido"),
  image: yup.string().url("Invalid URL"),
});

function PublishAnimal() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const imageRef = useRef(null);
  const [raza, setRaza] = useState([]); // Estado para la raza
  const [razaString, setRazaString] = useState(""); // Estado para la raza
  const [loading, setLoading] = useState(false);
  const [modCargado, setModCargado] = useState(true);
  const [catalogoRazas, setCatalogoRazas] = useState([]); // Estado para la raza
  const [validationMessage, setValidationMessage] = useState("");

  // Cargar el modelo al montar el componente
  // useEffect(() => {
  //   const loadModel = async () => {
  //     const modelURL = URL + "model.json";
  //     const metadataURL = URL + "metadata.json";

  //     const loadedModel = await tmImage.load(modelURL, metadataURL);
  //     setModel(loadedModel);
  //   };

  //   loadModel();
  // }, []);
  useEffect(() => {
    const waitForModels = async () => {
      await new Promise((resolve) => {
        const checkModels = () => {
          if (
            TeacheableMachineInstance.getModel() &&
            DeteccionImagenInstance.getModel()
          ) {
            resolve();
          } else {
            // Revisa periódicamente si ya se cargaron los modelos
            const interval = setInterval(() => {
              if (
                TeacheableMachineInstance.getModel() &&
                DeteccionImagenInstance.getModel()
              ) {
                clearInterval(interval);
                resolve();
              }
            }, 300); // revisa cada 300ms
          }
        };

        checkModels();
      });

      // Espera un pequeño tiempo adicional (opcional)
      setTimeout(() => {
        setModCargado(false);
      }, 500);
    };

    waitForModels();
  }, []);

  useEffect(() => {
    setModCargado(true);
    axios
      .get(URL_SERVICIO + "razas", {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })
      .then((response) => {
        setCatalogoRazas(response.data);
        setModCargado(false);
      })
      .catch((error) => {
        console.error(error);
        setModCargado(false);
      });
  }, []);
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      raza: "",
      edad: "",
      provincia: "",
      canton: "",
      distrito: "",
      direccionExacta: "",
      tamano: "",
      contacto: "",
      estadoAdopcion: "",
      image: "", // Para la URL de la imagen
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const user = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();
      formData.append("nombre", values.name);
      formData.append("descripcion", values.description);
      formData.append("edad", parseInt(values.edad, 10));
      formData.append("razas", JSON.stringify(raza));
      formData.append("provincia", values.provincia);
      formData.append("canton", values.canton);
      formData.append("distrito", values.distrito);
      // formData.append('razas', raza); // Incluir raza en el FormData
      formData.append("direccion",values.direccionExacta);
      formData.append("tamano", parseInt(values.tamano, 10));
      formData.append("contacto", values.contacto);
      formData.append("estadoAdopcion", parseInt(values.estadoAdopcion, 10));
      formData.append("usuario", user.id);

      // Si hay un archivo, agregarlo
      if (imageFile) {
        var file = base64ToFile(imageFile, values.name.replace(" ", ""));
        console.log(file);
        formData.append("imageFile", file);
      }

      // // Si hay una URL de imagen, agregarla
      // if (values.image) {
      //   formData.append('image', values.image);
      // }
      // Obtener el token de autenticación
      setModCargado(true);
      axios
        .post(URL_SERVICIO + "animals", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "ngrok-skip-browser-warning": "true",
          },
        })
        .then((response) => {
          console.log(response.data);
          toast.success("El perro ha sido guardado exitosamente!"); // Mostrar mensaje emergente
          setModCargado(false);
          setTimeout(() => {
            navigate("/"); // Redirigir después de mostrar el mensaje
          }, 3000); // Esperar 3 segundos antes de redirigir
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          setModCargado(false);
        });
    },
  });
  function getBase64(file, callback) {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64data = reader.result.split(",")[1]; // Obtiene solo la parte base64
      callback(base64data); // Llama al callback con el base64
    };

    reader.readAsDataURL(file); // Lee el archivo como un URL de datos
  }
  function getBase64FileExtension(base64String) {
    // Verificar si la cadena base64 contiene el prefijo de tipo MIME
    const matches = base64String.match(/^data:(.+);base64,/);
    if (matches && matches[1]) {
      // Obtener el tipo MIME
      const mimeType = matches[1];
      const format = mimeType.split("/")[1];

      // Retornar la extensión correspondiente
      return format; // Retorna null si no hay coincidencia
    }
    return null; // Retorna null si la cadena no tiene el formato correcto
  }
  function base64ToFile(base64String, fileName) {
    // Divide la cadena base64 en dos partes: el tipo de contenido y los datos
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1]; // Obtener el tipo MIME de la cadena
    const bstr = atob(arr[1]); // Decodificar la parte de datos
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    // Convertir la cadena decodificada a un array de bytes
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    // Crear y devolver un objeto File
    return new File([u8arr], fileName, { type: mime });
  }
  // Manejar la selección de archivo
  const handleFileChange = (event) => {
    setLoading(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setImageFile(imageData);

        // Crear imagen temporal solo para detectar carga completa
        const tempImg = new Image();
        tempImg.src = imageData;
        tempImg.onload = () => {
          validateImage(imageData);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Validar la imagen con el modelo de Teachable Machine
  const validateImage = async (imageSrc) => {
    if (DeteccionImagenInstance.getModel() && imageRef.current) {
      await new Promise((resolve) => {
        if (imageRef.current.complete) resolve();
        else imageRef.current.onload = resolve;
      });
      const hayPerro = await DeteccionImagenInstance.handlePredict(
        imageRef.current
      );

      if (!hayPerro) {
        setRaza([]);
        setImageFile(null); // Limpiar imagen
        imageRef.current = null;
        setValidationMessage(
          "No se detectó un perro en la imagen. Por favor, suba una imagen válida, o intente probar con una toma diferente."
        );
        setLoading(false);
        return; // No continuar si no hay perro
      }
    }
    if (TeacheableMachineInstance.getModel() && imageSrc) {
      setValidationMessage("");
      const imgElement = document.createElement("img");
      imgElement.src = imageSrc;
      imgElement.onload = async () => {
        const prediction = await TeacheableMachineInstance.getModel().predict(
          imgElement
        );
        // Filtra solo las predicciones con más de 0% de probabilidad
        var razaS = [];
        var razaSS = "";
        prediction.forEach((pred) => {
          var prob = Math.round(pred.probability * 100);
          if (prob > 0) {
            var razaInCatalogo = catalogoRazas.find(
              (r) => r.nombre === pred.className
            );
            razaS.push({
              nombre: pred.className,
              probabilidad: prob,
              id:
                razaInCatalogo !== null && razaInCatalogo !== undefined
                  ? razaInCatalogo.id
                  : 0,
            });
            razaSS += (razaSS !== "" ? ", " : "") + pred.className;
          }
        });
        setRaza(razaS);
        setRazaString(razaSS);
        formik.setFieldValue("raza", razaSS);
        setLoading(false);
      };
    }
  };

  return (
    <Container className="mt-4">
      {/* {modCargado && (
        <div className="mt-3" style={{ textAlign: "center" }}>
        <Spinner animation="border" role="status" className="spinn">
          <span className="visually-hidden">Cargando elementos necesarios...</span>
        </Spinner>
        <p>Cargando elementos necesarios, espere...</p>
      </div>
              )} */}
      <LoadingModal visible={modCargado} />
      <LoadingModal visible={loading} />
      <h4>Publicar</h4>
      <Form onSubmit={formik.handleSubmit}>
        <Form.Group controlId="name">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.name && formik.errors.name}
            disabled={modCargado}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.name}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="description" className="mt-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Descripción"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.description && formik.errors.description}
            disabled={modCargado}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.description}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="edad" className="mt-3">
          <Form.Label>Edad</Form.Label>
          <Form.Control
            as="input"
            type="number"
            rows={3}
            placeholder="Edad"
            value={formik.values.edad}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.edad && formik.errors.edad}
            disabled={modCargado}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.edad}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="raza" className="mt-3">
          <Form.Label>Raza</Form.Label>
          <Form.Control
            type="text"
            placeholder="Raza"
            value={formik.values.raza}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.raza && formik.errors.raza}
            disabled={!imageFile || modCargado} // Deshabilitar si no hay imagen seleccionada
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.raza}
          </Form.Control.Feedback>
        </Form.Group>
        <UbicacionForm formik={formik} modCargado={false} />
        <Form.Group controlId="tamano" className="mt-3">
          <Form.Label>Tamaño</Form.Label>
          <Form.Select
            value={formik.values.tamano}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.tamano && formik.errors.tamano}
            disabled={modCargado}
          >
            <option value="0">Seleccione un tamaño</option>
            <option value="1">Pequeño</option>
            <option value="2">Mediano</option>
            <option value="3">Grande</option>
            <option value="4">Muy Grande</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {formik.errors.tamano}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="contacto" className="mt-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="tel" // Permite el ingreso de números
            placeholder="Teléfono"
            value={formik.values.contacto}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.contacto && formik.errors.contacto}
            disabled={modCargado}
            inputMode="numeric" // Asegura el teclado numérico en dispositivos móviles
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.contacto}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Combo para Estado de Adopción */}
        <Form.Group controlId="estadoAdopcion" className="mt-3">
          <Form.Label>Estado</Form.Label>
          <Form.Select
            value={formik.values.estadoAdopcion}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={modCargado}
            isInvalid={
              formik.touched.estadoAdopcion && formik.errors.estadoAdopcion
            }
          >
            <option value="0">Seleccione el estado</option>
            <option value="1">En adopción</option>
            <option value="2">Adoptado</option>
            <option value="3">Perdido</option>
            <option value="4">Encontrado</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {formik.errors.estadoAdopcion}
          </Form.Control.Feedback>
        </Form.Group>

        {/* <Form.Group controlId="image" className="mt-3">
          <Form.Label>URL de Imagen</Form.Label>
          <Form.Control
            type="text"
            placeholder="URL de Imagen"
            value={formik.values.image}
            onChange={handleUrlChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.image && formik.errors.image}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.image}
          </Form.Control.Feedback>
        </Form.Group> */}

        <Form.Group controlId="foto" className="mt-3">
          <Form.Label>Selecciona una imagen:</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            disabled={modCargado}
            onChange={handleFileChange}
          />
        </Form.Group>

        {imageFile && (
          <img
            src={imageFile}
            ref={imageRef}
            alt="Uploaded"
            style={{ marginTop: "20px", maxWidth: "300px" }}
          />
        )}
        {/* {predictions.length > 0 && (
          <div id="label-container" style={{ marginTop: '20px' }}>
            {predictions.map((prediction, index) => (
              <div key={index}>
                {prediction.className}: {prediction.probability.toFixed(2)}
              </div>
            ))}
          </div>
        )} */}
        {loading && <LoaderComponent />}
        {validationMessage && (
          <p style={{ color: "red", marginTop: "10px" }}>{validationMessage}</p>
        )}

        <Button
          variant="primary"
          type="submit"
          className="mt-3"
          disabled={loading || modCargado}
        >
          Publicar
        </Button>
      </Form>
      <ToastContainer />
    </Container>
  );
}

export default PublishAnimal;
