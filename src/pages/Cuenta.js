// src/pages/AccountDetails.js
import React from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {Button} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faKey} from '@fortawesome/free-solid-svg-icons';
function Cuenta() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  return (
    <div className="account-details-container">
      <h2 className="text-center login-title">Mi cuenta</h2>
      {user ? (
        <>
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Rol:</strong> {user.rol.descripcion}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Telefono:</strong> {user.phone}</p>
                    <p className="mt-3 text-center">
                    <Button className='mt-3 text-center' variant="primary" onClick={() => navigate("/cambio-contrasena")}>
  Cambia contraseña <FontAwesomeIcon icon={faKey} style={{ color: 'white' }} />
</Button>
                    </p>
        </>
      ) : (
        <p>No se encontraron detalles de la cuenta. Por favor, inicie sesión nuevamente.</p>
      )}
    </div>
  );
}

export default Cuenta;
//esto es nnc cambio de prueba