require('./config/config')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Habilitar carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

// Configuracion global de rutas
app.use(require('./routes/index'));

mongoose.connect(process.env.URL_DB, (error, response) => {
    if (error) throw error;
    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando por el puerto:', process.env.PORT);
})