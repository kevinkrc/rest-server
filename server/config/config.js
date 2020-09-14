// ============================
// Puerto

const { mongo } = require("mongoose");

// ============================
process.env.PORT = process.env.PORT || 3000;

// ============================
// Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV ||'dev';

// ============================
// Vencimiento del token
// ============================
// 60 Segundo
// 60 Minutos
// 24 Horas
// 30 Dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ============================
// SEED de autenticacion
// ============================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';



// ============================
// Base de Datos
// ============================
let urlDB;

if (process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// ============================
// Google client ID
// ============================
process.env.CLIENT_ID = process.env.CLIENT_ID || '314746990094-n3bellnrj8jmfrh94c4naa6ms68bmpem.apps.googleusercontent.com';





