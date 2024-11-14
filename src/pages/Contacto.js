// src/pages/AccountDetails.js
import React from 'react';
import Modal from 'react-modal';
import { NOMBRE_SITIO} from '../Clases/Constantes';

const Contacto = ({ animalC, modalIsOpen, closeModal }) => {
  console.log(animalC);
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Contact Modal"
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #ccc',
          boxShadow: '0px 5px 15px rgba(0,0,0,0.3)',
          width: '400px', // Ancho del modal
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <h2 className="modalTitle">Información de Contacto</h2>
      <div className="infoContainer">
        <div className="infoField">
          <strong>Telefono:</strong> <span>{animalC?.contacto}</span>
        </div>
        <div className="infoField">
        <strong>Contactar:</strong><button
  aria-label="Chat on WhatsApp"
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => window.open(`https://wa.me/506${animalC?.contacto}?text=${encodeURIComponent(`Hola, vi su publicación de ${animalC?.nombre} en el sitio ${NOMBRE_SITIO}. ¿Podrían darme más información sobre el proceso de adopción? ¡Gracias!`)}`, '_blank')}
  style={{
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#25D366', // Color de fondo de WhatsApp
    color: 'white',
    border: 'none',
    padding: '5px 5px',
    borderRadius: '5px',
    cursor: 'pointer',
  }}
><img
    alt="Abrir conversación de WhatsApp"
    style={{ width: 40, marginLeft: '10px', marginTop:0}}
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/479px-WhatsApp.svg.png"
  />
</button>

        </div>
        <br></br>
      </div>
      <button onClick={closeModal} className="closeButton">Cerrar</button>
    </Modal>
  );
};

export default Contacto;
