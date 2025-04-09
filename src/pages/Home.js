import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Container, Row, Col ,Form } from 'react-bootstrap';
import Perro from 'Clases/entidades/perro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye,faMessage,faSpinner,faClose, faFilter, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import logo from '../images/logo.png';
import Modal from 'react-modal';
import Contacto from './Contacto';
import {OPCIONES_TAMANO,OPCIONES_ESTADO} from '../Clases/Constantes'
import { URL_SERVICIO } from 'Clases/Constantes';

function Home({ searchTerm, searchImg}) {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [animalC, setAnimalC] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5); // Inicialmente muestra 10
  const [incremento, setIncremento] = useState(10); // Inicialmente muestra 10
  const [selectedSize, setSelectedSize] = useState('0');
  const [selectedState, setSelectedState] = useState('0');
  const [comboTamano, setComboTamano] = useState([]);
  const [comboEstado, setComboEstado] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const openModal = (animalR) => {
    setAnimalC(animalR);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  useEffect(() => {
    axios.get(URL_SERVICIO + 'animals')
      .then(response => {
        setAnimals(response.data);
        setFilteredAnimals(response.data);
        setComboEstado(OPCIONES_ESTADO);
        setComboTamano(OPCIONES_TAMANO);
      })
      .catch(error => console.error(error));
  }, []);
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + incremento); // Incrementa de 10 en 10
  };
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 50 // 50px antes del final
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredAnimals, visibleCount]);
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
  const cambioComboEstado = (value) => {
    var tam=selectedSize;
    var est=value;

    setSelectedState(est); // Actualiza el estado de selectedState
    const filtro = animals.filter(animal => 
    {
      var condicion = true;
      condicion = tam!=="0" && est !=="0" ? (animal.estadoAdopcion.toString() === est && animal.tamano.toString() === tam) : 
      tam!=="0" && est ==="0" ? (animal.tamano.toString() === tam) :
      tam==="0" && est !=="0" ? (animal.estadoAdopcion.toString() === est) : true;
      return condicion;
    }
    );
    setFilteredAnimals(filtro);
  };
  
  const cambioComboTamano = (value) => {
    var tam=value;
    var est=selectedState;

    setSelectedSize(tam); // Actualiza el estado de selectedState
    const filtro = animals.filter(animal => 
    {
      var condicion = true;
      condicion = tam!=="0" && est !=="0" ? (animal.estadoAdopcion.toString() === est && animal.tamano.toString() === tam) : 
      tam!=="0" && est ==="0" ? (animal.tamano.toString() === tam) :
      tam==="0" && est !=="0" ? (animal.estadoAdopcion.toString() === est) : true;
      return condicion;
    }
    );
    setFilteredAnimals(filtro);
  };
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
    <Container style={{ padding: 15}} fluid className="container-custom">
<Row className="mt-4">
      <Col md={12} className="bg-light p-3 rounded shadow-sm">
        {/* Header con el botón para mostrar/ocultar */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Filtros</h5>
          <Button
            variant="link"
            onClick={() => setShowFilters(!showFilters)}
            className="text-decoration-none"
          >
            <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} />{" "}
            {showFilters ? "Ocultar" : "Mostrar"}
          </Button>
        </div>

        {/* Contenido de los filtros */}
        {showFilters && (
          <>
            {/* Botón para borrar filtros */}
            {(selectedSize !== "0" || selectedState !== "0") && (
              <Button
                variant="secondary"
                className="mb-3"
                onClick={() => {
                  setSelectedSize("0");
                  setSelectedState("0");
                  setFilteredAnimals(animals); // Restablece la lista completa
                }}
              >
                Borrar Todo{" "}
                <FontAwesomeIcon
                  icon={faClose}
                  style={{ color: "white", marginLeft: 5 }}
                />
              </Button>
            )}

            {/* Controles de filtros en fila */}
            <Form>
              <div className="d-flex flex-wrap gap-3">
                <div className="flex-grow-1">
                  <Form.Label className="fw-bold">Tamaño</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedSize}
                    onChange={(e) => {
                      console.log("Cambio Tamaño", e.target.value);  // Verifica si se ejecuta el evento
                      cambioComboTamano(e.target.value);
                    }}
                    className="form-select"
                  >
                    {comboTamano.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Control>
                </div>

                <div className="flex-grow-1">
                  <Form.Label className="fw-bold">Estado</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedState}
                    onChange={(e) => {
                      console.log("Cambio Estado", e.target.value);  // Verifica si se ejecuta el evento
                      cambioComboEstado(e.target.value);
                    }}
                    className="form-select"
                  >
                    {comboEstado.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Control>
                </div>
              </div>
            </Form>
          </>
        )}
      </Col>
    </Row>
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
                <Card.Text className="animal-description">
  {animal.descripcion.length > 30 
    ? animal.descripcion.slice(0, 30) + "..." 
    : animal.descripcion}
</Card.Text>
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
      {visibleCount < filteredAnimals.length && (
      <div className="text-center mt-4">
        <Button onClick={handleLoadMore} variant="secondary">
          <FontAwesomeIcon icon={faSpinner} style={{ color: 'white' }} /> Cargar más
        </Button>
      </div>
    )}
    <Contacto
      animalC={animalC}
      modalIsOpen={modalIsOpen}
      closeModal={closeModal}
    />
  </Container>
  );
}
export default Home;
