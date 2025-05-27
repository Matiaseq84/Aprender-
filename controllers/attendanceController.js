/*import { getAllCourses, getCourseById } from '../controllers/courseController.js';
import { getStudentById } from '../controllers/studentController.js';
import { readData, writeData } from '../utils/functions.js'; // ya los usás en otros controllers

const ATTENDANCE_FILE = './models/attendances.json';

export async function createAttendance(attendanceData) {
  try {
    
    const attendances = await readData(ATTENDANCE_FILE);

    
    attendances.push(attendanceData);

    await writeData(ATTENDANCE_FILE, attendances);

    return attendanceData;
  } catch (error) {
    console.error('Error al crear la asistencia:', error);
    throw error;
  }
}

export async function showAttendanceForm(req, res) {
  const courses = await getAllCourses();
  const { courseId, success, error } = req.query;

  console.log(courseId)

  if (!courseId) {
    return res.render('take-attendance', {
      courses,
      selectedCourse: null,
      students: null,
      success,
      error
    });
  }

  const selectedCourse = await getCourseById(courseId);
  console.log(selectedCourse)
  const students = [];

  if (selectedCourse.enrolledStudents.length) {
    
  for (const obj of selectedCourse.enrolledStudents) {
    console.log(obj.idStudent)
    const student = await getStudentById(obj.idStudent);
    if (student) students.push(student);
  }
}

  res.render('take-attendance', {
    courses,
    selectedCourse,
    students,
    success,
    error
  });
}

export async function submitAttendance(req, res) {
  const { courseId, presentStudents } = req.body;

  const students = Array.isArray(presentStudents)
    ? presentStudents.map(id => ({ studentId: parseInt(id) }))
    : presentStudents
      ? [{ studentId: parseInt(presentStudents) }]
      : [];

  try {
    await createAttendance({
      courseId: parseInt(courseId),
      date: new Date().toISOString().slice(0, 10),
      students
    });

    res.redirect(`/admin/take-attendance?courseId=${courseId}&success=Asistencia registrada correctamente`);
  } catch (error) {
    console.error(error);
    res.redirect(`/admin/take-attendance?courseId=${courseId}&error=Error al guardar la asistencia`);
  }
}*/
import { readData, writeData } from '../utils/functions.js'
import { getAllCourses } from './courseController.js'
import { getAllStudents } from './studentController.js'
import { format } from 'date-fns'

const ATTENDANCE_FILE = './models/attendances.json'

const DAY_NAME_TO_NUMBER = {
  "Lunes": 1,
  "Martes": 2,
  "Miércoles": 3,
  "Jueves": 4,
  "Viernes": 5,
}

export async function getAllAttendances() {
  try {
    const data = await readData(ATTENDANCE_FILE)
    return data
  } catch(error) {
    console.error('Error al leer el archivo')
    throw error
  }
}


export async function addAttendanceEntry(courseId, days) {
  try {
    const attendanceData = await readData(ATTENDANCE_FILE)

    const classDates = generateNextNDates(days, 30)

    const classes = classDates.map((dateStr, index) => ({
      numberClass: index + 1,
      date: dateStr,
      presents: []
    }))

    attendanceData.push({
      courseId,
      classes
    })

    await writeData(ATTENDANCE_FILE, attendanceData)
  } catch (error) {
    console.error('Error al inicializar la asistencia del curso:', error)
    throw error
  }
}

function generateNextNDates(dayNames, count) {
  const targetDays = dayNames.map(day => DAY_NAME_TO_NUMBER[day])
  const today = new Date()
  const dates = []

  let current = new Date(today)

  while (dates.length < count) {
    if (targetDays.includes(current.getDay())) {
      const dateStr = format(current, 'yyyy-MM-dd')
      dates.push(dateStr)
    }
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export async function renderAttendanceForm(req, res) {
  try {
    const courses = await getAllCourses();
    const students = await getAllStudents();

    const { courseId, classNumber } = req.query;

    let selectedStudents = [];
    let selectedCourseId = null;
    let selectedClassNumber = null;

    console.log(courseId)

    if (courseId) {
      const selectedCourse = courses.find(c => c.id == courseId);
      
      selectedCourseId = courseId;
      if (selectedCourse) {
        const enrolledIds = selectedCourse.enrolledStudents.map(e => e.idStudent);
        console.log(enrolledIds)
        selectedStudents = students.filter(s => enrolledIds.includes(s._id));
          
      }
    }

    if (classNumber) {
      selectedClassNumber = parseInt(classNumber);
    }

    res.render('take-attendance', {
      courses,
      students: selectedStudents,
      selectedCourseId,
      classNumber: selectedClassNumber,
      success: 'Guardado con éxito'
    });

  } catch (err) {
    console.error('Error al renderizar asistencia:', err);
    res.status(500).send('Error del servidor');
  }
}


export async function saveAttendance(req, res) {
  try {
    const { courseId, classNumber, presents } = req.body;
    console.log('Recibido presents:', presents);

    const parsedCourseId = parseInt(courseId);
    const parsedClassNumber = parseInt(classNumber);

    let presentObjects = [];

    if (Array.isArray(presents)) {
      presentObjects = presents.map(id => ({ studentId: parseInt(id) }));
    } else if (typeof presents === 'string') {
      presentObjects = [{ studentId: parseInt(presents) }];
    } else {
      presentObjects = []; // Ningún alumno tildado
    }

    const allAttendance = await getAllAttendances();

    const courseAttendance = allAttendance.find(c => c.courseId === parsedCourseId);

    if (courseAttendance) {
      const classObj = courseAttendance.classes.find(c => c.numberClass === parsedClassNumber);
      if (classObj) {
        classObj.presents = presentObjects;
      }
    }

    await writeData(ATTENDANCE_FILE, allAttendance);

    res.redirect(`/admin/take-attendance?courseId=${courseId}&classNumber=${classNumber}`);
  } catch (error) {
    console.error('Error registrando asistencia:', error);
    res.status(500).send('Error al guardar asistencia.');
  }
}
