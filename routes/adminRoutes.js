import express from 'express'
import { registerCourse } from '../controllers/adminController.js'
const router = express.Router()

router.get('/admin-panel', (req, res) => {
    res.render('admin-panel')
})

router.get('/register-course', (req,res) => {
    res.render('register-course')
})

router.post('/register-course', registerCourse)

export default router