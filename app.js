import express from 'express';
import loginRouter from './routes/loginRoutes.js'
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.set('view engine', 'pug');
app.set('views', './views')

app.get('/', (req,res) => {
    res.render('login')
})

app.use('/login', loginRouter)

app.listen(PORT, () => {
    console.log(`Servidor corriendo  en http://localhost:${PORT}`)
})
