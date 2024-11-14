// src/constants.js

// URLs y configuraciones de API
export const NOMBRE_SITIO ="Encuentra a tu amigo";
export const API_BASE_URL = "https://api.ejemplo.com";
export const WHATSAPP_BASE_URL = "https://wa.me/";
export const GOOGLE_CLIENT_ID = "617032070306-9rtq6s4vc3uhp66lv3fdhf1qvg6dv2jd.apps.googleusercontent.com";
export const FACEBOOK_CLIENT_ID = "";

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
