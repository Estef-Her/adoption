import React from 'react';
import './LoadingModal.css'; // O usa Tailwind/CSS-in-JS
import { Spinner } from "react-bootstrap";

const LoadingModal = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="loading-overlay">
      <div className="loading-content">
       <div style={{ textAlign: "center" }}>
             <Spinner animation="border" role="status" className="spinn">
               <span className="visually-hidden">Procesando...</span>
             </Spinner>
             <p>Cargando...</p>
           </div>
      </div>
    </div>
  );
};

export default LoadingModal;
