const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario')

const app = express();


app.post('/login', (req, res) => {
    
    let body = req.body;

    // Se verifica si el email existe en la BD
    Usuario.findOne({email: body.email}, (err, usuarioBD) => {

        // En caso de que se presenta un error interno en la BD
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!usuarioBD){
            return res.status(400).json({
                ok:false,
                message: 'Usuario o contraseña incorrectos'
            });
        }
        //  metodo compareSync -> encripta la contraseña enviada por el usuario y la compara con la de la BD
        if (!bcrypt.compareSync(body.password, usuarioBD.password)){
            return res.status(400).json({
                ok: false,
                message: 'Usuario o (contraseña) incorrectos'
            });
        }

        let token = jwt.sign({
            usuario: usuarioBD,            
        }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN});

        res.json({
            ok: true,
            usuario: usuarioBD,
            token
        });

    });
});




module.exports = app;