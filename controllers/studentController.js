import { readData, writeData } from '../utils/functions.js';

const DB_FILE = './models/students.json';

//Función para normalizar texto (sin tildes y en minúscula)
const normalize = str =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export async function getFilteredStudents(req, res) {
  const { name, dni } = req.query;
  const students = await readData(DB_FILE);

  let alumno = null;

  if (dni) {
    alumno = students.find(s => s.dni.toString() === dni);
  } else if (name) {
    alumno = students.find(s => {
      const fullName = `${s.studentName} ${s.studentLastname}`.toLowerCase();
      return fullName.includes(name.toLowerCase());
    });
  }

  res.render('admin/buscar', { alumnoEncontrado: alumno });
}

export async function updateStudent(req, res) {
  const { id } = req.params;
  const newData = req.body;

  const students = await readData(DB_FILE);
  const index = students.findIndex(s => s._id === parseInt(id));

  if (index === -1) {
    return res.status(404).send("Alumno no encontrado");
  }

  students[index] = { ...students[index], ...newData };
  await writeData(DB_FILE, students);

  res.redirect('/admin/buscar');
}

export async function deleteStudent(req, res) {
  const { id } = req.params;

  let students = await readData(DB_FILE);
  students = students.filter(s => s._id !== parseInt(id));

  await writeData(DB_FILE, students);
  res.redirect('/admin/buscar');
}
