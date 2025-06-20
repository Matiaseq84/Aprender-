import express from 'express';
import { getFilteredCourses, updateCourseData, deleteCourseData } from '../controllers/courseController.js';

const router = express.Router();

router.get('/search', getFilteredCourses);
router.post('/update/:id', updateCourseData);
router.post('/delete/:id', deleteCourseData);

export default router;

