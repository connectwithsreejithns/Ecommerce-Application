var createError = require('http-errors');
var express = require('express');
////b
var bodyParser= require('body-parser');
var fileupload=require('express-fileupload')


///

var db=require('./config/connection')//C)connect to mongodb config
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars')//as a part of A
var session=require('express-session')




var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var { rmSync } = require('fs');

var app = express();
rmSync
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// (A start)lines used to add patrtials and layout,npm install express-handlebars
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials'
}))
//(A end)

///b
app.use(bodyParser.urlencoded({extended: true}))

///to remove caches
app.use(fileupload())
app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next()
});




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
 db.connect((err)=>{ ///C)err is got from callback done on config
  if(err) console.log("Connection error"+err)
  else console.log("Database connected")
 })
 ///session
app.use(session({secret:'Key',cookie:{maxAge:3600000},resave: true,saveUninitialized: true}))
//////////////////////////////////////////////////////////////
app.use('/', userRouter);
app.use('/admin', adminRouter);


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



module.exports = app;
