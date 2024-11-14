// src/pages/AccountDetails.js
import React from 'react';

function Cuenta() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="account-details-container">
      <h2 className="text-center login-title">Mi cuenta</h2>
      {user ? (
        <>
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Telefono:</strong> {user.phone}</p>
        </>
      ) : (
        <p>No se encontraron detalles de la cuenta. Por favor, inicie sesión nuevamente.</p>
      )}
    </div>
  );
}

export default Cuenta;
