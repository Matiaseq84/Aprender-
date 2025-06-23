import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema({
  courseName: {type: String, required: true, unique: true},
  coursePrice: {type: Number, required: true },
  courseCapacity: {type: Number, required: true },
  schedule: [{
    day: {type: String},
    hour: {type: String}
  }],
  teacher: {type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true},
  status: {type: String, required: true},
  enrolledStudents: [
    {
      idStudent: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'}
    }
  ]

}, {timestamps: true})

const Course = mongoose.model('Course', CourseSchema)

export default Course