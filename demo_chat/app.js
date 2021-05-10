var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var passport = require("passport")
var socketio = require('socket.io')
var authen = require("./middleware/authen")
const bodyParser = require("body-parser");


var session = require("express-session")
const mongoose = require('mongoose')
    // const http = require('http')

var app = express();
require("dotenv").config()
require("./config/passport")
    // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: "demo_chat" }))
app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.json());

const indexRouter = require("./routes/IndexRouter")
const loginRouter = require("./routes/LoginRouter")
const signoutRouter = require("./routes/SignoutRouter")

app.use('/login', loginRouter)
app.use('/signout', authen.loginAuthen, signoutRouter)
app.use('/', authen.loginAuthen, indexRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const PORT = 3000
const HOST = process.env.HOST
var server = app.listen(PORT, console.log(HOST + ":" + PORT))

const io = socketio(server)

module.exports = app