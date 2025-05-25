import { readData, writeData } from '../utils/functions.js';

const DB_FILE = './models/students.json';

//Función para normalizar texto (sin tildes y en minúscula)
const normalize = str =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

//Función para registrar un nuevo alumno
export async function registerStudent(req, res) {
    try {
        const students = await readData(DB_FILE);

        // Obtener datos del formulario.
       
        const {
            studentName,      
            studentLastname,  
            dni,              
            email,     
            tel      
        } = req.body;

        // Mapeo de nombres de formulario a nombres de JSON
        const newStudentData = {
            studentName,
            studentLastname, 
            dni: dni.toString(), // Asegurar que DNI sea string
            email, 
            tel: tel.toString() // Asegurar que tel sea string
        };

        // Validaciones
        if (!newStudentData.studentName || !newStudentData.studentLastname || !newStudentData.dni || !newStudentData.email || !newStudentData.tel) {
            return res.status(400).render('register-students', {
                error: 'Todos los campos son obligatorios.',
                formData: newStudentData // Para rellenar el formulario con los datos previos
            });
        }

        // Verificar si el DNI ya existe
        if (students.some(s => s.dni === newStudentData.dni)) {
            return res.status(400).render('register-students', {
                error: 'Ya existe un estudiante con ese DNI.',
                formData: newStudentData
            });
        }

        // Verificar si el email ya existe
        if (students.some(s => normalize(s.email) === normalize(newStudentData.email))) {
            return res.status(400).render('register-students', {
                error: 'Ya existe un estudiante con ese correo electrónico.',
                formData: newStudentData
            });
        }

        // Generar un nuevo _id (simple incremento)
        let newId = 1;
        if (students.length > 0) {
            newId = Math.max(...students.map(s => s._id)) + 1;
        }

        const studentToAdd = {
            _id: newId,
            ...newStudentData
        };

        students.push(studentToAdd);
        await writeData(DB_FILE, students);

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
