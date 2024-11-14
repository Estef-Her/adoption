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
import ModificarAnimal from 'pages/ModificarAnimal';
import PrivacyPolicy from 'pages/PrivacyPolicy';
function App() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchImg, setSearchImg] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] =  React.useState();

  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  const handleSearchImg = (term) => {
    setSearchImg(term);
  };

  return (
    <Router basename="/FindYourFriend">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' } } >
        <NavBar  isAuthenticated={isAuthenticated} onSearch={handleSearch} onSearchImg={handleSearchImg} />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home searchTerm={searchTerm} searchImg={searchImg} />} />
            <Route path="/animal/:id" element={<AnimalDetail />} />
            <Route path="/publicar" element={<PublishAnimal />} />
            <Route path="/modificarAnimal/:id" element={<ModificarAnimal />} />
            <Route path="/publicaciones" element={<MisPublicaciones />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/cuenta" element={<Cuenta />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated}/>} />
            <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated}/>} />
            <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
            <Route path="/politica-de-privacidad" element={<PrivacyPolicy />} /> {/* Ruta para la política de privacidad */}
          </Routes>
        </div> 
        <Footer />       
      </div>      
    </Router>    
  );
}

export default App;
