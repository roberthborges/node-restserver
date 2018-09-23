require('./config/config')
const express = require('express');
const app = express();
const user = require("./routers/user.js")
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}))
// parse application/json
app.use(express.json())

app.use(user)

app.listen(process.env.PORT, () => {
    console.log('Escuchando por el puerto:', process.env.PORT);
})