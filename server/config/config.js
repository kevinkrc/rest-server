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
// Base de Datos
// ============================
let urlDB;

// if (process.env.NODE_ENV === 'dev'){
//     urlDB = 'mongodb://localhost:27017/cafe';
// }else{
    urlDB = 'mongodb+srv://necvin:E3VXtW49L0j57ihe@cluster0.goaq7.mongodb.net/cafe?retryWrites=true&w=majority';
// }

process.env.URLDB = urlDB;







