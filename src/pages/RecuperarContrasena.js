import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import LoaderComponent from 'components/Loader';
import { URL_SERVICIO } from 'Clases/Constantes';

const validationSchema = yup.object().shape({
  codigo: yup.string().required('El código es requerido'),
  nuevaContrasena: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La nueva contraseña es requerida'),
});
const validationSchemaEmail = yup.object().shape({
  email: yup.string().email('Correo electrónico inválido').required('El correo electrónico es requerido'),
});

function RecuperarContrasena() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false); // Para saber si mostrar el formulario de restablecimiento
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const navigate = useNavigate();  // Reemplazamos useHistory por useNavigate

  const formikEmail = useFormik({
    initialValues: { email: '' },
    validationSchema: validationSchemaEmail,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        console.log("Entro a submit");
        // Realizar una solicitud POST al backend para la recuperación de contraseña
        const response = await axios.post(URL_SERVICIO + 'solicitar-restablecer', { email: values.email },{
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }});
        setMessage(response.data.error==false ? response.data.message || 'Se ha enviado un enlace de recuperación a tu correo electrónico.':'');
        setEmail(values.email);
        setError(response.data.error==true ? response.data.message:'');
        if(response.data.error != true)setIsResetting(true); // Ahora se muestra el formulario para restablecer la contraseña
        setIsLoading(false);
      } catch (error) {
        setMessage('');
        setError('No se pudo enviar el enlace de recuperación. Por favor, intenta de nuevo.');
        setIsLoading(false);
      }
    },
  });

  const formikRestablecer = useFormik({
    initialValues: { codigo: '', nuevaContrasena: '' },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        // Realizar la solicitud para restablecer la contraseña
        const response = await axios.post(URL_SERVICIO + 'restablecer-contrasena', {
          codigo: values.codigo,
          nuevaContrasena: values.nuevaContrasena,
          email:email
        },{
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }});
        setError('');
        setMessage(response.data.error==false ? response.data.message || 'Contraseña establecida con éxito.':'');
        setError(response.data.error==true ? response.data.message:'');
        // Redirigir al login
        if(response.data.error != true)setTimeout(() => navigate('/login'), 3000); // Usamos navigate en lugar de useHistory
        setIsLoading(false);
      } catch (error) {
        setMessage('');
        setError('Error al restablecer la contraseña. Por favor, intenta de nuevo.');
        setIsLoading(false);
      }
    },
  });

  return (
    isLoading ? <LoaderComponent/> : <Container className="password-recovery-container">
      <h3>Recuperación de Contraseña</h3>

      {/* Mensajes de éxito o error */}
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Formulario para solicitar el enlace de recuperación */}
      {!isResetting ? (
        <Form onSubmit={formikEmail.handleSubmit}>
          <Form.Group controlId="email">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={formikEmail.values.email}
              onChange={formikEmail.handleChange}
              onBlur={formikEmail.handleBlur}
              isInvalid={formikEmail.touched.email && formikEmail.errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {formikEmail.errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">
            Enviar Enlace de Recuperación
          </Button>
        </Form>
      ) : (
        // Formulario para restablecer la contraseña
        <Form onSubmit={formikRestablecer.handleSubmit}>
          <Form.Group controlId="codigo">
            <Form.Label>Código de Recuperación</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el código recibido"
              value={formikRestablecer.values.codigo}
              onChange={formikRestablecer.handleChange}
              onBlur={formikRestablecer.handleBlur}
              isInvalid={formikRestablecer.touched.codigo && formikRestablecer.errors.codigo}
            />
            <Form.Control.Feedback type="invalid">
              {formikRestablecer.errors.codigo}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="nuevaContrasena">
            <Form.Label>Nueva Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingresa tu nueva contraseña"
              value={formikRestablecer.values.nuevaContrasena}
              onChange={formikRestablecer.handleChange}
              onBlur={formikRestablecer.handleBlur}
              isInvalid={formikRestablecer.touched.nuevaContrasena && formikRestablecer.errors.nuevaContrasena}
            />
            <Form.Control.Feedback type="invalid">
              {formikRestablecer.errors.nuevaContrasena}
            </Form.Control.Feedback>
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">
            Restablecer Contraseña
          </Button>
        </Form>
      )}

      {/* Link para regresar al login */}
      {!isResetting && (
        <Link to="/login">
          <Button variant="secondary" className="mt-3">
            Regresar
          </Button>
        </Link>
      )}
    </Container>
  );
}

export default RecuperarContrasena;
