import jwt from 'jsonwebtoken';

const SECRET_KEY = 'clave_super_secreta'; 

// Middleware para verificar autenticación con JWT
export function authenticateJWT(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;            // Guardamos el usuario en la request
    res.locals.user = decoded;     // Hacemos el usuario accesible en las vistas Pug
    next();
  } catch (err) {
    console.error('Token inválido:', err.message);
    return res.redirect('/');
  }
}
