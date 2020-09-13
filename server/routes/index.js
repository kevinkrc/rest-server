const express = require('express');
const app = express();

app.use(require('./routes'));
app.use(require('./login'));


module.exports = app;