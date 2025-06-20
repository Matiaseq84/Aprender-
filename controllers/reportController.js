
import { readData } from '../utils/functions.js';

const COURSES_DB = './models/courses.json';
const ENROLLMENTS_DB = './models/enrollments.json';
const STUDENTS_DB = './models/students.json';

//Función auxiliar: normaliza texto para evitar errores por tildes o mayúsculas
const normalize = str =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

//Reporte: Alumnos por curso
export async function getAlumnosPorCurso(req, res) {
  const courses = await readData(COURSES_DB);
  const students = await readData(STUDENTS_DB);

  const coursesWithStudents = courses
    .map(course => {
      const enrolledStudents = course.enrolledStudents
        .map(e => students.find(s => s._id === e.idStudent)) 

    return{
      name: course.name,
      students: enrolledStudents
    } 
  })

  res.render('report-alumnos-por-curso', { coursesWithStudents });
}

//Reporte: Cupos disponibles por curso (solo cursos activos)
export async function getCuposDisponibles(req, res) {
    const courses = await readData(COURSES_DB);

    const availableCourses = courses
      .filter(course => course.status === 'on')
      .map(course => {
        const taken = course.enrolledStudents.length
        const availability = parseInt(course.capacity) - taken

        return {
        name: course.name,
        capacity: course.capacity,
        taken,
        availability
      }
      })
    
  res.render('report-cupos-disponibles', { availableCourses });
}

//Reporte: Cursos completos (cantidad de inscriptos igual o mayor al cupo)
export async function getCursosCompletos(req, res) {
    const courses = await readData(COURSES_DB)

    const full =  courses
      .filter( course => course.enrolledStudents.length === parseInt(course.capacity))
      .map( course => ({
            ...course,
            enrolled: course.enrolledStudents.length
      }))
  
  res.render('report-cursos-completos', { full });
}
