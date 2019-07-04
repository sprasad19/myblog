const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const CONFIG = require('./config');
const app = express();
app.use('/uploads/posts', express.static('uploads/posts'));
app.use('/uploads/profile', express.static('uploads/profile'));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));



//Routes
const userRoutes = require('./routes/account');
const blogsRoute = require('./routes/posts');
const mainRoute = require('./routes/main');

//connection
mongoose.connect(CONFIG.database, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Database Connection established');
    }
})

//to route all account related api
app.use('/api/accounts', userRoutes);
app.use('/api/blogs', blogsRoute);
app.use('/api/main', mainRoute);

app.listen(CONFIG.port, err => {
    console.log(`localhost:${CONFIG.port} to open the server`);
});