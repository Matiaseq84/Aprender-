import { readData, writeData } from "../utils/functions.js";
const DB_FILE = './models/courses.json'

export async function getAllCourses() {
    const data = await readData(DB_FILE)
    return data
}

export async function addCourse(data) {
    const courses = await getAllCourses()

    courses.push(data)

    writeData(DB_FILE, courses)
}