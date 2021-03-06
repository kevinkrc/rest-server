const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


let Schema = mongoose.Schema;

let rolesValidos ={
    values:['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} No es un rol valido'
};

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique:true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required:[true, 'La contraseña contraseña es obligatiora']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

usuarioSchema.methods.toJSON = function () {//  Se elimina informacion (password) para que esta no sea mostrada al usuario
  let user = this;
  let userObject = user.toObject();
  delete userObject.password;

  return userObject; 
};

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Usuario', usuarioSchema);
