import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import Perro from 'Clases/entidades/perro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye,faMessage } from '@fortawesome/free-solid-svg-icons';
import logo from '../images/logo.png';
import Modal from 'react-modal';
import Contacto from './Contacto';

function Home({ searchTerm, searchImg}) {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [animalC, setAnimalC] = useState(null);
  Modal.setAppElement('#root');
  const openModal = (animalR) => {
    setAnimalC(animalR);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  useEffect(() => {
    axios.get('http://localhost:4000/animals')
      .then(response => {
        setAnimals(response.data);
        setFilteredAnimals(response.data);
      })
      .catch(error => console.error(error));
  }, []);
  // useEffect(() => {
  //   if (searchTerm === '') {
  //     setFilteredAnimals(animals);
  //   } else {
  //     var filtered = [];
  //     // if(isTermImg){
  //     //   var s = searchTerm.toString();
  //     //   s= s.replace(' ','');
  //     //   const breedsArray = s.split(',');
  //     //   breedsArray.forEach(element => {
  //     //     var nw = animals.filter(animal=>animal.raza.toLowerCase().includes(element));
  //     //     filtered.push(...nw);
  //     //   });
  //     // }
  //      filtered.push(...animals.filter(animal =>
  //       animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       animal.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
  //       animal.raza.toLowerCase().includes(searchTerm.toLowerCase())
  //     ));
  //     filtered = filtered.filter((item, index) => {
  //       return filtered.indexOf(item) === index;
  //   });
  //     setFilteredAnimals(filtered);
  //   }
  // }, [searchTerm, animals]);
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredAnimals(animals);
    } else if(searchTerm.length>0) {
      const filtered = animals.filter(animal =>
        animal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAnimals(filtered);
    }
    if(searchImg){
      console.log(searchImg);
      const filtered = animals.filter(animal => 
        animal.razas && animal.razas.length > 0 && 
        animal.razas.some(raza => 
          searchImg.some(imgRaza => {
            const razaProb = parseFloat(raza.probabilidad);
            const imgRazaProb = parseFloat(imgRaza.probabilidad);
            const rango = imgRazaProb * 0.2; // Calcula el 20% del valor
            return raza.nombre === imgRaza.nombre && 
                   razaProb >= (imgRazaProb - rango) && 
                   razaProb <= (imgRazaProb + rango); // Verifica si está dentro del rango
          })
        )
      );
      setFilteredAnimals(filtered);
    }
  }, [searchTerm,searchImg, animals]);

  return (
<Container>
      <Row className="mt-4">
        {filteredAnimals.map(animal => (
          <Col md={4} key={animal.id}>
            <Card className="animal-card mb-4">
              <div className="card-header">
                {/* <img src={animal.avatar || logo} alt={animal.nombreUsuario} className="avatar" /> */}
                <div className="user-info">
                  <h5 className="user-name">{animal.nombreUsuario}</h5>
                </div>
              </div>
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
                  {animal.estadoAdopcion === 1 ? "En adopción" : animal.estadoAdopcion === 2 ? "Adoptado" : animal.estadoAdopcion === 3 ? "Perdido" : animal.estadoAdopcion === 4 ? "Encontrado" : ""}
                </Card.Text>
                <Card.Text className="animal-breed">
                  Raza: {animal.razas.length > 0 ? animal.razas.map(raza => raza.nombre).join(', ') : "Raza no asignada"}
                </Card.Text>
                <div className="button-group">
                  <Button as={Link} to={`/animal/${animal.id}`} variant="primary">
                  {/* <FontAwesomeIcon icon={faEye}  style={{color:'white'}}/> Icono para cargar imagenVer detalle */}
                  Ver detalle
                  </Button>
                  <Button variant="secondary" onClick={()=>openModal(animal)}>
                    {/* <FontAwesomeIcon icon={faMessage}  style={{color:'white'}}/> Icono para cargar imagenContactar */}
                    Contactar
                    </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Contacto
        animalC={animalC}
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
      />
    </Container>
  );
}
export default Home;
