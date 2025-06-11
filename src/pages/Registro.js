import React, { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { URL_SERVICIO } from "Clases/Constantes";
import LoadingModal from "../LoadingModal";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Esquema de validación de Yup
const validationSchema = yup.object().shape({
  nombre: yup.string().required("El nombre es requerido"),
  telefono: yup.string().required("El teléfono es requerido"),
  correo: yup
    .string()
    .email("Correo electrónico inválido")
    .required("El correo electrónico es requerido"),
  contrasena: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("La contraseña es requerida"),
});

function Registro() {
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const navigate = useNavigate();
  const [loader, setLoader] = React.useState(false);
  const [modCargado, setModCargado] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      nombre: "",
      telefono: "",
      correo: "",
      contrasena: "",
      rol: 2,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoader(true);
        setModCargado(true);
        const response = await axios.post(
          URL_SERVICIO + "registroUsuario",
          values,
          {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
          }
        );
        if (response.status === 201) {
          setLoader(false);
          setMensajeExito(
            "Cuenta creada exitosamente. Redirigiendo al login..."
          );
          setModCargado(false);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } catch (error) {
        setLoader(false);
        setError("Error al crear la cuenta. Por favor, intenta de nuevo.");
        setModCargado(false);
      }
    },
  });

  return (
    <Container className="login-container" style={{}}>
      <LoadingModal visible={modCargado} />
      <div className="login-box">
        <h2 className="text-center login-title">Crear cuenta</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {mensajeExito && <div style={{ color: "green" }}>{mensajeExito}</div>}
        <LoadingModal visible={loader} />
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

          <Form.Group controlId="contrasena" className="mt-3">
            <Form.Label>Contraseña</Form.Label>
            <div style={{ position: "relative" }}>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={formik.values.contrasena}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={
                  formik.touched.contrasena && formik.errors.contrasena
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6c757d",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <Form.Control.Feedback type="invalid">
              {formik.errors.contrasena}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-3 login-button">
            Crear cuenta
          </Button>
        </Form>
      </div>
    </Container>
  );
}

export default Registro;
