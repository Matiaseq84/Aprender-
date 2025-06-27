import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from '../db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Middlewares
import { authenticateJWT } from '../middlewares/auth.js';

// Rutas
import loginRouter from '../routes/loginRoutes.js';
import adminRouter from '../routes/adminRoutes.js';
import courseRoutes from '../routes/coursesRoutes.js';
import studentRoutes from '../routes/studentsRoutes.js';
import reportRoutes from '../routes/reportRoutes.js';

// Inicializadores
import * as Teachers from '../controllers/teacherController.js';
import * as Users from '../controllers/loginController.js';

// Manejo de rutas absolutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares generales
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public'))); // Ruta absoluta

// Configuración del motor de vistas
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views')); // Ruta absoluta

// Middleware global para pasar el usuario a todas las vistas Pug
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Conectar base de datos e inicializar admin y docentes
connectDB().then(async () => {
  await Teachers.initializeTeachers();
  await Users.initializeUsers();
});

// Rutas públicas
app.get('/', (req, res) => {
  res.render('login');
});
app.use('/login', loginRouter);

// Rutas protegidas
app.use('/admin', authenticateJWT, adminRouter);
app.use('/courses', authenticateJWT, courseRoutes);
app.use('/students', authenticateJWT, studentRoutes);
app.use('/reportes', authenticateJWT, reportRoutes);

// ❌ NO usar app.listen() en Vercel

export default app;
