import React, { useEffect, useState } from 'react';
import { useParams,useNavigate  } from 'react-router-dom';
import axios from 'axios';
import { Container, Card,Button  } from 'react-bootstrap';
import { URL_SERVICIO } from 'Clases/Constantes';


function AnimalDetail() {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const navigate = useNavigate(); // Inicializa useNavigate

  useEffect(() => {
    axios.get(URL_SERVICIO +`animals/${id}`,{
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  })
      .then(response => setAnimal(response.data))
      .catch(error => console.error(error));
  }, [id]);

  if (!animal) return <p>Loading...</p>;

  return (
    <Container className="mt-4">
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
          <Card.Text>{animal.descripcion}</Card.Text>
          <Card.Text>{animal.edad} años</Card.Text>
          <Card.Text className="animal-breed">
                  Raza: {animal.razas.length > 0 ? animal.razas.map(raza => raza.nombre).join(', ') : "Raza no asignada"}
                </Card.Text>
          <Card.Text>Contactarse con {animal.contacto}</Card.Text>
          <Card.Text>Publicado por {animal.nombreUsuario}</Card.Text>
          <Button variant="secondary" onClick={() => navigate(-1)} className="mt-3">
            Regresar
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AnimalDetail;
