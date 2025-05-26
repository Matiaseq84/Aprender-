
import { getAllCourses, addCourse } from "../controllers/courseController.js";
import { Course } from "../classes/Course.js"
import { readData } from "../utils/functions.js";
import { getAllTeachers } from "./teacherController.js";

const DB_FILE = './models/courses.json'

//Función para registrar un nuevo curso y renderizar la vista de registro
export async function registerCourse(req, res) {
    try {
        const { courseName, coursePrice, courseCapacity, hours, days, teacher, status }  = req.body

    let schedule = []
    let enrolledStudents = []

    if (!courseName || !coursePrice || !courseCapacity || !teacher || !status || !days?.length || !hours?.length) {
        const teachers = await getAllTeachers();
        return res.render('register-course', {
            teachers,
            error: 'Todos los campos son obligatorios.'
    });
}

    
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
        courseCapacity,
        schedule,
        teacher,
        status,
        enrolledStudents
    )

    console.log(newCourse)
        
    await addCourse(newCourse)

    const teachers = await getAllTeachers()

    res.render('register-course', {
            teachers,
            success: 'Curso registrado exitosamente.',
            
        });
    
    } catch(error) {
        console.error('Error', error)
        const teachers = await getAllTeachers()
        res.status(500).render('register-course', {
            teachers,
            error: 'Error en el servidor al registrar el curso.'
    });

    }
    
}