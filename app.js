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
const Redis = require('ioredis'),
      REDIS_DB = "4",
      redis_url = `redis://localhost:6379/${REDIS_DB}`,
      redis = new Redis(redis_url, {
        enableOfflineQueue: true,
        reconnectOnError: function (err) {
          console.log(`redis reconnectOnError ${err}`);
        },
        retryStrategy: function (times) {
          var delay = Math.min(times * 2, 2000);
          return delay;
        }
      }),
      redis_subscibe = new Redis(redis_url, {
        enableOfflineQueue: true,
        reconnectOnError: function (err) {
          console.log(`redis reconnectOnError ${err}`);
        },
        retryStrategy: function (times) {
          var delay = Math.min(times * 2, 2000);
          return delay;
        }
      })

// enableOfflineQueue
// When a command can't be processed by Redis 
// (being sent before the ready event), by default, 
// it's added to the offline queue and will be executed when it can be processed

redis.on("connect", (c) => console.log ('redis connected'));
redis.on("ready", (c) => console.log ('redis ready'));
redis.on("error", (c) => console.log (`error ${c}`));


const os = require('os');
// add to head of list
const HASH_CURRENT_PROCESSES_KEY = "current_instance_stats";
var process_num = 0,
    started = new Date().getTime(),
    hostname = os.hostname(),
    requestscomplete = 0,
    requestsstarted = 0,
    requestsavgtime = 0

// Record this node process in HASH_CURRENT_PROCESSES_KEY
const NODE_PING_INTERVAL = 10;
redis.incr(`${HASH_CURRENT_PROCESSES_KEY}:counter`).then((r) => {
  process_num = r;
  let updateRedisProcess = () => {
    let key = `${HASH_CURRENT_PROCESSES_KEY}:${process_num}`, 
        reqcomp = requestscomplete,
        reqopen = requestsstarted,
        reqtime = requestsavgtime;
    requestscomplete = 0; requestsstarted = 0; requestsavgtime = 0;
    console.log (`write node status: ${process_num}`);
    redis.multi()
      .hmset (key, {
        "starttime": started,
        "hostname": hostname,
        "uptime": new Date().getTime() - started,
        "reqcomp": reqcomp,
        "reqopen": reqopen,
        "reqtime": reqtime
      })
    .expire(key, NODE_PING_INTERVAL + 2).exec(() => {
      //console.log ('updated redis')
    });
  }
  updateRedisProcess()
  setInterval (() => {
    updateRedisProcess()
  }, NODE_PING_INTERVAL * 1000)

})

// Update stats from this node process in HASH_CURRENT_PROCESSES_KEY each second
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

const HASH_CURRENT_CLIENT_CONNECTION_KEY = "current_client",
      CLIENT_EVENT_LIST = "client_events";

app.get('/connect', function(req, res) {
  let sess = req.session.id,
      t = req.query.time, 
      st = new Date().getTime();
  //console.log ('pingme ' + t);
  //requestscomplete++;
  //redis.lpush(CLIENT_EVENT_LIST, `ping:${sess}`);

  // clear any remaining timesouts for this session
  let lval = longpolls_all.get (sess)
  if (lval && lval.gotlong) {
    clearTimeout(longpolls_to.get (sess))
  }
  longpolls_all.set (sess, {gotlong: false, sendbuffer: []})
  res.json({ original_time: t, server_time: st});
});

const LONGPOLLL_DURATION = 30;
var longpolls_all = new Map(), longpolls_to = new Map();
app.get('/longPoll', function(req, res) {
  let sess = req.session.id,
      time = req.query.time,
      offset = req.query.offset,
      key = `${HASH_CURRENT_CLIENT_CONNECTION_KEY}:${sess}`;

  // if we get a update ping time, update redis CURRENT_PROCESSES, this will get send to all clients
  if (time && offset) {
    console.log (`/longPoll: got request from: ${sess}`);
    redis.multi()
      .hmset (key, { 
          "sid": sess,
          "process_key": `${process_num}`,
          "ping": time,
          "useragent": req.headers['user-agent'],
          "ip": req.headers['x-forwarded-for'] || req.connection.remoteAddress
        })
      .lpush(CLIENT_EVENT_LIST, `poll:${sess}`)
      .expire(key, LONGPOLLL_DURATION + 2).exec(() => {
        // ok
      });
  }

  let lval = longpolls_all.get (sess);
  if (!lval) { // if existing user
    res.status(500).send('no data on your client');
  } else if (lval.sendbuffer.length > 0) {

  } else {
    console.log (`/longPoll: holding request in longpolls_all`);
    longpolls_all.set (sess, {gotlong: true, res: res, sendbuffer: lval.sendbuffer});
    longpolls_to.set (sess, setTimeout(sendBackToClient, LONGPOLLL_DURATION*1000, sess, true));
  }
});

let sendBackToClient = (id, keepalive) => {
        console.log (`sendBackToClient: session: ${id}`);
        //longpolls_all.delete(req.session.id);
        let lval = longpolls_all.get (id);
        if (lval && lval.gotlong) {
          requestscomplete++;
          lval.res.json({keepalive: keepalive, data: lval.sendbuffer});
          longpolls_all.set (id, {gotlong: false, sendbuffer: []});
        }
      }

//redis.lpush(CLIENT_EVENT_LIST, `${message}:${sid}`);
let notify_polls = (sid, data, immidate) => {
  console.log (`notify_polls: notify longpolls (${longpolls_all.size}) message from ${sid}`);
  for (let lsid of longpolls_all.keys()) {
      //console.log (`checking ${lsid}`);
    if (lsid !== sid) { // dont push messages broadcast from original sender
      let lval = longpolls_all.get(lsid);
      if (lval) {
        // add to data
        longpolls_all.set (lsid, {gotlong: lval.gotlong, res: lval.res, sendbuffer: lval.sendbuffer.concat(data)});
        if (lval.gotlong === true ) {
          if (immidate) {
            clearTimeout(longpolls_to.get (lsid))
            sendBackToClient(lsid, false)
          } else if (!lval.accelerate) {
            // data waiting, so accelerate backtoclient to 3 seconds.
            longpolls_all.set (lsid, Object.assign ({accelerate: true}, longpolls_all.get(lsid)));
            clearTimeout(longpolls_to.get (lsid))
            longpolls_to.set (lsid, setTimeout(sendBackToClient, 3000, lsid, false));
          }
        } 
      }
    }
  }
}

// require CONFIG SET notify-keyspace-events Khx
redis.config("SET", "notify-keyspace-events", "Khx");

const SUBSCRIBE_CHANNEL_PATTERN = `__keyspace@${REDIS_DB}__:current_*:*`;
redis_subscibe.psubscribe(SUBSCRIBE_CHANNEL_PATTERN,  (err, count) => {
  if (err) {
    console.log (`redis_subscibe error ${JSON.stringify(err)}`);
    exit (1);
  } else
    console.log (`redis_subscibe (${count}) now subscribed to {${SUBSCRIBE_CHANNEL_PATTERN}`);
})
redis_subscibe.on("connect", (c) => console.log ('redis_subscibe connected'));
redis_subscibe.on("ready", (c) => console.log ('redis_subscibe ready'));
redis_subscibe.on("error", (c) => console.log (`redis_subscibe error ${c}`));
redis_subscibe.on('pmessage', function (pattern, channel, message) {
  console.log (`redis_subscibe: message "${channel}":  "${message}"`);

  let rediskey = channel.substr(channel.indexOf ('__:')+3),
      [key, _id] = rediskey.split(':');
  if (message === "hset") {
    redis.hgetall (rediskey).then((data) => {
      notify_polls (_id, {'key': key, 'op': 'update', 'id': _id, 'data': data}, false);
    })
  } else if (message === "expired") {
    notify_polls (_id, {'key': key, 'op': 'remove', 'id': _id,}, true);
  }
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
