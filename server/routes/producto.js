const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
let app = express();
let Producto = require('../models/producto');

//===================================
// Obtener productos
//===================================
app.get('/productos', verificaToken, (request, response) => {
    //trae todos los productos
    //populate categoria, usuario
    //paginado
    let desde = Number(request.query.desde) || 0;
    let limite = Number(request.query.limite) || 5;
    Producto.find({})
        .populate('usuario', 'nombre, email')
        .populate('categoria', 'descripcion')
        .skip(desde)
        .limit(limite)
        .sort('precioUni')
        .exec((error, productos) => {
            if (error) {
                response.status(500).json({
                    ok: false,
                    error
                })
            }
            response.json({
                ok: true,
                productos
            })
        });
});

//===================================
// Obtener producto por ID
//===================================
app.get('/productos/:id', verificaToken, (request, response) => {
    //populate categoria, usuario
    let id = request.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre, email')
        .populate('categoria', 'descripcion')
        .exec((error, productoDB) => {
            if (error) {
                response.status(500).json({
                    ok: false,
                    error
                })
            }
            if (!productoDB) {
                response.status(400).json({
                    ok: false,
                    message: 'El producto no existe'
                })
            }
            response.json({
                ok: true,
                producto: productoDB
            })
        });
});

//===================================
// Buscar productos
//===================================
app.get('/productos/buscar/:termino', verificaToken, (request, response) => {
    let termino = request.params.termino;
    let regex = new RegExp(termino, 'i');
    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((error, productos) => {
            if (error) {
                response.status(500).json({
                    ok: false,
                    error
                })
            }
            response.json({
                ok: true,
                productos
            })
        });
});

//===================================
// Crear producto
//===================================
app.post('/productos', verificaToken, (request, response) => {
    // grabar el usuario
    // grabar una categoria del listado
    let body = request.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: true,
        categoria: body.categoria,
        usuario: request.usuario._id
    });
    producto.save((error, productoDB) => {
        if (error) {
            response.status(500).json({
                ok: false,
                error
            })
        }
        if (!productoDB) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            producto: productoDB
        })
    });
});

//===================================
// Actualizar producto
//===================================
app.put('/productos/:id', verificaToken, (request, response) => {
    // grabar el usuario
    // grabar una categoria del listado
    let id = request.params.id;
    let body = request.body;
    Producto.findById(id, (error, productoDB) => {
        if (error) {
            response.status(500).json({
                ok: false,
                error
            })
        }
        if (!productoDB) {
            response.status(400).json({
                ok: false,
                error: {
                    mensaje: 'El ID de producto no existe.'
                }
            })
        }
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;
        productoDB.save((error, productoGuardado) => {
            if (error) {
                response.status(500).json({
                    ok: false,
                    error
                })
            }
            return response.json({
                ok: true,
                producto: productoGuardado
            });
        });
    });
});

//===================================
// Eliminar producto
//===================================
app.delete('/productos/:id', verificaToken, (request, response) => {
    // cambiar el valor del campo disponible a false
    let id = request.params.id;
    Producto.findById(id, (error, productoDB) => {
        if (error) {
            response.status(500).json({
                ok: false,
                error
            })
        }
        if (!productoDB) {
            response.status(400).json({
                ok: false,
                error: {
                    mensaje: 'El producto no existe.'
                }
            })
        }
        productoDB.disponible = false;
        productoDB.save((error, productoBorrado) => {
            if (error) {
                response.status(500).json({
                    ok: false,
                    error
                })
            }
            if (!productoBorrado) {
                response.status(400).json({
                    ok: false,
                    error: {
                        mensaje: 'El producto no existe.'
                    }
                })
            }
            return response.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            });
        })
    });
});


module.exports = app;