const express = require('express');
let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
let app = express();
let Categoria = require('../models/categoria');

//===============================
// Mostrar todas las categorias
//===============================
app.get('/categoria', (request, response) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre')
        .exec((error, categorias) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    error: error.message
                });
            }
            response.json({
                ok: true,
                categorias
            });
        });
});

//===============================
// Mostrar una categoria por ID
//===============================
app.get('/categoria/:id', verificaToken, (request, response) => {
    let id = request.params.id;
    Categoria.findById(id, (error, categoriaDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error: error.message
            });
        }
        if (!categoriaDB) {
            return response.status(400).json({
                ok: false,
                message: 'La categoria no existe'
            });
        }
        response.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//===============================
// Crear una categoria
//===============================
app.post('/categoria', verificaToken, (request, response) => {
    // regresa la nueva categoria
    // request.usuario._id
    let body = request.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: request.usuario._id,
        estado: true
    });
    categoria.save((error, categoriaDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error: error.message
            });
        }
        if (!categoriaDB) {
            return response.status(400).json({
                ok: false,
                error: error.message
            });
        }
        response.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//===============================
// Actualizar categoria
//===============================
app.put('/categoria/:id', verificaToken, (request, response) => {
    let id = request.params.id;
    let body = request.body;

    let descCategoria = {
        descripcion: body.descripcion
    }
    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (error, categoriaDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }
        if (!categoriaDB) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//===============================
// Eliminar una categoria
//===============================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (request, response) => {
    //Solo un administrador puede borrar una categoria
    //Categoria.findByIdAndRemove
    let id = request.params.id;
    Categoria.findByIdAndRemove(id, (error, categoriaDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }
        if (!categoriaDB) {
            return response.status(400).json({
                ok: false,
                error: {
                    message: 'El id no existe'
                }
            });
        }
        response.json({
            ok: true,
            message: 'Categoria Borrada'
        });
    });
});


module.exports = app;