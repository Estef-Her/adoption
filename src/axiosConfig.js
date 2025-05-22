import axios from 'axios';
import { loadingController } from './loadingController';
import { URL_SERVICIO } from 'Clases/Constantes';

const api = axios.create({
  baseURL: URL_SERVICIO, // Cambia esto a tu URL real
});

// Interceptor antes de enviar solicitud
api.interceptors.request.use(
  (config) => {
    loadingController.show(); // Mostrar "Cargando..."
    return config;
  },
  (error) => {
    loadingController.hide(); // En caso de error al enviar
    return Promise.reject(error);
  }
);

// Interceptor cuando se recibe respuesta
api.interceptors.response.use(
  (response) => {
    loadingController.hide(); // Ocultar "Cargando..."
    return response;
  },
  (error) => {
    loadingController.hide(); // En caso de error en la respuesta
    return Promise.reject(error);
  }
);

export default api;
