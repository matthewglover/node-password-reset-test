const express = require('express');
const app = express();
const dynamicRoutes = require('./dynamic_routes');
const staticRoutes = express.static('public');

app.use(dynamicRoutes);
app.use(staticRoutes);

app.listen(3000);
