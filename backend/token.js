const jwt = require('jsonwebtoken');

class Token {
  constructor() {
    this.SECRET_KEY = 'cl78re672bmdp8952m-shb';  // Clave secreta usada para firmar los tokens
  }

  // Método para generar un token JWT
  generarToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name },  // Datos que van en el token
      this.SECRET_KEY,  // Clave secreta
      { expiresIn: '1h' }  // Tiempo de expiración del token (en este caso, 1 hora)
    );
  }

  // Middleware para proteger rutas
  autenticarToken(req, res, next) {
    const token = req.headers['authorization'];  // El token JWT debe ser enviado en el header Authorization

    if (!token) {
      return res.status(403).json({ message: 'Token is required' });
    }

    // Verificar el token
    jwt.verify(token, this.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      req.user = decoded;  // Decodificar el token y añadir los datos del usuario al objeto `req`
      next();  // Pasar al siguiente middleware o ruta
    });
  }
}

// Exportar la clase para su uso en otros archivos
module.exports = Token;
