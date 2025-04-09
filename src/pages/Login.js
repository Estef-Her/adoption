import React, { useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../images/logo.png';
import { GOOGLE_CLIENT_ID,FACEBOOK_CLIENT_ID } from 'Clases/Constantes';
import { GoogleLogin } from 'react-google-login';
import { URL_SERVICIO } from 'Clases/Constantes';

// Esquema de validación de Yup
const validationSchema = yup.object().shape({
  email: yup.string().email('Correo electrónico inválido').required('El correo electrónico es requerido'),
  password: yup.string().required('La contraseña es requerida'),
});

function Login({ setIsAuthenticated }) {
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
const [user, setUser]=React.useState(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await axios.post(URL_SERVICIO + 'login', values);
        const { token, user } = response.data; // Supongamos que el backend devuelve un token y los detalles del usuario
        localStorage.setItem('tokenn', token);
        localStorage.setItem('user', JSON.stringify(user));
        setIsAuthenticated(true);
        // Si el login es exitoso, redirige o guarda el token
        console.log(response.data); // Aquí podrías guardar un token o manejar la respuesta como necesites
        navigate('/'); // Redirigir al usuario al dashboard o a la página deseada
      } catch (error) {
        setIsAuthenticated(false);
        setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      }
    },
  });

  const handleGoogleLoginSuccess = async (response) => {
    console.log('Google login success', response);
    const { tokenId } = response;

    // Enviar el token de Google al backend para su validación
    try {
      const res = await axios.post(URL_SERVICIO + 'auth/google', { token: tokenId });
      const { token, user } = res.data;
      localStorage.setItem('tokenn', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      navigate('/'); // Redirigir al dashboard
    } catch (error) {
      setError('Error al autenticar con Google');
    }
  };

  const handleGoogleLoginFailure = (response) => {
    console.error('Google login failed', response);
    setError('Error al iniciar sesión con Google');
  };

  // // Manejo de inicio de sesión con Facebook
  // useEffect(() => {
  //   window.fbAsyncInit = function () {
  //     window.FB.init({
  //       appId: FACEBOOK_CLIENT_ID,
  //       cookie: true,
  //       xfbml: true,
  //       version: 'v14.0',
  //     });
  //   };
  // }, []);

  // const handleFacebookLogin = () => {
  //   window.FB.login(
  //     (response) => {
  //       if (response.status === 'connected') {
  //         setUser({ accessToken: response.authResponse.accessToken, platform: 'Facebook' });
  //         setIsAuthenticated(true);
  //       } else {
  //         console.log('Facebook login failed', response);
  //       }
  //     },
  //     { scope: 'public_profile,email' }
  //   );
  // };

  return (
    <Container className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="app-logo" />
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={formik.handleSubmit}>
          <Form.Group controlId="email">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Correo Electrónico"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.email && formik.errors.email}
              className="form-input"
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="password" className="mt-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Contraseña"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.password && formik.errors.password}
              className="form-input"
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-3 login-button">
            Iniciar sesión
          </Button>
          <p className="mt-3 text-center">
            ¿No tienes una cuenta? <Link className="aCuenta" to="/registro">Crear cuenta</Link>
          </p>
          <p className="mt-3 text-center">
            <Link className="aCuenta" to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
          </p>
        </Form>
      </div>
    </Container>
  );
}

export default Login;
