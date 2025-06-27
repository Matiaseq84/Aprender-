import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from '../db.js'

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

const app = express();
const PORT = process.env.PORT || 3000;

// 🧩 Middlewares generales
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

app.set('view engine', 'pug');
app.set('views', './views');

// 🧑‍💻 Middleware para pasar el usuario a todas las vistas Pug
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// 🔌 Conectar base de datos e inicializar admin/teachers
connectDB().then(async () => {
  await Teachers.initializeTeachers();
  await Users.initializeUsers();
});

// 📌 Rutas públicas
app.get('/', (req, res) => {
  res.render('login');
});
app.use('/login', loginRouter); // Login público

// 🔒 Rutas protegidas con middleware JWT
app.use('/admin', authenticateJWT, adminRouter);
app.use('/courses', authenticateJWT, courseRoutes);
app.use('/students', authenticateJWT, studentRoutes);
app.use('/reportes', authenticateJWT, reportRoutes);

// ▶️ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
