const jwt = require('jsonwebtoken');
//================================
// Verificar Token
//================================
let verificaToken = (request, response, next) => {
    let token = request.get('token');
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if (error) {
            return response.status(401).json({
                ok: false,
                error: error.message
            });
        }
        request.usuario = decoded.usuario;
        next();
    })
}

//================================
// Verificar AdminRole
//================================
let verificaAdminRole = (request, response, next) => {
    let usuario = request.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return response.status(401).json({
            ok: false,
            error: 'El usuario no es Administrador'
        });
    }
}

//================================
// Verificar Token Imagen
//================================
let verificaTokenImg = (request, response, next) => {
    let token = request.query.token;
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if (error) {
            return response.status(401).json({
                ok: false,
                error: error.message
            });
        }
        request.usuario = decoded.usuario;
        next();
    })
}

module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenImg
}