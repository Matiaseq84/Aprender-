import { getAllCourses, getCourseById } from '../controllers/courseController.js';
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
}
