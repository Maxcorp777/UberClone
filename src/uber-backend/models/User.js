const mongoose = require('mongoose');

// 📝 USER SCHEMA: Define qué datos son obligatorios y sus límites en la base de datos
const UserSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true, 
    maxlength: 50 // Exigencia de la rúbrica institucional: Tope de 50 letras
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true // Candado: Evita que dos personas se registren con el mismo correo
  },
  password: { 
    type: String, 
    required: true 
  },
  gender: { 
    type: String, 
    default: 'Not specified' // Atributo solicitado en la guía académica
  },
  language: { 
    type: String, 
    default: 'Spanish' // Atributo solicitado en la guía académica
  }
}, { 
  timestamps: true // Guarda de forma automática el día y la hora exacta del registro
});

module.exports = mongoose.model('User', UserSchema);