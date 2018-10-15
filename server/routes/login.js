const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (resquest, response) => {

    let body = resquest.body;
    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error: error.message
            });
        }
        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                error: '(Usuario) o contraseña incorrectos'
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return response.status(400).json({
                ok: false,
                error: 'Usuario o (contraseña) incorrectos'
            });
        }
        let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })
        response.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});

// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
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

app.post('/google', async(request, response) => {
    let token = request.body.idtoken;
    let googleUser = await verify(token).catch(e => {
        return response.status(403).json({
            ok: false,
            error: e
        });
    });
    Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error: error.message
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return response.status(400).json({
                    ok: false,
                    error: {
                        message: 'Debe usar autenticación normal.'
                    }
                });
            } else {
                let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })
                response.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //El usuario es nuevo.
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';
            usuario.save((error, usuarioDB) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        error: error.message
                    });
                }
                let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })
                response.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            })
        }
    });
});

module.exports = app;