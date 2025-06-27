import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js'; // Ajusta si tu ruta es diferente

// Tu URI de conexión MongoDB Atlas
const MONGO_URI = 'mongodb+srv://admin:aprender+@aprenderdb.j9uinj5.mongodb.net/?retryWrites=true&w=majority&appName=AprenderDB';

async function createAdminUser() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const exists = await User.findOne({ username: 'admin' });

    if (exists) {
      console.log('Usuario admin ya existe.');
    } else {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Usuario admin creado con contraseña: admin');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creando usuario admin:', error);
  }
}

createAdminUser();
