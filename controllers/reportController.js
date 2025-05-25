
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
  const enrollments = await readData(ENROLLMENTS_DB);
  const students = await readData(STUDENTS_DB);

  const cursosConAlumnos = courses.map(course => {
    const inscriptos = enrollments.filter(e => e.courseId === course.id);
    const alumnos = inscriptos
      .map(e => students.find(s => s._id === e.studentId))
      .filter(Boolean);

    return {
      name: course.name,
      alumnos
    };
  });

  res.render('report-alumnos-por-curso', { cursosConAlumnos });
}

//Reporte: Cupos disponibles por curso (solo cursos activos)
export async function getCuposDisponibles(req, res) {
  const courses = await readData(COURSES_DB);
  const enrollments = await readData(ENROLLMENTS_DB);

  const cursosConCupos = courses
    .filter(course => course.status === 'Activo' || 'on')//OJO QUE AHORA ES ON
    .map(course => {
      const inscriptos = enrollments.filter(e => e.courseId === course.id);
      const usados = inscriptos.length;
      const disponibles = parseInt(course.capacity || 0) - usados;

      return {
        name: course.name,
        capacity: course.capacity || 0,
        usados,
        disponibles
      };
    });

  res.render('report-cupos-disponibles', { cursosConCupos });
}

//Reporte: Cursos completos (cantidad de inscriptos igual o mayor al cupo)
export async function getCursosCompletos(req, res) {
  const courses = await readData(COURSES_DB);
  const enrollments = await readData(ENROLLMENTS_DB);

  const completos = courses
    .filter(course => course.capacity)
    .map(course => {
      const inscriptos = enrollments.filter(e => e.courseId === course.id);
      const inscriptosCount = inscriptos.length;

      if (inscriptosCount >= parseInt(course.capacity)) {
        return {
          ...course,
          inscriptos: inscriptosCount
        };
      }

      return null;
    })
    .filter(Boolean); // elimina los null

  res.render('report-cursos-completos', { completos });
}
