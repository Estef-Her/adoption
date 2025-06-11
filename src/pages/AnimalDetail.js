import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Button } from "react-bootstrap";
import { URL_SERVICIO } from "Clases/Constantes";
import LoadingModal from "../LoadingModal";

function AnimalDetail() {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const navigate = useNavigate(); // Inicializa useNavigate
  const [modCargado, setModCargado] = useState(true);

  useEffect(() => {
    setModCargado(true);
    axios
      .get(URL_SERVICIO + `animals/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })
      .then((response) => {
        setAnimal(response.data);
        setTimeout(() => {
          setModCargado(false);
        }, 500);
      })
      .catch((error) => {
        console.error(error);
        setModCargado(false);
      });
  }, [id]);

  if (!animal) return <p>Loading...</p>;

  return (
    <Container className="mt-4">
      <LoadingModal visible={modCargado} />
      <Card className="animal-card-detail">
        <div className="card-img-wrapper-detail">
          <Card.Img
            variant="top"
            src={animal.foto}
            alt={animal.nombre}
            className="card-img-detail"
          />
        </div>
        <Card.Body>
          <Card.Title>{animal.nombre}</Card.Title>
          <Card.Text className="animal-description">
            {animal.descripcion}
          </Card.Text>

          <Card.Text className="animal-age">
            <strong>Edad:</strong> {animal.edad} años
          </Card.Text>

          <Card.Text className="animal-breed">
            <strong>Raza:</strong>{" "}
            {animal.razas.length > 0
              ? animal.razas.map((raza) => raza.nombre).join(", ")
              : "Raza no asignada"}
          </Card.Text>

          <Card.Text className="animal-contacto">
            <strong>Contacto:</strong> {animal.contacto}
          </Card.Text>

          <Card.Text className="animal-usuario">
            <strong>Publicado por:</strong> {animal.nombreUsuario}
          </Card.Text>

          <Card.Text className="animal-ubicacion">
            <strong>Ubicación:</strong> {animal.provincia}, {animal.canton},{" "}
            {animal.distrito}
          </Card.Text>

          <Card.Text className="animal-direccion">
            <strong>Dirección exacta:</strong> {animal.direccion}
          </Card.Text>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="mt-3"
          >
            Regresar
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AnimalDetail;
