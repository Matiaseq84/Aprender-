import User from '../models/User.js'

export async function initializeUsers(req, res) {
    try {
        const exists = await User.findOne({username: 'admin'})

        if(!exists) {
            await User.create({
                username: 'admin',
                password: 'admin',
                role: 'admin'
            })
        }

    } catch (error) {
        console.error('Error inicializando usuarios: ', error)
        res.status(500).send('Error en el servidor')
    }
}

export async function validateLogin(req, res) {
    const {username, password} = req.body
    
    try {
        
        const user = await User.findOne({username})

        if (!user || user.password !== password) {
            return res.status(401).render('login', { error: 'Usuario o contraseña incorrecta' });
        }

        res.redirect('admin/admin-panel');

    } catch(error) {
        console.error('Error al leer el archivo', error)
    }
}