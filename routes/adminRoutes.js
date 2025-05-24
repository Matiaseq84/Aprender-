import express from 'express'
import { registerCourse } from '../controllers/adminController.js'
import { getAllTeachers } from '../controllers/teacherController.js'
const router = express.Router()

router.get('/admin-panel', (req, res) => {
    res.redirect('/admin/buscar'); // o cualquier vista que quieras que cargue por defecto
});

router.get('/register-course', async (req,res) => {
    const teachers = await getAllTeachers()
    res.render('register-course', {teachers})
})

router.get('/buscar', (req, res) => {
  res.render('admin/buscar', { alumnoEncontrado: null, cursoEncontrado: null });
});

router.post('/register-course', registerCourse)

export default router