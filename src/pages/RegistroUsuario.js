import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { URL_SERVICIO } from 'Clases/Constantes';
import LoadingModal from '../LoadingModal'

// Esquema de validación de Yup
const validationSchema = yup.object().shape({
  nombre: yup.string().required('El nombre es requerido'),
  telefono: yup.string().required('El teléfono es requerido'),
  correo: yup.string().email('Correo electrónico inválido').required('El correo electrónico es requerido'),
  rol: yup.string().required('El rol es requerido'),
});

function RegistroUsuario() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [modCargado, setModCargado] = useState(false);  

  const formik = useFormik({
    initialValues: {
      nombre: '',
      telefono: '',
      correo: '',
      contrasena: '',
      rol:''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setModCargado(true);
        const response = await axios.post(URL_SERVICIO + 'registroUsuario', values,{
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }});
        if (response.status === 201) {
          setModCargado(false);
          navigate('/usuarios'); // Redirigir al usuario al listado de usuarios después de registrar
        }
      } catch (error) {
        setError('Error al crear la cuenta. Por favor, intenta de nuevo.');
        setModCargado(false);
      }
    },
  });

  return (
<Container className="mt-4">
  <LoadingModal visible={modCargado} />
      <h4>Crear usuario</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={formik.handleSubmit}>
        <Form.Group controlId="nombre">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre"
            value={formik.values.nombre}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.nombre && formik.errors.nombre}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.nombre}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="telefono" className="mt-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            placeholder="Teléfono"
            value={formik.values.telefono}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.telefono && formik.errors.telefono}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.telefono}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="correo" className="mt-3">
          <Form.Label>Correo Electrónico</Form.Label>
          <Form.Control
            type="email"
            placeholder="Correo Electrónico"
            value={formik.values.correo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.correo && formik.errors.correo}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.correo}
          </Form.Control.Feedback>
        </Form.Group>

         <Form.Group controlId="rol" className="mt-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    value={formik.values.rol}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.rol && formik.errors.rol}
                  >
                    <option value="0">Seleccione un rol</option>
                    <option value="1">Administrador</option>
                    <option value="2">Usuario</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.rol}
                  </Form.Control.Feedback>
                </Form.Group>
        {/* <Form.Group controlId="contrasena" className="mt-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Contraseña"
            value={formik.values.contrasena}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.contrasena && formik.errors.contrasena}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.contrasena}
          </Form.Control.Feedback>
        </Form.Group> */}

        <Button variant="primary" type="submit" className="mt-3 login-button">
          Crear cuenta
        </Button>
      </Form>
    </Container>
  );
}

export default RegistroUsuario;
