import { readData, writeData } from "../utils/functions.js";
import { getAllStudents, getStudentByDni } from "./studentController.js";
import { addAttendanceEntry } from "./attendanceController.js";
import { getAllTeachers } from "./teacherController.js";
import  Course from "../models/Course.js"
import { constructFromSymbol } from "date-fns/constants";
import Teacher from "../models/Teacher.js";
const DB_FILE = './models/courses.json'

//Función para normalizar texto (quita tildes y pone en minúscula)
const normalize = str =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export async function getAllCourses() {
  try {
    const courses = await Course.find({})
    return courses
  } catch(error) {
    console.error('Error al traer los cursos')
    throw error
  }
}

export async function getCourseById(id) {
  try {
    const courses = await getAllCourses()
    return courses.find(c => c._id === parseInt(id))  
  } catch(error) {
    console.error('Error al traer los cursos')
    throw error
  }
    
}

export async function getFilteredCourses(req, res) {
  try {
    const { name, teacher, status } = req.query

    const filter = {}

    if (name) filter.courseName = { $regex: name, $options: 'i'}
    if (teacher) filter.nameTeacher = { $regex: teacher, $options: 'i'}
    if (status) filter.status = status

    const courses = await Course.find(filter)
    const teachers = await getAllTeachers()

    let foundCourse = null
    if (courses.length > 0) foundCourse = courses[0]

    const nameTeacher = await Teacher.findById(foundCourse.teacher).select('name')
  
    res.render('buscar', {
      foundCourse,
      teachers,
      nameTeacher
    })

  } catch (error) {
    console.error('Error al filtrar los cursos: ', error)
    res.status(500).send('Error al buscar cursos')
  }
    
}

export async function registerCourse(req, res) {
    try {
        const { courseName, coursePrice, courseCapacity, hours, days, teacher, status }  = req.body

    let schedule = []

    if (!courseName || !coursePrice || !courseCapacity || !teacher || !status || !days?.length || !hours?.length) {
        const teachers = await getAllTeachers();
        return res.render('register-course', {
            teachers,
            error: 'Todos los campos son obligatorios.'
        });
    }

    const exists = await Course.findOne({courseName})
    if (exists) {
      return res.status(400).render('register-courses', {
        error: 'Ya existe un curso con ese nombre',
        FormData: req.body
      })
    }
    
    for (let i = 0 ; i < days.length; i++) {
        schedule.push({
            day: days[i],
            hour: hours[i]
        })      
    }

    const newCourse = new Course({
      courseName,
        coursePrice,
        courseCapacity,
        schedule,
        teacher,
        status,
    })

    
    await addAttendanceEntry(newCourse.id, days)

    await newCourse.save()    
    
    const teachers = await getAllTeachers()

    res.render('register-course', {
            teachers,
            success: 'Curso registrado exitosamente.',
            
        });
    
    } catch(error) {
        console.error('Error', error)
        try {
      const teachers = await getAllTeachers();
      res.status(500).render('register-course', {
        teachers,
        error: 'Error en el servidor al registrar el curso.'
      });
    } catch (e) {
      res.status(500).send('Error fatal del servidor');
    }

    }
    
}

export async function updateCourseData(req, res) {
  const { id } = req.params;
  const newData = req.body;


  const updatedCourse = await Course.findByIdAndUpdate(id, newData, { new: true });
 
  if (!updatedCourse) {
    return res.status(404).send("Curso no encontrado");
  }

  res.redirect('/admin/buscar');
}

export async function deleteCourseData(req, res) {
  try {
    const { id } = req.params;

  
  await Course.findByIdAndDelete(id)

  res.redirect('/admin/buscar');
  } catch (error) {
    console.error('Error eliminando el curso: ', error)
    res.status(500).send('Error al eliminar el curso')
  }
  
}

export async function getCourseByDni(dni) {
  
  const courses = await getAllCourses(DB_FILE)
  
  const course = courses.find( course => course.dni === dni)

  return course

}

export async function enrollStudent(req, res) {
  const courses = await getAllCourses(); 
  const { dni, courseName } = req.query;

  if (!dni) {
    
    return res.render('enroll-student', {
      courses,
      student: null,
      error: null,
      success: null
    });
  }

  const student = await getStudentByDni(dni);

  if (!student) {
    return res.render('enroll-student', {
      courses,
      student: null,
      error: 'Alumno no encontrado',
      success: null
    });
  }

  const selectedCourse = courses.find(c => c.name === courseName);

  return res.render('enroll-student', {
    courses,
    student,
    selectedCourse,
    error: null,
    success: null
  });
}

export async function registerEnrollment(req, res) {
  const { studentId, courseId } = req.body
  console.log(courseId, studentId)

  const courses = await getAllCourses()
  const course = courses.find(c => c.id === parseInt(courseId))
  
  //Validaciones
  if(!course) {
    return res.render('enroll-student', {
      courses,
      student: null,
      error: 'Curso no encontrado',
      success: null
    })
  }

  //const course = courses[courseIndex]

  if(course.enrolledStudents.includes(studentId)) {
    return res.render('enroll-student', {
      courses,
      student: null,
      error: 'El alumno ya está inscripto en este curso.',
      success: null
    })
  }

  if(course.enrolledStudents.length >= parseInt(course.capacity)) {
    return res.render('enroll-student', {
      courses,
      student: null,
      error: 'No hay más cupos disponibles en este curso',
      success: null
    })
  }

  //Inscribir
  course.enrolledStudents.push({idStudent: parseInt(studentId)})
  await writeData(DB_FILE, courses)

  return res.render('enroll-student', {
    courses,
    student: null,
    error: null,
    success: 'Inscripción realizada con éxito.'
  })


}

