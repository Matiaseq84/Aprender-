import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Clave secreta para firmar los tokens (usar .env en producción)
const SECRET_KEY = 'clave_super_secreta';

// Crear usuario admin por defecto si no existe
export async function initializeUsers(req, res) {
  try {
    const exists = await User.findOne({ username: 'admin' });

    if (!exists) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      });

      console.log(' Usuario admin creado con contraseña hasheada.');
    }
  } catch (error) {
    console.error('Error inicializando usuarios:', error);
    res.status(500).send('Error en el servidor');
  }
}

// Validación de login
export async function validateLogin(req, res) {
  const { username, password } = req.body;
  const isTest = req.headers['x-test'] === 'true'; // bandera para pruebas

  try {
    const user = await User.findOne({ username });

    if (!user) {
      if (isTest) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      return res.status(401).render('login', {
        error: 'Usuario o contraseña incorrecta',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      if (isTest) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      return res.status(401).render('login', {
        error: 'Usuario o contraseña incorrecta',
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    if (isTest) {
      return res.status(200).json({ token });
    }

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
      sameSite: 'strict',
    });

    res.redirect('/admin/admin-panel');
  } catch (error) {
    console.error('Error al validar login:', error);
    if (isTest) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
    res.status(500).render('login', {
      error: 'Error interno del servidor',
    });
  }
}

// Logout: limpiar cookie
export function logout(req, res) {
  res.clearCookie('token');
  res.redirect('/');
}

