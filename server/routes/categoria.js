const express = require('express');

const {verificaToken, verificaAdmin_Role} = require('../middlewares/autentificacion')

const _ = require('underscore');

const app = express();

const Categoria = require('../models/categoria');


// ============================
// Mostrar todas las categorias
// ============================

app.get('/categoria', verificaToken,(req, res) => {
    
    Categoria.find({}, 'descripcion usuario')//Se mostraran solo la descripcion y el usaurio
    .sort('descripcion')//  Orden alfabetico por descricion
    .populate('usuario', 'nombre email') // Son los datos del usuario que quiero que se muestren
    .exec((err, categoria) => {
        if  (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Categoria.count({}, (err, conteo) =>{

            res.json({
                ok: true,
                categoria,
                conteo
            });
    
        });
    });
})

// ============================
// Mostrar una categoria por ID
// ============================
app.get('/categoria/:id', (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaBD) => {
        if (err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaBD) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBD
        });
    });
});

// ============================
// Agregar una categoria
// ============================
app.post('/categoria', verificaToken,(req, res) => {
    let body = req.body

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
        
    });

    categoria.save((err, categoriaBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok:true,
            categoria: categoriaBD
        });

    });

});


// ============================
// Actualizar una categoria
// ============================
app.put('/categoria/:id', [verificaToken], function (req, res) {

    let id = req.params.id
    let body = _.pick(req.body, ['descripcion']);
    
    // {new: true} sirve para mandar el nuevo registro actualizado
    Categoria.findByIdAndUpdate(id, body, {new: true, runValidators: true},(err, categoriaDB) => {
         
         if (err){
             return res.status(400).json({
                 ok:false,
                 err
             });
         }
 
        res.json({
            ok:true,
            categoria: categoriaDB
        })
 
    });
 
 })


// ============================
// Agregar una categoria
// ============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id 
    
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
         if (err){
             return res.status(400).json({
                 ok:false,
                 err
             });
         }
 
         if (!categoriaBorrada){
             return res.status(400).json({
                 ok:false,
                 err: {
                     message: 'Categoria no encontrada'
                 }
             });
         }
 
         res.json({
             ok:true,
             usuario: categoriaBorrada
         });
 
    });
 });



module.exports = app;