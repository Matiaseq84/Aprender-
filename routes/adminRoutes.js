import express from 'express'
import { registerCourse } from '../controllers/adminController.js'
import { getAllTeachers } from '../controllers/teacherController.js'
const router = express.Router()

router.get('/admin-panel', (req, res) => {
    res.render('admin-panel-layout')
})

router.get('/register-course', async (req,res) => {
    const teachers = await getAllTeachers()
    res.render('register-course', {teachers})
})

router.post('/register-course', registerCourse)

export default router