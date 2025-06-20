import { readData } from '../utils/functions.js'
const DB_FILE = './models/teachers.json'

export async function getAllTeachers() {
    try {
        const data = await readData(DB_FILE)
        return data
      } catch(error) {
        console.error('Error al leer el archivo')
        throw error
      }
}