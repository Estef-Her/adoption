import React, { useState,useEffect,useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Form, FormControl, Button ,Modal,Dropdown  } from 'react-bootstrap';
import { faClose, faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../images/logo.png';
import TeacheableMachine from '../Clases/TeacheableMachine';
import DeteccionImagen from '../Clases/DeteccionImagen';
import LoaderComponent from 'components/Loader';
import { faUser, faSignOutAlt, faUserCircle,faTimes,faTruckLoading } from '@fortawesome/free-solid-svg-icons';
import api from '../axiosConfig';
import { URL_SERVICIO } from 'Clases/Constantes';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


const TeacheableMachineInstance = new TeacheableMachine();
const DeteccionImagenInstance = new DeteccionImagen();

function NavBar({ onSearch , isAuthenticated, onSearchImg}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const imageRef = useRef(null);
  const location = useLocation(); // Obtenemos la ubicación actual
  const [showModal, setShowModal] = useState(false); 
  const [loading, setLoading] = useState(false); 
  const [raza, setRaza] = useState([]); // Estado para la raza
  const [razaString, setRazaString] = useState(''); // Estado para la raza
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [catalogoRazas, setCatalogoRazas] = useState([]); // Estado para la raza
  const [modCargado, setModCargado] = useState(true);  
  const [validationMessage, setValidationMessage] = useState('');

    useEffect(() => {
      const waitForModels = async () => {
        await new Promise((resolve) => {
          const checkModels = () => {
            if (
              TeacheableMachineInstance.getModel() &&
              DeteccionImagenInstance.getModel()
            ) {
              resolve();
            } else {
              // Revisa periódicamente si ya se cargaron los modelos
              const interval = setInterval(() => {
                if (
                  TeacheableMachineInstance.getModel() &&
                  DeteccionImagenInstance.getModel()
                ) {
                  clearInterval(interval);
                  resolve();
                }
              }, 300); // revisa cada 300ms
            }
          };
    
          checkModels();
        });
    
        // Espera un pequeño tiempo adicional (opcional)
        setTimeout(() => {
          setModCargado(false);
        }, 500);
      };
    
      waitForModels();
    }, []);

  useEffect(() => {
    api.get(URL_SERVICIO + 'razas',  {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  })
      .then(response => {
        setCatalogoRazas(response.data);
      })
      .catch(error => console.error(error));
  }, []);
  const handleSearch = (event) => {
    event.preventDefault();
    onSearch(searchTerm);
  };
  const token = localStorage.getItem('tokenn');
  isAuthenticated = !!token;
  const handleModalClose = () => {
    setShowModal(false);
    setImageFile(null);
    onSearchImg(null);
    setRaza([]);
    setRazaString("");
  }
  const handleBuscarPorImagen = (event) => {
    event.preventDefault();
    setSearchTerm("");
    onSearch("");
    setShowModal(false);
    onSearchImg(raza);
  }
  const handleClearFilter = () => {
    setRazaString("");
    setRaza([]); // Vacía el array de searchImg, limpiando los filtros
    setSearchTerm("");
    onSearch("");
    onSearchImg(null);
    setImageFile(null);
  };
  const handleModalShow = () => setShowModal(true);

  const handleFileChange = (event) => {
    setLoading(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setImageFile(imageData);
  
        // Crear imagen temporal solo para detectar carga completa
        const tempImg = new Image();
        tempImg.src = imageData;
        tempImg.onload = () => {
          validateImage(imageData);
        };
      };
      reader.readAsDataURL(file);
    }
  };
    // // Manejar la selección de archivo
    // const handleFileChange = (event) => {
    //   setLoading(true); // Inicia la carga
    //   const file = event.target.files[0];
    //   if (file) {
    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //       setImageFile(e.target.result);
    //       validateImage(e.target.result);
    //     };
    //     reader.readAsDataURL(file);
    //   }else{
    //     setImageFile(null);
    //     setLoading(false);
    //   }
    // };
    // Validar la imagen con el modelo de Teachable Machine
    const validateImage = async (imageSrc) => {
      setLoading(true); // Inicia la carga
      if(DeteccionImagenInstance.getModel() && imageRef.current){
        await new Promise((resolve) => {
          if (imageRef.current.complete) resolve();
          else imageRef.current.onload = resolve;
        });
        const hayPerro = await DeteccionImagenInstance.handlePredict(imageRef.current);
  
        if (!hayPerro) {
          setRaza([]);
          setRazaString("");
          setImageFile(null);           // Limpiar imagen
          imageRef.current = null;      
          setValidationMessage('No se detectó un perro en la imagen. Por favor, suba una imagen válida, o intente probar con una toma diferente.');
          setLoading(false);
          return; // No continuar si no hay perro
        }
      }
      if (TeacheableMachineInstance.getModel() && imageSrc) {
        setValidationMessage("");
        const imgElement = document.createElement("img");
        imgElement.src = imageSrc;
        imgElement.onload = async () => {
          const prediction = await TeacheableMachineInstance.getModel().predict(imgElement);
 
          // Filtra solo las predicciones con más de 0% de probabilidad
          var razaS = [];
          var razaSS = "";
          prediction.forEach((pred) => {
            var prob = Math.round(pred.probability * 100);
            if (prob > 0) {
              var razaInCatalogo = catalogoRazas.find(r=>r.nombre===pred.className);
              razaS.push({
                nombre:pred.className,
                probabilidad: prob,
                id:razaInCatalogo !== null && razaInCatalogo !== undefined ? razaInCatalogo.id : 0
              });
              razaSS += (razaSS !== "" ? ", " : "") + pred.className;
            }
          });

          setRaza(razaS);
          setRazaString(razaSS);

          setLoading(false);
        };
      }
    };
    const handleLogout = () => {
      localStorage.removeItem('tokenn');
      localStorage.removeItem('user');
      navigate('/login'); // Redirigir al login tras cerrar sesión
    };

  return (
    <>
    <Navbar className="custom-navbar" expand="lg">
      <Container>
      <Navbar.Brand as={Link} to="/">
          <img
            src={logo}
            alt="Logo"
            width="50" // Ajusta el tamaño del logo
            height="50"
            style={{margin:0,padding:0}} // Ajusta el tamaño del logo
          />
        </Navbar.Brand>
        <Navbar.Brand as={Link} to="/">
          <h3 style={{marginTop:10}}>Find your friend</h3>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className={location.pathname === '/' ? 'active' : ''}>Inicio</Nav.Link>
            {isAuthenticated && user.rol.id===1 && <Nav.Link as={Link} to="/usuarios" className={location.pathname === '/usuarios' ? 'active' : ''}>Usuarios</Nav.Link>}
            {isAuthenticated && <Nav.Link  as={Link} to="/publicar" className={location.pathname === '/publicar' ? 'active' : ''}>Publicar</Nav.Link>}
            {isAuthenticated && <Nav.Link as={Link} to="/publicaciones/0" className={location.pathname === '/publicaciones' ? 'active' : ''}>Mis publicaciones</Nav.Link>}
            {!isAuthenticated && <Nav.Link as={Link} to="/login" className={location.pathname === '/login' ? 'active' : ''}>Iniciar Sesión</Nav.Link>}
            {!isAuthenticated && <Nav.Link as={Link} to="/registro" className={location.pathname === '/registro' ? 'active' : ''}>Crear cuenta</Nav.Link>}
            {/* {isAuthenticated && <Nav.Link as={Link} to="/logout" className={location.pathname === '/logout' ? 'active' : ''}>Cerrar Sesión</Nav.Link>} */}
          </Nav>
          <Form className="d-flex" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Escriba"
              className="me-2"
              aria-label="Escriba para buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span title={modCargado ? "Se están cargando los elementos necesarios" : ""}>
            <Button
      variant={raza.length > 0 ? "danger" : "light"}
      className="me-2 position-relative"
      disabled={modCargado}
      onClick={raza.length > 0 ? handleClearFilter : handleModalShow}
      style={modCargado ? { pointerEvents: 'none' } : {}}
    >
      <FontAwesomeIcon icon={faImage} style={{ color: 'white' }} />
      {raza.length > 0 && (
        <FontAwesomeIcon
          icon={faTimes}
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            fontSize: '0.7rem',
            color: 'white',
            cursor: 'pointer',
          }}
          onClick={handleClearFilter}
        />
      )}
    </Button>
            </span>
            <Button variant="outline-light" type="submit">Buscar</Button>
          </Form>
          {isAuthenticated && (
            <Dropdown align="end" className="ms-3">
              <Dropdown.Toggle variant="light" id="dropdown-basic" className="user-dropdown">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture} // Si tienes una imagen del usuario
                    alt="User"
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                  />
                ) : (
                  <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: '2rem', color: 'white' }} />
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/cuenta">
                  <FontAwesomeIcon icon={faUser} /> {user?.name || 'Cuenta'}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
    <Modal show={showModal} onHide={handleModalClose}>
    <Modal.Header closeButton>
      <Modal.Title>Selecciona una imagen</Modal.Title>
    </Modal.Header>
    <Modal.Body>
    <Form.Group controlId="imageFile" className="mt-3">
          <Form.Label>Selecciona una imagen:</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </Form.Group>

        {imageFile && <img src={imageFile} ref={imageRef} alt="Uploaded" style={{ marginTop: '20px', maxWidth: '300px' }} />}
         {raza!=="" > 0 && (
          <div id="label-container" style={{ marginTop: '20px' }}>
            <p>{razaString}</p>
          </div>
        )}
        {validationMessage && (
  <p style={{ color: 'red', marginTop: '10px' }}>{validationMessage}</p>
)} 
{loading && (
  <LoaderComponent/>
        )}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleModalClose}>
        Cerrar
      </Button>
      <Button variant="primary" onClick={handleBuscarPorImagen} disabled={!imageFile}>
        Buscar con imagen
      </Button>
    </Modal.Footer>
  </Modal>
  </>
  );
}

export default NavBar;
