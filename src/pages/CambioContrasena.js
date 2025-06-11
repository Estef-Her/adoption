import React, { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useFormik } from "formik";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import LoaderComponent from "components/Loader";
import { URL_SERVICIO } from "Clases/Constantes";
import LoadingModal from "../LoadingModal";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const validationSchema = yup.object().shape({
  nuevaContrasena: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La nueva contraseña es requerida"),
  actualContrasena: yup.string().required("La contraseña actual es requerida"),
  email: yup
    .string()
    .email("Correo electrónico inválido")
    .required("El correo electrónico es requerido"),
});

function CambioContrasena() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate(); // Reemplazamos useHistory por useNavigate
  const [modCargado, setModCargado] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const formikRestablecer = useFormik({
    initialValues: {
      nuevaContrasena: "",
      actualContrasena: "",
      email: user.email,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setModCargado(true);
        // Realizar la solicitud para cambiar la contraseña
        const response = await axios.post(
          URL_SERVICIO + "cambiar-contrasena",
          {
            actualContrasena: values.actualContrasena,
            nuevaContrasena: values.nuevaContrasena,
            email: user.email,
          },
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        setError("");
        setMessage(
          response.data.error == false
            ? response.data.message || "Contraseña establecida con éxito."
            : ""
        );
        setError(response.data.error == true ? response.data.message : "");
        // Redirigir al login
        if (response.data.error != true)
          setTimeout(() => navigate("/cuenta"), 3000); // Usamos navigate en lugar de useHistory
        setIsLoading(false);
        setTimeout(() => {
          setModCargado(false);
        }, 500);
      } catch (error) {
        setMessage("");
        setError(
          "Error al restablecer la contraseña. Por favor, intenta de nuevo."
        );
        setIsLoading(false);
        setModCargado(false);
      }
    },
  });

  return isLoading ? (
    <LoaderComponent />
  ) : (
    <Container className="password-recovery-container">
      <LoadingModal visible={modCargado} />
      <h3>Cambio de contraseña</h3>

      {/* Mensajes de éxito o error */}
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={formikRestablecer.handleSubmit}>
        <Form.Group controlId="actualContrasena">
          <Form.Label>Su contraseña actual</Form.Label>
          <div style={{ position: "relative" }}>
            <Form.Control
              type={showPassword1 ? "text" : "password"}
              name="actualContrasena"
              placeholder="Ingresa tu contraseña actual"
              value={formikRestablecer.values.actualContrasena}
              onChange={formikRestablecer.handleChange}
              onBlur={formikRestablecer.handleBlur}
              isInvalid={
                formikRestablecer.touched.actualContrasena &&
                formikRestablecer.errors.actualContrasena
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword1(!showPassword1)}
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
              {showPassword1 ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <Form.Control.Feedback type="invalid">
            {formikRestablecer.errors.actualContrasena}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="nuevaContrasena">
          <Form.Label>Nueva Contraseña</Form.Label>
          <div style={{ position: "relative" }}>
            <Form.Control
              type={showPassword2 ? "text" : "password"}
              name="nuevaContrasena"
              placeholder="Ingresa tu nueva contraseña"
              value={formikRestablecer.values.nuevaContrasena}
              onChange={formikRestablecer.handleChange}
              onBlur={formikRestablecer.handleBlur}
              isInvalid={
                formikRestablecer.touched.nuevaContrasena &&
                formikRestablecer.errors.nuevaContrasena
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword2(!showPassword2)}
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
              {showPassword2 ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <Form.Control.Feedback type="invalid">
            {formikRestablecer.errors.nuevaContrasena}
          </Form.Control.Feedback>
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Cambiar Contraseña
        </Button>
      </Form>

      {/* Link para regresar al login */}
    </Container>
  );
}

export default CambioContrasena;
