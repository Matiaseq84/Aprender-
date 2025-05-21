import { writeData } from "../utils/functions.js";
import { Course } from "../classes/Course.js"
const DB_FILE = './models/courses.json'

export async function registerCourse(req, res) {
    const { courseName, coursePrice, capacity, hours, days, teacher, status }  = req.body
    let schedule = []
    
    for (let i = 0 ; i < days.length; i++) {
        schedule.push({
            day: days[i],
            hour: hours[i]
        })      
    }

    const newCourse = new Course(
        
    )
}