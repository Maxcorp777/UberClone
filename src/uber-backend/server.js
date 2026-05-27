// server.js - Entry point for the UberClone backend
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // LIBRERÍA NUEVA: Permite conexiones externas (CORS)
const path = require('path'); // MÓDULO NATIVO: Ayuda a manejar rutas de carpetas fijas

// APRENDIZAJE: Obligamos a dotenv a buscar el archivo .env exactamente en esta carpeta
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); 

// APRENDIZAJE: Importamos el modelo de Usuario para interactuar con la colección de Atlas
const User = require('./models/User');

const app = express();

// APRENDIZAJE: Middlewares obligatorios
app.use(cors()); // Le dice al backend: "Acepta peticiones de otros dispositivos (como el emulador)"
app.use(express.json()); // Permite que el servidor entienda la información que llega en formato JSON

// Conexión limpia a MongoDB Atlas usando la variable de entorno
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🚀 [SUCCESS] Connected successfully to MongoDB Atlas (uberclone)'))
  .catch((error) => console.error('❌ [ERROR] Database connection failed:', error));


// ==========================================
// 1. ENDPOINT: REGISTRAR USUARIO (HTTP POST)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    // APRENDIZAJE: Extraemos los datos que el celular escribió en los TextInput
    const { fullName, phoneNumber, email, password, gender, language } = req.body;

    // APRENDIZAJE: Buscamos en Atlas si ya existe alguien con ese mismo correo
    const userExists = await User.findOne({ email });
    if (userExists) {
      // Si existe, frenamos el código y respondemos con un código de error 400
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // APRENDIZAJE: Si el correo es nuevo, creamos el molde del usuario con los datos recibidos
    const newUser = new User({
      fullName,
      phoneNumber,
      email,
      password, // En producción se encripta, con fines académicos se guarda plano
      gender,
      language
    });

    // APRENDIZAJE: Guardamos el registro de forma real en la nube de Atlas
    const savedUser = await newUser.save();

    // Respondemos al celular con un estado 201 (Creado con éxito) y le mandamos el usuario con su nuevo _id
    res.status(201).json(savedUser);

  } catch (error) {
    console.error('❌ Error en el registro:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// ==========================================
// 2. ENDPOINT: OBTENER PERFIL POR ID (HTTP GET)
// ==========================================
app.get('/api/users/profile/:id', async (req, res) => {
  try {
    // APRENDIZAJE: Buscamos en la base de datos usando el ID que viaja en la URL de la petición
    const user = await User.findById(req.params.id).select('-password'); // .select('-password') oculta la contraseña por seguridad
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Si lo encuentra, le manda el JSON con los datos del perfil al celular
    res.json(user);
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// COMENTARIO DIDÁCTICO: Endpoint de prueba rápido para verificar que el backend responde
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working perfectly!' });
});


// Configuración del puerto del servidor y apertura de red
const PORT = process.env.PORT || 5000;

// APRENDIZAJE: Añadimos '0.0.0.0' para obligar al servidor a escuchar peticiones por tu IP local (192.168.1.73)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📡 Backend server explicitly listening on port ${PORT}`);
});