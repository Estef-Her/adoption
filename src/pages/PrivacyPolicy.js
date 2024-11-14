import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const PrivacyPolicy = () => {
  return (
    <Container className="mt-5">
      <Row>
        <Col md={8} className="offset-md-2">
          <h2 className="text-center">Política de Privacidad</h2>
          <p><strong>Última actualización: </strong> 14 de noviembre de 2024</p>

          <h4>1. Introducción</h4>
          <p>
            En Encuentra a tu amigo, valoramos tu privacidad y estamos comprometidos a proteger tus datos personales.
            Esta política de privacidad describe cómo recopilamos, usamos, y protegemos la información que obtenemos de los usuarios.
          </p>

          <h4>2. Información que recopilamos</h4>
          <p>
            Recopilamos los siguientes tipos de información:
            <ul>
              <li>Información personal: Nombre, correo electrónico.</li>
              <li>Información de acceso: Dirección IP, navegador, tipo de dispositivo.</li>
            </ul>
          </p>

          <h4>3. Cómo usamos la información</h4>
          <p>
            Usamos la información recopilada para mejorar la experiencia de usuario, enviar notificaciones y proporcionar soporte técnico.
          </p>

          <h4>4. Cómo compartimos la información</h4>
          <p>
            No vendemos ni alquilamos tu información personal a terceros. Sin embargo, podemos compartir tu información con:
            <ul>
              <li>Proveedores de servicios de hosting y análisis.</li>
              <li>Entidades gubernamentales cuando lo exija la ley.</li>
            </ul>
          </p>

          <h4>5. Protegiendo tu información</h4>
          <p>
            Tomamos medidas razonables para proteger tu información personal, como el uso de cifrado en las comunicaciones y almacenamiento seguro de los datos.
          </p>

          <h4>6. Derechos de los usuarios</h4>
          <p>
            Tienes el derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Para hacerlo, contacta con nosotros a través de encuentraatuamigocr@gmail.com
          </p>

          <h4>7. Cambios en la política de privacidad</h4>
          <p>
            Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Te notificaremos sobre los cambios importantes.
          </p>

          <h4>8. Contacto</h4>
          <p>
            Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en encuentraatuamigocr@gmail.com.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default PrivacyPolicy;
