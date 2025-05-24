import express from 'express';
import { getFilteredStudents, updateStudent, deleteStudent } from '../controllers/studentController.js';

const router = express.Router();

router.get('/search', getFilteredStudents);
router.post('/update/:id', updateStudent);
router.post('/delete/:id', deleteStudent);

export default router;
