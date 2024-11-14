import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="custom-navbar">
      <Container>
        <Row>
          <Col className="text-center">
            <p>&copy; 2024 Adoptar Salva Vidas. Todos los derechos reservados.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;