import express from 'express';
import {
  getCursosCompletos,
  getAlumnosPorCurso,
  getCuposDisponibles,
  renderAttendanceReport
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/cursos-completos', getCursosCompletos);
router.get('/alumnos-por-curso', getAlumnosPorCurso);
router.get('/cupos-disponibles', getCuposDisponibles);
router.get('/asistencia', renderAttendanceReport);

export default router;
