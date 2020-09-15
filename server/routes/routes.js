const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
// const usuario = require('../models/usuario');

const {verificaToken, verificaAdmin_Role} = require('../middlewares/autentificacion');
const app = express();

app.get('/usuario', verificaToken, function(req, res) {

    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });


    let estado = req.query.estado || true;    //filtrr por estado

    let desde = req.query.desde || 0;   
    desde = Number(desde);

    let limite = req.query.limite || 5; // obtener los primeros "5" resultados o los que el usuario decida
    limite = Number(limite);

    Usuario.find({estado:estado}, 'nombre email role estado google img')
    .skip(desde)
    .limit(limite)
    .exec((err, usuario) =>{

        if (err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        Usuario.count({estado:estado}, (err, conteo) =>{

            res.json({
                ok: true,
                usuario,
                conteo
            });

        });

    });
    
});

app.post('/usuario', [verificaToken, verificaAdmin_Role], (req, res) => {

   let body = req.body;

   let usuario = new Usuario({
       nombre: body.nombre,
       email: body.email,
       password: bcrypt.hashSync( body.password, 10),
       role: body.role
   });

   usuario.save((err, usuarioDB) => {
       if (err ){
           return res.status(400).json({
               ok:false,
               err
           });
       }

       res.json({
           ok:true,
           usuario:usuarioDB
       });
   });  
})

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {

   let id = req.params.id
   let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
    //    _.pick Sirve para resivir solo datos deseados, solo se modificaran los parametros que estan dentro de los corchetes
   Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, usuarioDB) => {
        
        if (err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

       res.json({
           ok:true,
           usuario: usuarioDB
       })

   });

})

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
   let id = req.params.id

   let cambiaEstado = {estado:false};

   Usuario.findByIdAndUpdate(id, cambiaEstado, {new: true}, (err, usuarioBorrado) => {
//    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        if (!usuarioBorrado){
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok:true,
            usuario: usuarioBorrado
        });

   });
});

module.exports = app;