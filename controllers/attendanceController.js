import mongoose from 'mongoose'
import Attendance from '../models/Attendance.js'
import Course from '../models/Course.js'
import Student from '../models/Student.js'
import { format } from 'date-fns'

const DAY_NAME_TO_NUMBER = {
  "Lunes": 1,
  "Martes": 2,
  "Miércoles": 3,
  "Jueves": 4,
  "Viernes": 5,
};

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

export async function getAllAttendances() {
  return await Attendance.find({});
}

export async function addAttendanceEntry(courseId, days) {
  try {
    const classDates = generateNextNDates(days, 30);

    const classes = classDates.map((dateStr, index) => ({
      numberClass: index + 1,
      date: dateStr,
      presents: []
    }));

    await Attendance.create({
      courseId: new mongoose.Types.ObjectId(courseId),
      classes
    });

  } catch (error) {
    console.error('Error al inicializar asistencia:', error);
    throw error;
  }
}

export async function renderAttendanceForm(req, res) {
  try {
    const courses = await Course.find().populate('enrolledStudents.idStudent');
    const students = await Student.find();
    const { courseId, classNumber } = req.query;

    let selectedStudents = [];
    let selectedClassNumber = null;

    const selectedCourse = await Course.findById(courseId).populate('enrolledStudents.idStudent');

    if (selectedCourse) {
      selectedStudents = selectedCourse.enrolledStudents.map(e => e.idStudent);
    }

    if (classNumber) {
      selectedClassNumber = parseInt(classNumber);
    }

    res.render('take-attendance', {
      courses,
      students: selectedStudents,
      selectedCourseId: courseId,
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

    console.log('Buscando asistencia para el courseId:', courseId); // LOG ERROR EN TOMAR ASISTENCIA

    const attendance = await Attendance.findOne({ courseId });

    if (!attendance) {
      return res.status(404).send("No se encontró el registro de asistencia");
    }

    const classObj = attendance.classes.find(c => c.numberClass === parseInt(classNumber));
    if (!classObj) {
      return res.status(404).send("Clase no encontrada");
    }

    let presentObjects = [];

    if (Array.isArray(presents)) {
      presentObjects = presents.map(id => ({ studentId: new mongoose.Types.ObjectId(id) }));
    } else if (typeof presents === 'string') {
      presentObjects = [{ studentId: new mongoose.Types.ObjectId(presents) }];
    }

    classObj.presents = presentObjects;

    await attendance.save();

    res.redirect(`/admin/take-attendance?courseId=${courseId}&classNumber=${classNumber}`);
  } catch (error) {
    console.error('Error registrando asistencia:', error);
    res.status(500).send('Error al guardar asistencia.');
  }
}
