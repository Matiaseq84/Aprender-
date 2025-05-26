import { readData } from '../utils/functions.js'
const DB_FILE = './models/users.json'

export async function validateLogin(req, res) {
    const {username, password} = req.body
    
    try {
        const users = await readData(DB_FILE)
        console.log(users)
        const user = users.find(user => user.username === username)

        if (!user || user.password !== password) {
            return res.status(401).render('login', { error: 'Usuario o contraseña incorrecta' });
        }

        res.redirect('/admin/admin-panel');

    } catch(error) {
        console.error('Error al leer el archivo', error)
    }
}