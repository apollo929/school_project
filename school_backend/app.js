const express = require('express');
const cors = require('cors');
const multer = require("multer");
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');
require('dotenv').config();

const indexRouter = require('./routes');
// initialize our express app
const app = express();
app.use(cors());

app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var storage = multer.diskStorage({

    destination: "./public/images",
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

var upload = multer({ storage: storage }).array('file');

app.use('/api', indexRouter);
module.exports = app;
