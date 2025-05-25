
import { getAllCourses, addCourse } from "../controllers/courseController.js";
import { Course } from "../classes/Course.js"




const DB_FILE = './models/courses.json'

//Función para registrar un nuevo curso y renderizar la vista de registro
export async function registerCourse(req, res) {
    try {
        const { courseName, coursePrice, capacity, hours, days, teacher, status }  = req.body
    
    let schedule = []
    
    for (let i = 0 ; i < days.length; i++) {
        schedule.push({
            day: days[i],
            hour: hours[i]
        })      
    }

    const courses = await getAllCourses()
    console.log(courses.length)

    const newCourse = new Course(
        courses.length > 0 ? courses[courses.length - 1].id + 1 : 1,
        courseName,
        coursePrice,
        capacity,
        schedule,
        teacher,
        status
    )
        
    addCourse(newCourse)

    res.status(201).send('Curso creado')
    
    } catch(error) {
        console.error('Error', error)
        res.status(500).send('Error en el servidor')

    }
    
}