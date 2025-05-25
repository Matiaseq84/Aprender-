import express from 'express'
import { registerCourse } from '../controllers/adminController.js'
import { getAllTeachers } from '../controllers/teacherController.js'
import { registerStudent } from '../controllers/studentController.js';

const router = express.Router()

router.get('/admin-panel', (req, res) => {
    res.redirect('/admin/buscar'); // o cualquier vista que quieras que cargue por defecto
});


// Ruta GET para MOSTRAR el formulario de registro de estudiantes
router.get('/register-students', (req, res) => {
    res.render('register-students', { formData: {}, error: null, success: null });
    //res.send('Hola desde /register-students');
});

// Ruta POST para PROCESAR el formulario de registro de estudiantes
router.post('/register-students', registerStudent); // Esta función debe estar en studentController.js


router.get('/register-course', async (req,res) => {
    const teachers = await getAllTeachers()
    res.render('register-course', {teachers})
})

router.get('/buscar', (req, res) => {
  res.render('admin/buscar', { alumnoEncontrado: null, cursoEncontrado: null });
});

router.post('/register-course', registerCourse)

export default router