
'use strict';

let instance = null;
export default class Server {

  constructor (server_url) {
    if (instance) {
      throw "Server() only allow to construct once";
    }
    this._host = server_url;
    instance = this;
    this._session = {};
  }

  static get instance() {
    if (!instance) throw "Server() need to construct first";
    return instance;
  }

  get host() {
      return this._host;
    }
  get session() {
    return this._session;
  }

  _callServer(path, mode = 'GET', body) {
    return new Promise( (resolve, reject) => {
       // Instantiates the XMLHttpRequest
       var client = new XMLHttpRequest();
       client.open(mode, this._host  + path);
       client.setRequestHeader ("Authorization", "OAuth " + "Junk");
       client.setRequestHeader('Cache-Control', 'no-cache');
       client.withCredentials = true;
       if (mode === 'POST') {
         console.log ('_callServer: POSTING to ['+this._host  + path+']: ' + JSON.stringify(body));
         client.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
         client.send(JSON.stringify(body));
       } else {
         client.send();
       }
       client.onload = function () {
         if (this.status == 200) {
           // Performs the function "resolve" when this.status is equal to 200
           //console.log ('got records : ' + this.response);
           resolve(JSON.parse(this.response));
         } else {
           // Performs the function "reject" when this.status is different than 200
           reject(this.response);
         }
       };
       client.onerror = function (e) {
         reject("Network Error: " + this.statusText);
       };
     });
  }


  connectClient() {
    return new Promise( (resolve, reject) => {
      let timestamp = new Date().getTime();
      this._callServer('/ping?time=' + timestamp).then ((res1) => {
          let pingt = new Date().getTime() - res1.pings.time,
              longPromis = this._callServer('/longPoll?time=' + pingt);
          resolve ({ping: pingt, connection: longPromis});
      });
    });
  }

  logOut() {
    return this._callServer(this.ROUTES.auth + 'logout').then(succ => {
      this.clearApp();
      this._session = {};
    });
  }

  loadApp(appid) {

    return this._callServer(this.ROUTES.dform + 'loadApp/' + (appid && ("?appid=" + appid) || '')).then(val => {
      this._appMeta = val.appMeta || [];
      this._session = val.session;
      this._currentApp = val.app;
    });
  }
}