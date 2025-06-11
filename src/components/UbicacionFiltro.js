// src/components/UbicacionFiltro.js
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import ubicacionData from "../data/ubicacionData.json";

const UbicacionFiltro = ({
  selectedProvincia,
  selectedCanton,
  selectedDistrito,
  setSelectedProvincia,
  setSelectedCanton,
  setSelectedDistrito,
  changeProvincia,
  changeCanton,
  changeDistrito,
  modCargado,
}) => {
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [distritos, setDistritos] = useState([]);

  useEffect(() => {
    setProvincias(Object.keys(ubicacionData));
  }, []);

  useEffect(() => {
    if (selectedProvincia) {
      const nuevosCantones = Object.keys(ubicacionData[selectedProvincia]);
      setCantones(nuevosCantones);

      if (!nuevosCantones.includes(selectedCanton)) {
        setSelectedCanton("");
        setSelectedDistrito("");
        setDistritos([]);
      }
    } else {
      setCantones([]);
      setDistritos([]);
    }
  }, [selectedProvincia]);

  useEffect(() => {
    if (selectedProvincia && selectedCanton) {
      const nuevosDistritos = ubicacionData[selectedProvincia][selectedCanton];
      setDistritos(nuevosDistritos);

      if (!nuevosDistritos.includes(selectedDistrito)) {
        setSelectedDistrito("");
      }
    } else {
      setDistritos([]);
    }
  }, [selectedCanton]);

  return (
    <>
      <div className="flex-grow-1">
        <Form.Label className="fw-bold">Provincia</Form.Label>
        <Form.Control
          as="select"
          value={selectedProvincia}
          onChange={changeProvincia}
          className="form-select"
        >
          <option value="">Seleccione una provincia</option>
          {provincias.map((provincia) => (
            <option key={provincia} value={provincia}>
              {provincia}
            </option>
          ))}
        </Form.Control>
      </div>

      <div className="flex-grow-1">
        <Form.Label className="fw-bold">Cantón</Form.Label>
        <Form.Control
          className="form-select"
          as="select"
          name="canton"
          value={selectedCanton}
          onChange={changeCanton}
          disabled={modCargado || !selectedProvincia}
        >
          <option value="">Seleccione un cantón</option>
          {cantones.map((canton) => (
            <option key={canton} value={canton}>
              {canton}
            </option>
          ))}
        </Form.Control>
      </div>

      <div className="flex-grow-1">
        <Form.Label className="fw-bold">Distrito</Form.Label>
        <Form.Control
          className="form-select"
          as="select"
          name="distrito"
          value={selectedDistrito}
          onChange={changeDistrito}
          disabled={modCargado || !selectedCanton}
        >
          <option value="">Seleccione un distrito</option>
          {distritos.map((distrito) => (
            <option key={distrito} value={distrito}>
              {distrito}
            </option>
          ))}
        </Form.Control>
      </div>
    </>
  );
};

export default UbicacionFiltro;
