const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors')
const morgan = require('morgan')
const postRouter = require('./routes/postRoutes');
// const userRouter = require('./routes/userRoutes');

app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/blog', postRouter);
// app.use('/api/blog', userRouter);

module.exports = app;