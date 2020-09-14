const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

// Configuraciónes de Google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
    
}
  

app.post('/google', async (req, res) => {

    let token = req.body.idtoken;
    // console.log(token);
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(402).json({
                ok: false,
                err: e
            });
        });
    Usuario.findOne({email: googleUser.email}, (err, usuarioBD) => {
        if (err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuarioBD) {
            if (usuarioBD.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usuar autenticación normal'
                    }
                });

            }else{
                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN});

                
                return res.json({
                    ok: true,
                    usuario: usuarioBD,
                    token,
                });
            }
        }else {//   En caso de que el usuario no exista en la base de datos, se registra y queda como nuevo usuario
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN});

                
                return res.json({
                    ok: true,
                    usuario: usuarioBD,
                    token,
                });
            });
        }
    });
});

module.exports = app;