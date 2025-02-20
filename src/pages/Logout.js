import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { URL_SERVICIO } from 'Clases/Constantes';

function Logout({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('tokenn'); // Asegúrate de que coincida con el nombre correcto

      // Enviar el token como parte de los encabezados en la solicitud
      await axios.post(
        URL_SERVICIO + 'logout', 
        {}, // No necesitas enviar datos en el cuerpo
        { headers: { Authorization: `Bearer ${token}` } } // Enviar el token en los headers
      );

      // Limpiar almacenamiento local después del logout exitoso
      localStorage.removeItem('tokenn');
      localStorage.removeItem('user');

      // Actualizar el estado de autenticación
      setIsAuthenticated(false);

      // Redirigir al usuario
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return null; // Puedes retornar null ya que este componente solo se encarga del logout
}

export default Logout;
