import express from 'express'
import { validateLogin, logout} from '../controllers/loginController.js'
const router = express.Router()


router.get("/", (req,res) => {
    res.render('login')
})

router.post("/", validateLogin)
router.get('/logout', logout);

export default router