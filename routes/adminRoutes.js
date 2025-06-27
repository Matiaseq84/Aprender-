import express from 'express';
import { registerCourse, getAllCourses, enrollStudent, registerEnrollment } from '../controllers/courseController.js';
import { getAllTeachers } from '../controllers/teacherController.js';
import { registerStudent } from '../controllers/studentController.js';
import { renderAttendanceForm, saveAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

// 🌐 Vista principal del panel
router.get('/admin-panel', (req, res) => {
  res.redirect('/admin/buscar');
});

// 👤 Registro de estudiantes
router.get('/register-students', (req, res) => {
  res.render('register-students', { formData: {}, error: null, success: null });
});
router.post('/register-students', registerStudent);

// 📚 Registro de cursos
router.get('/register-course', async (req, res) => {
  const teachers = await getAllTeachers();
  res.render('register-course', { teachers });
});
router.post('/register-course', registerCourse);

// 🔗 Inscripción de estudiantes
router.get('/enroll-student', enrollStudent);
router.post('/enroll-student', registerEnrollment);

// 👀 Búsqueda
router.get('/buscar', (req, res) => {
  res.render('buscar', { alumnoEncontrado: null, cursoEncontrado: null });
});

// 📋 Asistencia
router.get('/take-attendance', renderAttendanceForm);
router.post('/take-attendance', saveAttendance);

export default router;
