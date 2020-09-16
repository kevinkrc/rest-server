const express = require('express');

const fileUpload = require('express-fileupload')
const app = express();
const fs = require('fs');
const path = require('path');
// moddels
let Usuario = require('../models/usuario');
let Producto = require('../models/producto');
const producto = require('../models/producto');


// Default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function (req, res) {    
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message:'No se ha seleccionado ningún archivo'
            }
        });
    }

    let tipoValidos = ['productos', 'usuarios'];
    if (tipoValidos.indexOf(tipo) < 0  ) {
        return res.status(400).json({
            ok: false,
            message: 'Las extenciones permitidas son' + tipoValidos.join(', '),            
        });
    }
    // Se crea el nombre del archivo
    let archivo = req.files.archivo;    
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length-1]

    // Extenciones validas
    let extencionesValidas = ['png', 'jpg', 'gif', 'jpge'];

    if (extencionesValidas.indexOf(extension) < 0) {// En caso de que la extencion que tiene el archivo no es valida
        return res.status(400).json({               // se manda una notificacion de las extenciones permitidas
            ok: false,
            message: 'Las extenciones permitidas son' + extencionesValidas.join(', '),
            ext: extension
        });
    }

    // Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds() }.${extension}`;

    archivo.mv(`uploads/${tipo}/${ nombreArchivo }`, (err) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);            
        }else{
            imagenProducto(id, res, nombreArchivo);
        }
    })


});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioBD) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioBD){
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'usuario no existe'
                }
            });
        }

        borraArchivo(usuarioBD.img, 'usuarios');

        usuarioBD.img = nombreArchivo;
        usuarioBD.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });

    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoBD) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoBD){
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'el producto no existe'
                }
            });
        }

        borraArchivo(productoBD.img, 'productos');

        productoBD.img = nombreArchivo;
        productoBD.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });

    });
}


function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
        if (fs.existsSync(pathImagen)){
            fs.unlinkSync(pathImagen);
        }
}


module.exports = app;