import Teacher from '../models/Teacher.js'
import { readData } from '../utils/functions.js'
const DB_FILE = './models/teachers.json'

export async function initializeTeachers() {
  const teachers = [
    { name: 'Ana López', speciality: 'Programación' },
    { name: 'Carlos Gómez', speciality: 'Diseño Gráfico' },
    { name: 'Lucía Fernández', speciality: 'Administración de Empresas' },
    { name: 'Martín Rossi', speciality: 'Marketing Digital' },
    { name: 'Sofía Méndez', speciality: 'Producción Audiovisual' },
    { name: 'Diego Núñez', speciality: 'Contabilidad' }
  ]

  try {
    const existing =  await Teacher.countDocuments()
    if(existing === 0) {
      await Teacher.insertMany(teachers)
    }
  } catch(error) {
    console.error ('Error al inicializar profesores', error)
  }

}

export async function getAllTeachers() {
    try {
        const teachers = await Teacher.find({}, 'name _id')
        return teachers
    } 
    catch(error) {
        console.error('Error al obtener los profesores')
        throw new Error('Error al obtener los profesores')
      }
}

export async function getTeacherById(id) {
  try {
    const teacher = Teacher.findById(id)
    return teacher
  } 
  catch (error) {
    console.error('Error al obtener al docente')
    throw new Error('Error al obtener al docente')
  }
}