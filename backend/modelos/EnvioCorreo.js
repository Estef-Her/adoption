const nodemailer = require('nodemailer');
require('dotenv').config({ path: 'Correo.env' });


// Configuración del transportador de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Función para enviar un correo de recuperación
const sendPasswordRecoveryEmail = async (email, codigo, user) => {
  const recoveryLink = `http://localhost:3000/recuperar-contrasena`; // URL de recuperación

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Recuperación de Contraseña',
    html: `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
  <img src="https://raw.githubusercontent.com/Estef-Her/adoption/main/src/images/logo.png" alt="Encuentra a tu Amigo" style="max-width: 150px; margin-bottom: 20px;">
  <h2 style="color: #333;">Código de recuperación</h2>
  <p style="font-size: 16px; color: #555;">
    Hola <strong>${user.nombre}</strong>, tu código de recuperación es <strong>${codigo}</strong>.  
    Ingresa este código en la página de recuperación para restablecer tu contraseña.  
  </p>
  <a href="http://localhost:3000/adoption" style="display: inline-block; padding: 10px 20px; color: white; background-color: #d1956a; text-decoration: none; border-radius: 5px; margin-top: 10px;font-size: 16px;">
    Ingresar a la Plataforma
  </a>
</div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de recuperación enviado');
  } catch (error) {
    console.error('Error al enviar el correo: ', error);
    throw new Error('Error al enviar el correo');
  }
};
// Función para enviar un correo al crear usuario
const enviarCorreoRegistro = async (email, contrasena,user) => {
  const link = `http://localhost:3000/adoption/login`; // URL de recuperación
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Usuario registrado',
    html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
  <img src="https://raw.githubusercontent.com/Estef-Her/adoption/main/src/images/logo.png" alt="Encuentra a tu Amigo" style="max-width: 150px; margin-bottom: 20px;">
  <h2 style="color: #333;">Bienvenido a Encuentra a tu Amigo</h2>
  <p style="font-size: 16px; color: #555;">
    Hola <strong>${user.nombre}</strong>, usted ha sido registrado en la plataforma <strong>Encuentra a tu Amigo</strong>.  
    Para ingresar, utilice su correo electrónico <strong>${user.correo}</strong> y esta contraseña provisional:  
    <strong style="color: #d1956a; font-size: 18px;">${contrasena}</strong>.
  </p>
  <p style="font-size: 16px; color: #777;">Recuerde crear una nueva contraseña al ingresar a la plataforma.</p>
  <a href="http://localhost:3000/adoption" style="display: inline-block; padding: 10px 20px; color: white; background-color: #d1956a; text-decoration: none; border-radius: 5px; margin-top: 10px;font-size: 16px;">
    Ingresar a la Plataforma
  </a>
</div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de registro enviado');
  } catch (error) {
    console.error('Error al enviar el correo: ', error);
    throw new Error('Error al enviar el correo');
  }
};
// Función para enviar un correo al modificar un usuario
const enviarCorreoModificacion = async (email, contrasena,user) => {
  const link = `http://localhost:3000/adoption/login`; // URL de recuperación
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Usuario modificado',
    html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
  <img src="https://raw.githubusercontent.com/Estef-Her/adoption/main/src/images/logo.png" alt="Encuentra a tu Amigo" style="max-width: 150px; margin-bottom: 20px;">
  <h2 style="color: #333;">Actualización de Datos</h2>
  <p style="font-size: 16px; color: #555;">
    Hola <strong>${user.nombre}</strong>, sus datos han sido modificados en la plataforma <strong>Encuentra a tu Amigo</strong>.  
    Le recomendamos iniciar sesión y verificar la información.
  </p>
  <a href="http://localhost:3000/adoption" style="display: inline-block; padding: 10px 20px; color: white; background-color: #d1956a; text-decoration: none; border-radius: 5px; margin-top: 10px;font-size: 16px;">
    Iniciar Sesión
  </a>
</div>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de modificación enviado');
  } catch (error) {
    console.error('Error al enviar el correo: ', error);
    throw new Error('Error al enviar el correo');
  }
};
module.exports = { sendPasswordRecoveryEmail,enviarCorreoRegistro,enviarCorreoModificacion };
