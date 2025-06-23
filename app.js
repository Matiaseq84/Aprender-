import express from 'express';
import loginRouter from './routes/loginRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import courseRoutes from './routes/coursesRoutes.js';
import studentRoutes from './routes/studentsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import * as Teachers from './controllers/teacherController.js'
import * as Users from './controllers/loginController.js'
import connectDB from './db.js';

connectDB().then(async () => {
    await Teachers.initializeTeachers(),
    await Users.initializeUsers()

})
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.set('view engine', 'pug');
app.set('views', './views')

app.use(express.static('public'));
    
app.get('/', (req,res) => {
    res.render('login')
})

app.use('/login', loginRouter)
app.use('/admin', adminRouter)
app.use('/courses', courseRoutes);
app.use('/students', studentRoutes);
app.use('/reportes', reportRoutes);


app.listen(PORT, () => {
    console.log(`Servidor corriendo  en http://localhost:${PORT}`)
})
