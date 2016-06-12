var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// KH - Added for Session
var Redis = require('ioredis');
// redis://:authpassword@127.0.0.1:6378/4
/* -- redis-cli commands
  > select 4
  > INFO keyspace
  > CONFIG GET databases
*/
var redis = new Redis('redis://localhost:6379/4', {
  enableOfflineQueue: true,
  reconnectOnError: function (err) {
    console.log('redis err');
  },
  retryStrategy: function (times) {
    var delay = Math.min(times * 2, 2000);
    return delay;
  }
});

// enableOfflineQueue
// When a command can't be processed by Redis 
// (being sent before the ready event), by default, 
// it's added to the offline queue and will be executed when it can be processed

redis.on("connect", (c) => console.log ('redis connected'));
redis.on("ready", (c) => console.log ('redis ready'));
redis.on("error", (c) => console.log (`error ${c}`));

redis.subscribe('channel1', function (err, count) {

});



var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var app = express();

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new RedisStore({client: redis}),
    secret: 'keyboard cat',
     resave: false,
     saveUninitialized : true
}));

// This is requried if serving client app from react hot loader, and server from node (different ports)
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Authorization,Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  //res.header("Access-Control-Allow-Headers", "Authorization");
  //res.header("Access-Control-Allow-Headers", "application/json;charset=UTF-8");
  if (req.method === 'OPTIONS')
    res.send();
  else
    next();
});

app.get('/ping', function(req, res) {
  let t = req.query.time, st = new Date().getTime();
  console.log ('pingme ' + t);

  req.session.client = {
    'username': "who are you dude?",
    'user-agent': req.headers['user-agent'],
    'ip': req.headers['x-forwarded-for'] || req.connection.remoteAddress
  };

  res.json({pings: { time: t, stime: st}});
});

app.get('/reportPing', function(req, res) {
  let t = req.query.time;
  console.log ('pingme report ' + t + ' : ' + JSON.stringify(req.session.client));
  req.session.clientPing = t;
  res.json({});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

/*
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
      message: 'dev error : ' + err.message,
      error: err
    });
  });
}
/*
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({message: 'prod error: ' + err.message, error: {}});
});
*/

module.exports = app;
