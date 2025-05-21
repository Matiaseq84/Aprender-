import express from 'express'
import { validateLogin } from '../controllers/loginController.js'
const router = express.Router()


router.get("/", (req,res) => {
    res.render('login')
})

router.post("/", validateLogin)

export default router