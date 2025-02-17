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
const sendPasswordRecoveryEmail = async (email, codigo) => {
  const recoveryLink = `http://localhost:3000/recuperar-contrasena`; // URL de recuperación

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Recuperación de Contraseña',
    html: `<p>Tu código de recuperación es: <strong>${codigo}</strong>. Ingresa este código en la página de recuperación para restablecer tu contraseña.</p>`,
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
const enviarCorreoRegistro = async (email, contrasena) => {
  const link = `http://localhost:3000/adoption/login`; // URL de recuperación
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Usuario registrado',
    html: `<p>Usted ha sido registrado en la plataforma encuentra a tu amigo, para ingresar utilice su correo electrónico y esta contraseña provisional: <strong>${contrasena}</strong>. Recuerde crear una nueva contraseña al ingresar a la plataforma.</p>`,
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
const enviarCorreoModificacion = async (email, contrasena) => {
  const link = `http://localhost:3000/adoption/login`; // URL de recuperación
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Usuario modificado',
    html: `<p>Sus datos han sido modificados en la plataforma encuentra a tu amigo, inicie sesión y verifique.</p>`,
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
