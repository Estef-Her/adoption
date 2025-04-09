import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import TeacheableMachine from '../Clases/TeacheableMachine';
import LoaderComponent from 'components/Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { URL_SERVICIO } from 'Clases/Constantes';

const TeacheableMachineInstance = new TeacheableMachine();

// Esquema de validación de Yup
const validationSchema = yup.object().shape({
  name: yup.string().required('El nombre es requerido'),
  description: yup.string().required('La descripción es requerida'),
  raza: yup.string().required('La raza es requerida'),
  edad: yup.number()
    .typeError('La edad debe ser un número')
    .required('La edad es obligatoria')
    .positive('La edad debe ser un número positivo')
    .integer('La edad debe ser un número entero'),
  ubicacion: yup.string().required('La ubicación es requerida'),
  tamano: yup.string().required('El tamaño es requerido'),
  contacto: yup.string()
    .matches(/^[0-9]+$/, "Solo se permiten números") // Asegura que solo sean números
    .length(8, "El número debe tener exactamente 8 dígitos") // Valida que tenga exactamente 8 dígitos
    .required("El número de teléfono es obligatorio"),
  estadoAdopcion: yup.string().required('El estado de adopción es requerido'),
  image: yup.string().url('Invalid URL'),
});

function ModificarAnimal() {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el ID del animal a modificar
  const [animal, setAnimal] = useState(null); // Estado para almacenar los datos del animal
  const [predictions, setPredictions] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [raza, setRaza] = useState([]); // Estado para la raza
  const [razaString, setRazaString] = useState(""); // Estado para la raza
  const [loadingAnimal, setLoadingAnimal] = useState(false); 
  const [loadingImage, setLoadingImage] = useState(false); 
  const [catalogoRazas, setCatalogoRazas] = useState([]); // Estado para la raza

  // Cargar los datos del animal al montar el componente
  useEffect(() => {
    setLoadingAnimal(true);
    axios.get(`http://localhost:4000/animals/${id}`)
      .then(response => {
        setAnimal(response.data);
        setImageFile(response.data.foto);
        setLoadingAnimal(false);
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching animal:', error);
        toast.error('Error al cargar los datos del animal.');
        setLoadingAnimal(false);
      });
  }, [id]);
  useEffect(() => {
    setLoadingAnimal(true);
    axios.get(URL_SERVICIO + 'razas')
      .then(response => {
        setCatalogoRazas(response.data);
        var s = animal ? animal.foto : '';
        setLoadingAnimal(false);
      })
      .catch(error => 
        {
          console.error(error)
          setLoadingAnimal(false);
        }
      );
  }, [animal]);
  const formik = useFormik({
    initialValues: {
      name: animal ? animal.nombre : '',
      description: animal ? animal.descripcion : '',
      raza: animal ? (animal.razas.length > 0 ? animal.razas.map(raza => raza.nombre).join(', ') : "") : '',
      edad: animal ? animal.edad : '',
      ubicacion: animal ? animal.ubicacion : '',
      tamano: animal ? animal.tamano : '',
      contacto: animal ? animal.contacto : '',
      estadoAdopcion: animal ? animal.estadoAdopcion : '',
      image: '',
    },
    enableReinitialize: true, // Permitir que el formulario se reinicialice cuando `animal` cambie
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      const user = JSON.parse(localStorage.getItem('user'));
      formData.append('nombre', values.name);
      formData.append('id', animal ? animal.id : 0);
      formData.append('descripcion', values.description);
      formData.append('edad', parseInt(values.edad,10));
      formData.append('razas', JSON.stringify(raza));
      // formData.append('razas', raza); // Incluir raza en el FormData
      formData.append('ubicacion', values.ubicacion);
      formData.append('tamano', parseInt(values.tamano,10));
      formData.append('contacto', values.contacto);
      formData.append('estadoAdopcion', parseInt(values.estadoAdopcion,10));
      formData.append('usuario', user.id);
      if (imageFile) {
        var file = base64ToFile(imageFile,values.name.replace(' ',''));
        console.log(file);
        formData.append('imageFile', file);
      }
      // Enviar los datos modificados
      axios.put(URL_SERVICIO + 'animals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        toast.success('El animal ha sido modificado exitosamente!'); 
        setTimeout(() => {
          navigate(-1);
        }, 3000);
      })
      .catch(error => {
        console.error('Error modifying animal:', error);
        toast.error('Error al modificar el animal.');
      });
    },
  });
  function base64ToFile(base64String, fileName) {
    // Divide la cadena base64 en dos partes: el tipo de contenido y los datos
    const arr = base64String.split(',');
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
  const handleFileChange = (event) => {
    setLoadingImage(true); // Inicia la carga
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageFile(e.target.result);
        validateImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
    // Validar la imagen con el modelo de Teachable Machine
    const validateImage = async (imageSrc) => {
      if (TeacheableMachineInstance.getModel() && imageSrc) {
        const imgElement = document.createElement("img");
        imgElement.src = imageSrc;
        imgElement.onload = async () => {
          const prediction = await TeacheableMachineInstance.getModel().predict(imgElement);
          // Filtra solo las predicciones con más de 0% de probabilidad
          var razaS = [];
          var razaSS = "";
          prediction.forEach((pred) => {
            var prob = Math.round(pred.probability * 100);
            if (prob > 0) {
              var razaInCatalogo = catalogoRazas.find(r=>r.nombre===pred.className);
              razaS.push({
                nombre:pred.className,
                probabilidad: prob,
                id:razaInCatalogo !== null && razaInCatalogo !== undefined ? razaInCatalogo.id : 0
              });
              razaSS += (razaSS !== "" ? ", " : "") + pred.className;
            }
          });
  
          // Muestra las predicciones filtradas
          // filteredPredictions.forEach((prediction) => {
          //   console.log(
          //     `${prediction.className}: ${Math.round(
          //       prediction.probability * 100
          //     )}%`
          //   );
          // });
          // setPredictions(filteredPredictions);
          setRaza(razaS);
          setRazaString(razaSS);
          formik.setFieldValue('raza', razaSS);
          setLoadingImage(false);
        };
      }
    };
  return (
    <Container className="mt-4">
      <h4>Modificar Animal</h4>
      {!loadingAnimal ? (
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
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.description}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="edad" className="mt-3">
            <Form.Label>Edad</Form.Label>
            <Form.Control
              as="input"
              type='number'
              rows={3}
              placeholder="Edad"
              value={formik.values.edad}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.edad && formik.errors.edad}
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
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.raza}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="ubicacion" className="mt-3">
            <Form.Label>Ubicación</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ubicación"
              value={formik.values.ubicacion}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.ubicacion && formik.errors.ubicacion}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.ubicacion}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="tamano" className="mt-3">
            <Form.Label>Tamaño</Form.Label>
            <Form.Select
              value={formik.values.tamano}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.tamano && formik.errors.tamano}
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
              type="tel"
              placeholder="Teléfono"
              value={formik.values.contacto}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.contacto && formik.errors.contacto}
              inputMode="numeric"
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.contacto}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="estadoAdopcion" className="mt-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              value={formik.values.estadoAdopcion}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.estadoAdopcion && formik.errors.estadoAdopcion}
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

          <Form.Group controlId="foto" className="mt-3">
            <Form.Label>Selecciona una nueva imagen (opcional):</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          <Form.Control.Feedback type="invalid">
            {formik.errors.image}
          </Form.Control.Feedback>
          </Form.Group>
          {imageFile && <img src={imageFile} alt="Uploaded" style={{ marginTop: '20px', maxWidth: '300px' }} />}
        {/* {predictions.length > 0 && (
          <div id="label-container" style={{ marginTop: '20px' }}>
            {predictions.map((prediction, index) => (
              <div key={index}>
                {prediction.className}: {prediction.probability.toFixed(2)}
              </div>
            ))}
          </div>
        )} */}
        {loadingImage && (
  <LoaderComponent/>
        )}
        <Button variant="primary" type="submit" className="mt-3" disabled={loadingAnimal || loadingImage || !formik.dirty || formik.isSubmitting}>
          Modificar
        </Button>
        </Form>
      ) : (
        <LoaderComponent />
      )}
      <ToastContainer />
    </Container>
  );
}

export default ModificarAnimal;
