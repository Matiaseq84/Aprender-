import express from 'express';
import {
  getCursosCompletos,
  getAlumnosPorCurso,
  getCuposDisponibles
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/cursos-completos', getCursosCompletos);
router.get('/alumnos-por-curso', getAlumnosPorCurso);
router.get('/cupos-disponibles', getCuposDisponibles);

export default router;
