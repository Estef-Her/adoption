// src/components/UbicacionForm.js
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import ubicacionData from '../data/ubicacionData.json';

const UbicacionForm = ({ formik, modCargado }) => {
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [distritos, setDistritos] = useState([]);

  useEffect(() => {
    setProvincias(Object.keys(ubicacionData));
  }, []);

useEffect(() => {
  if (formik.values.provincia) {
    const nuevosCantones = Object.keys(ubicacionData[formik.values.provincia]);
    setCantones(nuevosCantones);

    if (!nuevosCantones.includes(formik.values.canton)) {
      formik.setFieldValue('canton', '');
      formik.setFieldValue('distrito', '');
      setDistritos([]);
    }
  } else {
    setCantones([]);
    setDistritos([]);
  }
}, [formik.values.provincia]);

useEffect(() => {
  if (formik.values.provincia && formik.values.canton) {
    const nuevosDistritos = ubicacionData[formik.values.provincia][formik.values.canton];
    setDistritos(nuevosDistritos);

    if (!nuevosDistritos.includes(formik.values.distrito)) {
      formik.setFieldValue('distrito', '');
    }
  } else {
    setDistritos([]);
  }
}, [formik.values.canton]);


  return (
    <>
      <Form.Group controlId="provincia" className="mt-3">
        <Form.Label>Provincia</Form.Label>
        <Form.Control
          as="select"
          name="provincia"
          value={formik.values.provincia}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          isInvalid={formik.touched.provincia && formik.errors.provincia}
          disabled={modCargado}
        >
          <option value="">Seleccione una provincia</option>
          {provincias.map((provincia) => (
            <option key={provincia} value={provincia}>
              {provincia}
            </option>
          ))}
        </Form.Control>
        <Form.Control.Feedback type="invalid">
          {formik.errors.provincia}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group controlId="canton" className="mt-3">
        <Form.Label>Cantón</Form.Label>
        <Form.Control
          as="select"
          name="canton"
          value={formik.values.canton}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          isInvalid={formik.touched.canton && formik.errors.canton}
          disabled={modCargado || !formik.values.provincia}
        >
          <option value="">Seleccione un cantón</option>
          {cantones.map((canton) => (
            <option key={canton} value={canton}>
              {canton}
            </option>
          ))}
        </Form.Control>
        <Form.Control.Feedback type="invalid">
          {formik.errors.canton}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group controlId="distrito" className="mt-3">
        <Form.Label>Distrito</Form.Label>
        <Form.Control
          as="select"
          name="distrito"
          value={formik.values.distrito}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          isInvalid={formik.touched.distrito && formik.errors.distrito}
          disabled={modCargado || !formik.values.canton}
        >
          <option value="">Seleccione un distrito</option>
          {distritos.map((distrito) => (
            <option key={distrito} value={distrito}>
              {distrito}
            </option>
          ))}
        </Form.Control>
        <Form.Control.Feedback type="invalid">
          {formik.errors.distrito}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group controlId="direccionExacta" className="mt-3">
        <Form.Label>Dirección exacta</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ej: 200 metros oeste de la iglesia"
          name="direccionExacta"
          value={formik.values.direccionExacta}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          isInvalid={formik.touched.direccionExacta && formik.errors.direccionExacta}
          disabled={modCargado}
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.direccionExacta}
        </Form.Control.Feedback>
      </Form.Group>
    </>
  );
};

export default UbicacionForm;
