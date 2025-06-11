// src/constants.js

// URLs y configuraciones de API
export const NOMBRE_SITIO ="Encuentra a tu amigo";
export const API_BASE_URL = "https://axios.ejemplo.com";
export const WHATSAPP_BASE_URL = "https://wa.me/";
export const GOOGLE_CLIENT_ID = "617032070306-9rtq6s4vc3uhp66lv3fdhf1qvg6dv2jd.apps.googleusercontent.com";
export const FACEBOOK_CLIENT_ID = "";
//export const URL_SERVICIO="http://localhost:4000/";
export const URL_SERVICIO="https://literate-certainly-polliwog.ngrok-free.app/";
// export const URL_SERVICIO="http://190.113.103.97:4000/";

// Mensajes predeterminados
export const MESSAGES = {
  adoptionInquiry: "Hola, estoy interesado en adoptar a este perro. ¿Podrían darme más información?",
  generalGreeting: "¡Hola! Estoy interesado en saber más.",
};

// Configuraciones generales
export const DEFAULT_IMAGE_SIZE = 250;
export const MODAL_STYLES = {
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
    width: '400px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

export const OPCIONES_TAMANO = [
  { value: "0", label: "Seleccione un tamaño" },
  { value: "1", label: "Pequeño" },
  { value: "2", label: "Mediano" },
  { value: "3", label: "Grande" },
  { value: "4", label: "Muy Grande" },
];
export const OPCIONES_ESTADO = [
  { value: "0", label: "Seleccione el estado" },
  { value: "1", label: "En adopción" },
  { value: "2", label: "Adoptado" },
  { value: "3", label: "Perdido" },
  { value: "4", label: "Encontrado" },
];
