import { readData, writeData } from '../utils/functions.js';
import Student from '../models/students.js';

const DB_FILE = './models/students.json';

//Función para normalizar texto (sin tildes y en minúscula)
const normalize = str =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

//Función para registrar un nuevo alumno
export async function registerStudent(req, res) { 
    try {
  

        // Obtener datos del formulario.
       
        const {
            studentName,      
            studentLastname,  
            dni,              
            email,     
            tel      
        } = req.body;

        // Mapeo de nombres de formulario a nombres de JSON
        
        // Validaciones
        if (!studentName || !studentLastname || !dni || !email || !tel) {
          return res.status(400).render('register-students', {
            error: 'Todos los campos son obligatorios.',
            formData: req.body// Para rellenar el formulario con los datos previos
          });
        }
        
        const exists = await Student.findOne({ $or: [{ dni }, { email }] })
        if(exists) {
          return res.status(400).render('register-stduents', {
            error: 'Ya existe un estudiante con ese DNI o .',
            formData: newStudentData
          })
        }

        
        const newStudentData = new Student({
            studentName,
            studentLastname, 
            dni: dni.toString(), // Asegurar que DNI sea string
            email, 
            tel: tel.toString() // Asegurar que tel sea string
        });

       

        await newStudentData.save()

        // Para pasar los datos del formulario de vuelta y limpiarlos si es necesario
        res.render('register-students', {
            success: 'Estudiante registrado exitosamente.',
            formData: {} // Limpiar el formulario
        });

    } catch (error) {
        console.error("Error registrando estudiante:", error);
        res.status(500).render('register-students', {
            error: 'Error interno del servidor al registrar el estudiante.',
            formData: req.body // Devolver los datos ingresados
        });
    }
}


//Función para buscar un alumno por nombre o dni y renderizar la vista con el resultado

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

  res.render('buscar', { alumnoEncontrado: alumno });
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

export async function getAllStudents(req, res) {
  const data = await readData(DB_FILE)
  return data
}

export async function getStudentByDni(dni) {
  
  const students = await getAllStudents(DB_FILE)
  
  const student = students.find( student => student.dni === dni)

  return student

}

export async function getStudentById(id) {
  
  console.log('desde aquí', id)
  const students = await getAllStudents(DB_FILE)
  
  const student = students.find( student => student._id === id)

  return student

}