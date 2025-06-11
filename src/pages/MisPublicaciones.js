import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2'; // Para las alertas emergentes
import { URL_SERVICIO } from 'Clases/Constantes';
import { useParams } from 'react-router-dom';
import LoadingModal from '../LoadingModal'

function MisPublicaciones() {
  const { id } = useParams();
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [modCargado, setModCargado] = useState(false);  

  useEffect(() => {
    setModCargado(true);
    const user = JSON.parse(localStorage.getItem('user'));
    var ide=id!=null && id != "0"? id : user.id;
    axios.get(URL_SERVICIO+`animalsPorUsuario/${ide}`,{
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }})
      .then(response => {
        setAnimals(response.data);
        setFilteredAnimals(response.data);
        setModCargado(false);
      })
      .catch(error => {
        console.error(error);
        setModCargado(false);
      });
  }, []);
  const handleDelete = (animalId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás recuperar este registro!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'var(--secundary-color)',
      confirmButtonText: 'Sí, eliminarlo!',
      cancelButtonText:'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setModCargado(true);
        axios.delete(`${URL_SERVICIO}animals/${animalId}`,{
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }})
          .then(() => {
            setAnimals(animals.filter(animal => animal.id !== animalId));
            setFilteredAnimals(filteredAnimals.filter(animal => animal.id !== animalId));
            Swal.fire('Eliminado!', 'Tu publicación ha sido eliminada.', 'success');
            setModCargado(false);
          })
          .catch(error => {
            console.error('Error eliminando la publicación:', error);
            Swal.fire('Error!', 'No se pudo eliminar la publicación.', 'error');
            setModCargado(false);
          });
      }
    });
  };
  return (
    <Container className="mt-4">
      <LoadingModal visible={modCargado} />
     <h4>Mis publicaciones</h4>
      <Row className="mt-4">
        {filteredAnimals.map(animal => (
          <Col md={4} key={animal.id}>
          <Card className="animal-card mb-4">
            <div className="card-img-wrapper">
              <Card.Img 
                variant="top" 
                src={animal.foto}
                alt={animal.nombre}
                className="card-img"
              />
            </div>
            <Card.Body>
              <Card.Title className="animal-title">{animal.nombre}</Card.Title>
              <Card.Text className="animal-description">{animal.descripcion}</Card.Text>
              <Card.Text className="animal-breed">
                Raza: {animal.razas.length > 0 ? animal.razas.map(raza => raza.nombre).join(', ') : "Raza no asignada"}
              </Card.Text>
              <div className="button-group">
                <Button as={Link} to={`/modificarAnimal/${animal.id}`} variant="success">
                {/* <FontAwesomeIcon icon={faEye}  style={{color:'white'}}/> Icono para cargar imagenVer detalle */}
                Modificar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(animal.id)}>
                  {/* <FontAwesomeIcon icon={faMessage}  style={{color:'white'}}/> Icono para cargar imagenContactar */}
                  Eliminar
                  </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        
        ))}
      </Row>
      {filteredAnimals.length===0 && 
      <div>No hay registros</div>}
    </Container>
  );
}

export default MisPublicaciones;
