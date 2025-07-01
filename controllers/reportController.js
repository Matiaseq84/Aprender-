import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js'; 

export async function getAlumnosPorCurso(req, res) {
  try {
    const courses = await Course.find({})
      .populate('enrolledStudents.idStudent');

    const coursesWithStudents = courses.map(course => ({
      name: course.courseName,
      students: course.enrolledStudents.map(e => e.idStudent)
    }));

    res.render('report-alumnos-por-curso', { coursesWithStudents });
  } catch (error) {
    console.error('Error generando reporte de alumnos por curso:', error);
    res.status(500).send('Error en el servidor');
  }
}

export async function getCuposDisponibles(req, res) {
  try {
    const courses = await Course.find({ status: 'Activo' });

    const availableCourses = courses.map(course => {
      const taken = course.enrolledStudents.length;
      const availability = course.courseCapacity - taken;

      return {
        name: course.courseName,
        capacity: course.courseCapacity,
        taken,
        availability
      };
    });

    res.render('report-cupos-disponibles', { availableCourses });
  } catch (error) {
    console.error('Error generando reporte de cupos:', error);
    res.status(500).send('Error en el servidor');
  }
}

export async function getCursosCompletos(req, res) {
  try {
    const courses = await Course.find({});

    const full = courses
      .filter(course => course.enrolledStudents.length >= course.courseCapacity)
      .map(course => ({
        name: course.courseName,
        enrolled: course.enrolledStudents.length,
        capacity: course.courseCapacity
      }));

    res.render('report-cursos-completos', { full });
  } catch (error) {
    console.error('Error generando reporte de cursos completos:', error);
    res.status(500).send('Error en el servidor');
  }
}

export async function renderAttendanceReport(req, res) {
  try {
   
    const allCourses = await Course.find({}).sort({ courseName: 1 });

   
    const { courseId } = req.query;

    let attendanceReport = null;
    let selectedCourse = null;

   
    if (courseId) {
      
      attendanceReport = await Attendance.findOne({ courseId: courseId })
        .populate({
          path: 'courseId', 
          select: 'courseName enrolledStudents' 
        })
        .populate({
          path: 'classes.presents.studentId', 
          model: 'Student', 
          select: 'name lastname' 
        });
      
      
      selectedCourse = await Course.findById(courseId).populate({
        path: 'enrolledStudents.idStudent',
        //model: 'Student',
        //select: 'name lastname'
      });
      console.log('>>> ALUMNOS INSCRIPTOS EN EL CURSO:');
      console.log(JSON.stringify(selectedCourse.enrolledStudents, null, 2));
      console.log('Alumnos inscritos en el curso:', JSON.stringify(selectedCourse.enrolledStudents, null, 2));

    }

    
    res.render('report-asistencia', {
      allCourses,
      selectedCourse,
      attendanceReport,
      title: "Reporte de Asistencia"
    });

  } catch (error) {
    console.error('Error al generar el reporte de asistencia:', error);
    res.status(500).send('Error interno del servidor');
  }
}

