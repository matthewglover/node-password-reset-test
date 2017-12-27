const express = require('express');
const BodyParser = require('body-parser');
const PasswordReset = require('./password_reset');
const dynamicRoutes = express();

dynamicRoutes.use(BodyParser.urlencoded({ extended: true }));

dynamicRoutes.post('/forgot', PasswordReset.forgot);

module.exports = dynamicRoutes;
