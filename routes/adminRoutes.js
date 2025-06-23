import express from 'express'
import { registerCourse } from '../controllers/courseController.js'
import { getAllTeachers } from '../controllers/teacherController.js'
import { registerStudent } from '../controllers/studentController.js';
import { getAllCourses, enrollStudent, registerEnrollment } from '../controllers/courseController.js';
import { renderAttendanceForm, saveAttendance } from '../controllers/attendanceController.js';


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
router.post('/register-students', registerStudent); // Esta función debe estar en studentController.

router.get('/enroll-student', enrollStudent)

router.post('/enroll-student', registerEnrollment)


router.get('/register-course', async (req,res) => {
    const teachers = await getAllTeachers()
    res.render('register-course', {teachers})
})

router.get('/buscar', (req, res) => {
  res.render('buscar', { alumnoEncontrado: null, cursoEncontrado: null });
});



router.post('/register-course', registerCourse)

router.get('/take-attendance', renderAttendanceForm); 
router.post('/take-attendance', saveAttendance); 

export default router