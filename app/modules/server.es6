
'use strict';

let instance = null;
export default class Server {

  constructor (server_url) {
    if (instance) {
      throw "Server() only allow to construct once";
    }
    this._host = server_url;
    this._offset = 0;
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
      client.setRequestHeader('Cache-Control', 'no-cache, no-store'); 

      if (navigator.appVersion.indexOf('Edge') > -1)
        client.setRequestHeader('Pragma', 'no-cache'); 

      client.withCredentials = true;

      // catch network errors
      client.onreadystatechange = function() {
        if (this.readyState == 4 && this.status != 200)
          reject(`catch error: ${this.response}`); 
      }
      

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
           reject(`bad response:: ${this.response}`);
         }
       };
       client.onerror = function (e) {
         reject("connection error:: " + this.statusText);
       };
     });
  }


  connectClient() {
    return new Promise( (resolve, reject) => {
      this._callServer('/connect?time=' + new Date().getTime()).then (({original_time, server_time}) => {
        let client_timeroundtrip = (new Date().getTime() - original_time)/2
        this._offset = parseInt(server_time) - parseInt(original_time) + client_timeroundtrip
        console.log (`connectClient: got /connect client_timeroundtrip: ${client_timeroundtrip}, server/client time diff: ${this._offset}`);
        resolve (client_timeroundtrip);
      }, reject);
    });
  }
  get offset() {
      return this._offset;
    }

  longPoll (register_ptime) {
     return this._callServer('/longPoll' + (register_ptime && ('?time=' + register_ptime) || ''))
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