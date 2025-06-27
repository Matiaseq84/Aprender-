// resetAdminUser.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

// ⚠️ Tu URI de conexión a MongoDB Atlas
const MONGO_URI = 'mongodb+srv://admin:aprender+@aprenderdb.j9uinj5.mongodb.net/?retryWrites=true&w=majority&appName=AprenderDB';

async function resetAdminUser() {
  try {
    await mongoose.connect(MONGO_URI);

    // Eliminar si ya existe
    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      await User.deleteOne({ username: 'admin' });
      console.log('🗑️ Usuario admin eliminado');
    }

    // Crear nuevo usuario con contraseña hasheada
    const hashedPassword = await bcrypt.hash('admin', 10);

    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ Usuario admin creado con contraseña hasheada');
  } catch (error) {
    console.error('❌ Error al resetear el usuario admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetAdminUser();
