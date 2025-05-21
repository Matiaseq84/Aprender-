import { readData } from '../utils/functions.js'
const DB_FILE = './models/users.json'

export async function validateLogin(req, res) {
    const {username, password} = req.body
    console.log("Body received:", req.body);
    try {
        const users = await readData(DB_FILE)
        console.log(users)
        const user = users.find(user => username)

        //if(!user) res.status(401).render('login', {error: 'Usuario o contraseña incorrecta'})
        
        if(user && user.password === password) {
            res.redirect('admin/admin-panel')
        }
    } catch(error) {
        console.error('Error al leer el archivo', error)
    }
}