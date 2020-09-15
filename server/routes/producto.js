const express = require('express');
const { verificaToken } = require('../middlewares/autentificacion');
const _ = require('underscore');
let app = express();
let Producto = require('../models/producto');


// ==============================
// Obtener todos los productos
// ==============================
app.get('/producto', verificaToken,(req, res) => {

    let limite = req.query.limite || 5; // obtener los primeros "5" resultados o los que el usuario decida
    limite = Number(limite);

    Producto.find({disponible:true}, 'nombre precioUni descripcion categoria')
    .sort('nombre')
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .limit(limite)
    .exec((err, producto) => {
        if  (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Producto.count({}, (err, conteo) =>{

            res.json({
                ok: true,
                producto,
                conteo
            });
    
        });
    });
});

// ==============================
// Obtener producto por ID
// ==============================
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, productoBD) => {
        if (err) {
            return req.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoBD) {
            return req.status(500).json({
                ok: false,
                err:{
                    message: 'El id del producto es incorrecto'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBD
        });
    });
});

// ==============================
// Buscar producto
// ==============================

app.get('/producto/buscar/:termino', verificaToken,(req, res) => {

    let termino = req.params.termino
    let regex = new RegExp(termino, 'i');
    /* 
    Obtiene todos los registros con expresiones similares de la BD
    la letra "i" es para que tome en cuenta mayusculas y minusculas
    */   

    Producto.find({nombre:regex})
    .populate('categoria', 'descripcion')
    .exec((err, producto) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok:true,
            producto: producto
        });

    });
});


// ==============================
// Crear producto nuevo
// ==============================
app.post('/producto', verificaToken,(req, res) => {
    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoBD
        });
    });
});

// ==============================
// Actualiza un producto
// ==============================
app.put('/producto/:id', (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion', 'nombre', 'precioUni', 'disponible','categoria']);

    Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productoBD) => {
        if (err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

       res.json({
           ok:true,
           categoria: productoBD
       })
    });

});

// ==============================
// Borra un producto
// ==============================

app.delete('/producto/:id', (req, res) => {
    let id = req.params.id;

    let cambiaEstado = {disponible:false}

    Producto.findByIdAndUpdate(id, cambiaEstado, {new: true}, (err, productoDesabilitado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoDesabilitado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok:true,
            msj:{
                message: 'El siguiente producto fue desabilitado'
            },
            productoDesabilitado
            
        });

    })

});


module.exports = app;