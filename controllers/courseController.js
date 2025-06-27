import { addAttendanceEntry } from "./attendanceController.js";
import { getAllTeachers } from "./teacherController.js";
import Course from "../models/Course.js"
import Student from "../models/Student.js"
import Teacher from "../models/Teacher.js";


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
        const teachers = await getAllTeachers();

        const { courseName, coursePrice, courseCapacity, hours, days, teacher, status }  = req.body

    let schedule = []

    if (!courseName || !coursePrice || !courseCapacity || !teacher || !status || !days?.length || !hours?.length) {
        return res.render('register-course', {
            teachers,
            error: 'Todos los campos son obligatorios.'
        });
    }

    const exists = await Course.findOne({courseName})
    
    if (exists) {
      console.log('aquí')
      return res.status(400).render('register-course', {
        teachers,
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
  try {
    const { id } = req.params;
    const newData = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(id, newData, { new: true });
 
    if (!updatedCourse) {
      return res.status(404).send("Curso no encontrado");
  }

    res.redirect('/admin/buscar');
  } catch (error) {
    console.error('Error al actualizar el curso', error)
    res.status(500).send('Error al actualizar el curso')
  }
  
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

export async function enrollStudent(req, res) {
  
  try {
    const courses = await getAllCourses()
    const { dni, courseName } = req.query

    if (!dni) {
      return res.render('enroll-student', {
        courses,
        student: null,
        error: null,
        success: null
      });
    }

    const student = await Student.findOne({dni});

    if (!student) {
      return res.render('enroll-student', {
        courses,
        student: null,
        error: 'Alumno no encontrado',
        success: null
      })
    }

    const selectedCourse = await Course.findById(courseName);
    
    return res.render('enroll-student', {
      courses,
      student,
      selectedCourse,
      error: null,
      success: null
    })
  } catch (error) {
    console.error('Error buscando al alumno: ', error)
    res.status(500).send('Error buscando al alumno')
  }  
}

export async function registerEnrollment(req, res) {
  try {
    const { studentId, courseId } = req.body
    
    const courses = await getAllCourses()

    const course = await Course.findById(courseId)
    
    //Validaciones
    if(!course) {
      return res.render('enroll-student', {
        courses,
        student: null,
        error: 'Curso no encontrado',
        success: null
      })
    }

    const alreadyEnrolled = course.enrolledStudents.some( s => s.idStudent.toString() === studentId)

    if(alreadyEnrolled) {
      return res.render('enroll-student', {
        courses,
        student: null,
        error: 'El alumno ya está inscripto en este curso.',
        success: null
      })
    }

    if(course.enrolledStudents.length >= parseInt(course.courseCapacity)) {
      return res.render('enroll-student', {
        courses,
        student: null,
        error: 'No hay más cupos disponibles en este curso',
        success: null
      })
    }

    //Inscribir
    course.enrolledStudents.push({idStudent: studentId})
    await course.save()

    return res.render('enroll-student', {
      courses,
      student: null,
      error: null,
      success: 'Inscripción realizada con éxito.'
    })
  } catch (error) {
    console.error('Error en la inscripción.', error)
    res.status(500).send('Error en el servidor al procesar la inscripción.')
  }
}

