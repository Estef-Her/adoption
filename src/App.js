import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import AnimalDetail from './pages/AnimalDetail';
import PublishAnimal from './pages/PublishAnimal';
import MisPublicaciones from './pages/MisPublicaciones';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Registro from 'pages/Registro';
import Cuenta from 'pages/Cuenta';
import RecuperarContrasena from 'pages/RecuperarContrasena';
import UsuariosCRUD from 'pages/UsuariosCRUD';
import RegistroUsuario from 'pages/RegistroUsuario';
import ModificarAnimal from 'pages/ModificarAnimal';
import PrivacyPolicy from 'pages/PrivacyPolicy';
import CambioContrasena from 'pages/CambioContrasena';
import DogDetector from 'pages/DogDetector';

import { LoadingProvider, useLoading } from './LoadingContext';
import LoadingModal from './LoadingModal';

function AppContent() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchImg, setSearchImg] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState();

  const handleSearch = (term) => setSearchTerm(term);
  const handleSearchImg = (term) => setSearchImg(term);

  const { loading } = useLoading();

  return (
    <>
      <Router basename="/adoption">
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavBar isAuthenticated={isAuthenticated} onSearch={handleSearch} onSearchImg={handleSearchImg} />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home searchTerm={searchTerm} searchImg={searchImg} />} />
              <Route path="/animal/:id" element={<AnimalDetail />} />
              <Route path="/publicar" element={<PublishAnimal />} />
              <Route path="/dog" element={<DogDetector />} />
              <Route path="/modificarAnimal/:id" element={<ModificarAnimal />} />
              <Route path="/publicaciones/:id" element={<MisPublicaciones />} />
              <Route path="/usuarios" element={<UsuariosCRUD />} />
              <Route path="/usuariosRegistro" element={<RegistroUsuario />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/cuenta" element={<Cuenta />} />
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
              <Route path="/cambio-contrasena" element={<CambioContrasena />} />
              <Route path="/politica-de-privacidad" element={<PrivacyPolicy />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
      <LoadingModal visible={loading} />
    </>
  );
}

function App() {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
}

export default App;
