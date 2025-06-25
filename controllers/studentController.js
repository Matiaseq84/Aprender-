import Student from '../models/Student.js';
import mongoose from 'mongoose';


const normalize = str =>
  str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function isValidDni(dni) {
  return /^\d{7,10}$/.test(dni);
}


function isValidPhone(tel) {
  return /^\d{7,}$/.test(tel);
}

// Registrar un nuevo alumno
export async function registerStudent(req, res) {
  try {
    let { studentName, studentLastname, dni, email, tel } = req.body;

    studentName = normalize(studentName);
    studentLastname = normalize(studentLastname);
    dni = dni?.toString();
    tel = tel?.toString();
    email = email?.toLowerCase();

    if (!studentName || !studentLastname || !dni || !email || !tel) {
      return res.status(400).render('register-students', {
        error: 'Todos los campos son obligatorios.',
        formData: req.body
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).render('register-students', {
        error: 'Email inválido.',
        formData: req.body
      });
    }

    if (!isValidDni(dni)) {
      return res.status(400).render('register-students', {
        error: 'DNI inválido. Debe contener sólo números y tener entre 7 y 10 dígitos.',
        formData: req.body
      });
    }

    if (!isValidPhone(tel)) {
      return res.status(400).render('register-students', {
        error: 'Teléfono inválido. Debe contener sólo números y al menos 7 dígitos.',
        formData: req.body
      });
    }

    const exists = await Student.findOne({ $or: [{ dni }, { email }] });
    if (exists) {
      return res.status(400).render('register-students', {
        error: 'Ya existe un estudiante con ese DNI o email.',
        formData: req.body
      });
    }

    const newStudentData = new Student({
      studentName,
      studentLastname,
      dni,
      email,
      tel
    });

    await newStudentData.save();

    console.log(`Estudiante registrado: ${studentName} ${studentLastname} - DNI: ${dni}`);

    return res.render('register-students', {
      success: 'Estudiante registrado exitosamente.',
      formData: {}
    });

  } catch (error) {
    console.error("Error registrando estudiante:", error);
    return res.status(500).render('register-students', {
      error: 'Error interno del servidor al registrar el estudiante.',
      formData: req.body
    });
  }
}

export async function getFilteredStudents(req, res) {
  try {
    const { name, dni } = req.query;
    let alumno = null;

    if (dni) {
      alumno = await Student.findOne({ dni: dni.toString() });
    } else if (name) {
      const normalized = normalize(name);
      alumno = await Student.findOne({
        $or: [
          { studentName: { $regex: normalized, $options: 'i' } },
          { studentLastname: { $regex: normalized, $options: 'i' } }
        ]
      });
    }

    return res.render('buscar', { alumnoEncontrado: alumno });
  } catch (error) {
    console.error('Error buscando estudiante:', error);
    return res.status(500).send('Error en el servidor');
  }
}

export async function updateStudent(req, res) {
  try {
    console.log("req.params:", req.params);
    console.log("req.body:", req.body);

    const { id } = req.params;
    let newData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("ID inválido.");
    }

    if (newData.studentName) newData.studentName = normalize(newData.studentName);
    if (newData.studentLastname) newData.studentLastname = normalize(newData.studentLastname);
    if (newData.email) newData.email = newData.email.toLowerCase();
    if (newData.dni) newData.dni = newData.dni.toString();
    if (newData.tel) newData.tel = newData.tel.toString();

    if (newData.email && !isValidEmail(newData.email)) {
      return res.status(400).send("Email inválido.");
    }
    if (newData.dni && !isValidDni(newData.dni)) {
      return res.status(400).send("DNI inválido.");
    }
    if (newData.tel && !isValidPhone(newData.tel)) {
      return res.status(400).send("Teléfono inválido.");
    }

    if (newData.dni || newData.email) {
      const orConditions = [];
      if (newData.dni) orConditions.push({ dni: newData.dni });
      if (newData.email) orConditions.push({ email: newData.email });

      const exists = await Student.findOne({
        _id: { $ne: id },
        $or: orConditions
      });

      if (exists) {
        return res.status(400).send("DNI o email ya en uso por otro estudiante.");
      }
    }

    const updated = await Student.findByIdAndUpdate(id, newData, { new: true });

    if (!updated) {
      return res.status(404).send("Alumno no encontrado");
    }

    console.log(`Estudiante actualizado: ${updated.studentName} ${updated.studentLastname} - ID: ${id}`);
    return res.redirect('/admin/buscar');

  } catch (error) {
    console.error('Error actualizando estudiante:', error);
    return res.status(500).send("Error en el servidor");
  }
}

export async function deleteStudent(req, res) {
  try {
    const { id } = req.params;

    const deleted = await Student.findByIdAndDelete(id);

    if(!deleted) {
      return res.status(404).send("Alumno no encontrado");
    }

    console.log(`Estudiante eliminado - ID: ${id}`);

    return res.redirect('/admin/buscar');
  } catch (error) {
    console.error('Error eliminando estudiante:', error);
    return res.status(500).send("Error en el servidor");
  }
}

export async function getAllStudents(req, res) {
  try {
    const students = await Student.find({});
    return students;
  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    return [];
  }
}
