import { readData, writeData } from "../utils/functions.js";
import { getAllStudents, getStudentByDni } from "./studentController.js";
const DB_FILE = './models/courses.json'

//Función para normalizar texto (quita tildes y pone en minúscula)
const normalize = str =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export async function getAllCourses() {
    const data = await readData(DB_FILE)
    return data
}

export async function addCourse(data) {
    const courses = await getAllCourses()

    courses.push(data)

    writeData(DB_FILE, courses)
}

export async function getCourseById(id) {
    const courses = await getAllCourses()
    return courses.find(c => c.id === parseInt(id))
}

export async function updateCourse(id, newData) {
    const courses = await getAllCourses()
    const index = courses.findIndex(c => c.id === parseInt(id))
    if (index === -1) return null

    courses[index] = { ...courses[index], ...newData }
    await writeData(DB_FILE, courses)
    return courses[index]
}

export async function deleteCourse(id) {
    let courses = await getAllCourses()
    courses = courses.filter(c => c.id !== parseInt(id))
    await writeData(DB_FILE, courses)
}

export async function getFilteredCourses(req, res) {
  const { name, teacher, status } = req.query;
  let courses = await getAllCourses();

  let curso = courses.find(c => {
    const matchName = name ? normalize(c.name).includes(normalize(name)) : true;
    const matchTeacher = teacher ? normalize(c.teacher).includes(normalize(teacher)) : true;
    const matchStatus = status ? c.status === status : true;
    return matchName && matchTeacher && matchStatus;
  });

  res.render('buscar', { cursoEncontrado: curso });
}

export async function updateCourseData(req, res) {
  const { id } = req.params;
  const newData = req.body;

  const courses = await getAllCourses();
  const index = courses.findIndex(c => c.id === parseInt(id));

  if (index === -1) {
    return res.status(404).send("Curso no encontrado");
  }

  courses[index] = { ...courses[index], ...newData };
  await writeData('./models/courses.json', courses);

  res.redirect('buscar');
}

export async function getCourseByDni(dni) {
  
  const courses = await getAllCourses(DB_FILE)
  
  const course = courses.find( course => course.dni === dni)

  return course

}

export async function deleteCourseData(req, res) {
  let courses = await getAllCourses();
  const { id } = req.params;

  courses = courses.filter(c => c.id !== parseInt(id));
  await writeData('./models/courses.json', courses);

  res.redirect('buscar');
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
