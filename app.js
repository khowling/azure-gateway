const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// KH - Added for Session
// redis://:authpassword@127.0.0.1:6378/4
/* -- redis-cli commands
  > select 4
  > INFO keyspace
  > CONFIG GET databases
*/
const Redis = require('ioredis');
const redis = new Redis('redis://localhost:6379/4', {
  enableOfflineQueue: true,
  reconnectOnError: function (err) {
    console.log(`redis err ${err}`);
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

const os = require('os');
// add to head of list
var nodeprocess = 0,
    started = new Date().getTime();
    requestscomplete = 0,
    requestsstarted = 0,
    requestsavgtime = 0;
redis.incr('nodeprocess').then((r) => {
  nodeprocess = r;
  let key = `nodeprocess:${nodeprocess}`;
  console.log (`redis ${key}`)
  redis.multi()
    .hmset (key, { 
        starttime: new Date(),
        "hostname": os.hostname()
      })
    .expire(key, 2).exec(() => console.log ('updated redis'));
})

// every second write a new value
setInterval (() => {
  let key = `nodeprocess:${nodeprocess}`, 
      reqcomp = requestscomplete,
      reqopen = requestsstarted,
      reqtime = requestsavgtime;
  requestscomplete = 0; requestsstarted = 0; requestsavgtime = 0;
  redis.multi()
    .hmset (key, {
      "uptime": new Date().getTime() - started,
      "reqcomp": reqcomp,
      "reqopen": reqopen,
      "reqtime": reqtime
    })
  .expire(key, 2).exec(() => console.log ('updated redis'));
}, 1000)

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
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Authorization,Content-Type,Cache-Control");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  //res.header("Access-Control-Allow-Headers", "Authorization");
  //res.header("Access-Control-Allow-Headers", "application/json;charset=UTF-8");
  if (req.method === 'OPTIONS')
    res.send();
  else {
    requestsstarted++;
    next();
  }
});

app.get('/nothing', function(req, res) {
      requestscomplete++;
      res.send();
});

app.get('/ping', function(req, res) {
  let t = req.query.time, st = new Date().getTime();
  console.log ('pingme ' + t);
  requestscomplete++;
  res.json({pings: { time: t, stime: st}});
});

app.get('/longPoll', function(req, res) {
  let t = req.query.time;

 // if (t) {
    console.log ('holding longPoll' + t + ' : ' + JSON.stringify(req.session.id));
    req.session.clientPing = t;

    redis.multi()
      .hmset (`clientconnected:${req.session.id}`, { 
          "nodeprocess": `nodeprocess:${nodeprocess}`,
          "ping": t,
          "useragent": req.headers['user-agent'],
          "ip": req.headers['x-forwarded-for'] || req.connection.remoteAddress
        })
      .expire(`clientconnected:${req.session.id}`, 8).exec(() => console.log ('updated redis, 8 sec ttl'));

    let lp = setTimeout(() => {
      requestscomplete++;
      res.json({keepalive: true});
    }, 5000) // 5 second longpoll;

//  } else {
 //   requestscomplete++;
 //   res.send();
 // }
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
