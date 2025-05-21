import { readData, writeData } from '../utils/functions.js'
const DB_FILE = './models/teachers.json'

export async function getAllTeachers() {
    const data = await readData(DB_FILE)
    return data
}