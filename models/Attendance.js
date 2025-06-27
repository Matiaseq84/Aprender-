// models/Attendance.js
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  classes: [{
    numberClass: Number,
    date: String,
    presents: [{
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }
    }]
  }]
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
