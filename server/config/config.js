//================================
// Puerto
//================================
process.env.PORT = process.env.PORT || 3000;

//================================
// Entorno
//================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//================================
// Base de datos
//================================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://cafe-user:qa123456@ds131697.mlab.com:31697/cafe';
}
process.env.URL_DB = urlDB;